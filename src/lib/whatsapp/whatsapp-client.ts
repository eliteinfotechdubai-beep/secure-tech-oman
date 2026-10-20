/**
 * Thin wrapper over the WhatsApp Cloud API (Meta Graph API).
 *
 * Unlike `shopify-client.ts`, this does NOT throw at module load when the env
 * vars are missing: this module is imported by a route handler, and a top-level
 * throw would turn a missing variable into an import-time crash instead of a
 * handled 500. Configuration is checked per call.
 */

const DEFAULT_GRAPH_VERSION = 'v23.0';
const DEFAULT_TEMPLATE_NAME = 'quote_request_notification';
const DEFAULT_TEMPLATE_LANG = 'en';

/** Graph can hang; don't hold a request open indefinitely behind it. */
const REQUEST_TIMEOUT_MS = 10_000;

/** The subset of Meta's response shape this module relies on. */
interface GraphResponse {
  messages?: Array<{ id?: string }>;
  error?: {
    message?: string;
    code?: number;
    error_data?: { details?: string };
  };
}

export class WhatsAppError extends Error {
  readonly code?: number;
  readonly details?: string;

  constructor(message: string, code?: number, details?: string) {
    super(message);
    this.name = 'WhatsAppError';
    this.code = code;
    this.details = details;
  }
}

/**
 * True when the credentials needed to send are present. Callers use this to
 * distinguish "the site is misconfigured" from "Meta rejected this message".
 */
export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
}

/**
 * Sends one pre-approved template message.
 *
 * `params` must already be sanitized — see `buildQuoteParams` in `./format-quote`.
 * Passing a value containing a newline, a tab or 4+ consecutive spaces makes Meta
 * reject the message with code 132000.
 *
 * Resolves with the message id on success, throws `WhatsAppError` otherwise.
 */
export async function sendWhatsAppTemplate(to: string, params: string[]): Promise<string> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new WhatsAppError('WhatsApp is not configured (missing phone number ID or access token)');
  }

  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;
  const endpoint = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: process.env.WHATSAPP_TEMPLATE_NAME || DEFAULT_TEMPLATE_NAME,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || DEFAULT_TEMPLATE_LANG },
          components: [
            {
              type: 'body',
              parameters: params.map((text) => ({ type: 'text', text })),
            },
          ],
        },
      }),
    });
  } catch (error) {
    // Network failure, DNS, or the timeout above. Never let the token surface here.
    const reason = error instanceof Error ? error.message : 'unknown error';
    throw new WhatsAppError(`Could not reach the WhatsApp API: ${reason}`);
  }

  let payload: GraphResponse | null = null;
  try {
    payload = (await response.json()) as GraphResponse;
  } catch {
    // Fall through to the status check below with a null payload.
  }

  // Graph reports failures both as non-2xx and, in some cases, as a 200 carrying
  // an `error` object — check both rather than trusting the status alone.
  if (!response.ok || payload?.error) {
    const metaError = payload?.error;
    throw new WhatsAppError(
      metaError?.message || `WhatsApp API returned HTTP ${response.status}`,
      metaError?.code,
      metaError?.error_data?.details
    );
  }

  const messageId = payload?.messages?.[0]?.id;
  if (!messageId) {
    throw new WhatsAppError('WhatsApp API accepted the request but returned no message id');
  }

  return messageId;
}
