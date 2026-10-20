/**
 * Stops the CDN in front of the app (Amplify/CloudFront) and the browser from
 * replaying an old response after the server-side caches were turned off.
 *
 * Routes that use this also need the segment config that disables Next's own
 * caching, written literally so the build-time analyzer can read it:
 *
 *   export const dynamic = 'force-dynamic';   // no build-time prerender / ISR cache
 *   export const revalidate = 0;              // no segment cache lifetime
 *   export const fetchCache = 'force-no-store'; // no Data Cache for inner fetches
 */
export const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
} as const;
