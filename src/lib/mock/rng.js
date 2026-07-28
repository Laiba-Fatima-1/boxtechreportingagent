/**
 * Deterministic pseudo-random source.
 *
 * WHY THIS EXISTS: mock data is generated at module scope, which runs on the
 * server during prerender AND in the browser on hydrate. `Math.random()` would
 * produce different values in each pass and React would throw a hydration
 * mismatch. A seeded generator produces identical output everywhere, so the
 * mock data behaves like real fetched data.
 *
 * Replace this whole module when the reporting API lands.
 */

/** mulberry32 — small, fast, good enough distribution for fixtures. */
export function rng(seed = 0x9e3779b9) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export const int = (r, min, max) => Math.floor(r() * (max - min + 1)) + min;
export const float = (r, min, max, dp = 2) =>
  Number((r() * (max - min) + min).toFixed(dp));
export const chance = (r, p) => r() < p;

/** Weighted pick: entries are [value, weight]. Keeps funnels realistically shaped. */
export function weighted(r, entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [v, w] of entries) {
    if ((x -= w) <= 0) return v;
  }
  return entries[entries.length - 1][0];
}

/** ISO date N days before the fixed "today" of this dataset. */
export const DATASET_TODAY = new Date("2026-07-27T00:00:00Z");

export function daysBefore(n) {
  const d = new Date(DATASET_TODAY);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}
