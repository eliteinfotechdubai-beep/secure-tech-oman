/**
 * Formatting for the quote-request WhatsApp notification.
 *
 * The approved template body lives in Meta's WhatsApp Manager, not here, but the
 * PARAMETER ORDER below has to match it exactly or Meta rejects the send with
 * error 132000. Keep this file and the template in sync — the template text is
 * reproduced in SETUP_GUIDE.md.
 *
 * Template `quote_request_notification` (category: Utility, language: en):
 *
 *   New quote request from {{1}}.
 *
 *   Company: {{2}}
 *   Phone: {{3}}
 *   Email: {{4}}
 *
 *   Product: {{5}}
 *   SKU: {{6}}
 *   Quantity: {{7}}
 *
 *   Notes: {{8}}
 *
 *   Open the site admin to follow up on this lead.
 */

export interface QuoteDetails {
  name: string;
  email: string;
  phone: string;
  company: string;
  quantity: string;
  message?: string;
  productName: string;
  productSku?: string;
}

/** Placeholder for optional fields. Parameters may never be empty strings. */
const EMPTY = '—';

/** Cap for the short single-line fields. */
const SHORT_MAX = 80;

/**
 * Rough ceiling for the combined parameter text. Meta limits the rendered body,
 * and the static template copy eats ~170 characters of that, so the free-text
 * message gets whatever is left rather than a fixed cap.
 */
const TOTAL_PARAM_BUDGET = 800;

/**
 * Makes a value safe to pass as a template parameter.
 *
 * Meta rejects the whole message if a parameter contains a newline, a tab, or
 * more than four consecutive spaces — so every run of whitespace collapses to a
 * single space. This matters most for the `message` field, which comes from a
 * multi-line textarea that customers do press Enter in.
 */
export function sanitizeParam(
  value: string | undefined | null,
  maxLength: number = SHORT_MAX,
  fallback: string = EMPTY
): string {
  const cleaned = (value ?? '').replace(/\s+/g, ' ').trim();

  if (!cleaned) return fallback;
  if (cleaned.length <= maxLength) return cleaned;

  return `${cleaned.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
}

/**
 * Builds the 8 body parameters in template order.
 *
 * Returns plain strings; the client wraps them into Meta's
 * `{ type: 'text', text }` shape.
 */
export function buildQuoteParams(quote: QuoteDetails): string[] {
  const leading = [
    sanitizeParam(quote.name),
    sanitizeParam(quote.company),
    sanitizeParam(quote.phone),
    sanitizeParam(quote.email),
    sanitizeParam(quote.productName),
    sanitizeParam(quote.productSku),
    sanitizeParam(quote.quantity),
  ];

  const used = leading.reduce((total, param) => total + param.length, 0);
  const messageBudget = Math.max(SHORT_MAX, TOTAL_PARAM_BUDGET - used);

  return [...leading, sanitizeParam(quote.message, messageBudget, 'None')];
}

/**
 * Reduces a human-entered phone number to the digits-only form Meta's `to`
 * field expects (country code included, no `+`, no spaces).
 */
export function toWhatsAppNumber(raw: string): string {
  return (raw ?? '').replace(/\D/g, '');
}

/**
 * Parses the comma-separated `WHATSAPP_RECIPIENTS` env var into unique,
 * digits-only numbers. Blank and malformed entries are dropped rather than sent,
 * since Meta bills per delivered message.
 */
export function parseRecipients(raw: string | undefined): string[] {
  if (!raw) return [];

  const numbers = raw
    .split(',')
    .map(toWhatsAppNumber)
    // A country code plus a subscriber number is never shorter than this; the
    // check exists to catch stray characters, not to validate real numbers.
    .filter((number) => number.length >= 8);

  return [...new Set(numbers)];
}

/**
 * Plain-text version of the quote for a `wa.me?text=` link.
 *
 * Used when the Cloud API cannot deliver — either because it is not configured
 * yet or because the send failed. Deep links have none of the template
 * restrictions, so this keeps its line breaks.
 */
export function buildQuoteFallbackText(quote: QuoteDetails): string {
  return [
    'New quote request',
    '',
    `Name: ${quote.name || EMPTY}`,
    `Company: ${quote.company || EMPTY}`,
    `Phone: ${quote.phone || EMPTY}`,
    `Email: ${quote.email || EMPTY}`,
    '',
    `Product: ${quote.productName || EMPTY}`,
    `SKU: ${quote.productSku || EMPTY}`,
    `Quantity: ${quote.quantity || EMPTY}`,
    '',
    `Notes: ${quote.message?.trim() || 'None'}`,
  ].join('\n');
}
