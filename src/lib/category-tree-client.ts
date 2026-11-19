// Browser-side: the header, mobile menu, category nav and product grid all show the same
// category tree. They used to request /api/collections/organized separately (twice each in
// dev, under React Strict Mode), and every request cost Shopify a full tree query. They now
// share one request, reused for 5 minutes. A failed request is not kept, so the next caller
// tries again.
const REUSE_MS = 5 * 60 * 1000;

let shared: { at: number; request: Promise<unknown[]> } | null = null;

export function fetchOrganizedCategories<T>(): Promise<T[]> {
  if (!shared || Date.now() - shared.at >= REUSE_MS) {
    const entry = {
      at: Date.now(),
      request: fetch("/api/collections/organized").then(async (response) => {
        if (!response.ok) throw new Error(`Categories request failed: HTTP ${response.status}`);
        const data = await response.json();
        return (data.data || []) as unknown[];
      }),
    };
    shared = entry;
    entry.request.catch(() => {
      if (shared === entry) shared = null;
    });
  }

  return shared.request as Promise<T[]>;
}
