import { NextResponse } from 'next/server';
import { NO_CACHE_HEADERS } from '@/lib/http/no-cache';
import {
  buildQuoteParams,
  parseRecipients,
  type QuoteDetails,
} from '@/lib/whatsapp/format-quote';
import { isWhatsAppConfigured, sendWhatsAppTemplate } from '@/lib/whatsapp/whatsapp-client';

// Quote submissions must never be served from a cache, and this route sends a
// billable message per call, so it stays fully dynamic.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** Quantity is free text from the customer; keep it inside sane bounds. */
const MAX_QUANTITY = 1_000_000;

/**
 * Deliberately loose — the goal is to catch typos and obvious junk, not to
 * police valid addresses.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

/**
 * In-memory abuse speed-bump. Every submission costs money once it reaches Meta,
 * and this endpoint is public and unauthenticated.
 *
 * Caveat: this is per server instance and resets on cold start, so it slows down
 * casual abuse rather than preventing it. A determined flood needs WAF rules or a
 * shared store.
 */
const recentRequests = new Map<string, number[]>();

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  // Opportunistic cleanup so the map can't grow without bound.
  for (const [key, timestamps] of recentRequests) {
    const fresh = timestamps.filter((timestamp) => timestamp > cutoff);
    if (fresh.length) recentRequests.set(key, fresh);
    else recentRequests.delete(key);
  }

  const timestamps = recentRequests.get(clientId) ?? [];
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) return true;

  recentRequests.set(clientId, [...timestamps, now]);
  return false;
}

function getClientId(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: Request) {
  try {
    const body: QuoteDetails = await request.json();
    const { name, email, phone, company, quantity, message, productName, productSku } = body;

    if (!name || !email || !phone || !company || !quantity || !productName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const parsedQuantity = Number.parseInt(quantity, 10);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > MAX_QUANTITY) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid quantity' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    if (isRateLimited(getClientId(request))) {
      return NextResponse.json(
        { success: false, error: 'Too many quote requests. Please try again in a few minutes.' },
        { status: 429, headers: NO_CACHE_HEADERS }
      );
    }

    // The WhatsApp message is the only record of this lead, so log it before the
    // send. If delivery fails, the request still exists in the server logs.
    console.info(
      'Quote request received:',
      JSON.stringify({ name, email, phone, company, quantity, productName, productSku, message })
    );

    // `deeplink` tells the browser to hand the details to WhatsApp itself. It is
    // returned whenever the server cannot deliver, so the submit button always
    // does something useful — before the Cloud API is set up, and if it breaks
    // afterwards.
    const handOffToBrowser = NextResponse.json(
      { success: true, data: { mode: 'deeplink' } },
      { headers: NO_CACHE_HEADERS }
    );

    const recipients = parseRecipients(process.env.WHATSAPP_RECIPIENTS);

    if (!isWhatsAppConfigured() || !recipients.length) {
      console.warn(
        'WhatsApp Cloud API not configured; handing the quote to the browser deep link instead'
      );
      return handOffToBrowser;
    }

    const params = buildQuoteParams(body);

    // One bad number in the list shouldn't sink the whole request, so send to
    // everyone and treat a single delivery as success.
    const results = await Promise.allSettled(
      recipients.map((recipient) => sendWhatsAppTemplate(recipient, params))
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`WhatsApp send failed for recipient ${index + 1}:`, result.reason);
      }
    });

    const delivered = results.filter((result) => result.status === 'fulfilled').length;

    // Meta rejected every send (bad token, unapproved template, outage). Fall back
    // to the deep link rather than losing the lead.
    if (!delivered) return handOffToBrowser;

    return NextResponse.json(
      { success: true, data: { mode: 'cloud-api', delivered, recipients: recipients.length } },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Error handling quote request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit quote request' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
