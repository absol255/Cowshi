// Best-effort brute-force guard for sign-in. State lives in this server instance's memory,
// so on Vercel each warm instance counts separately: it slows guessing, it doesn't stop it.

const MAX_FAILURES = 5;
const WINDOW_MS = 10 * 60_000;
const LOCK_MS = 5 * 60_000;

type Entry = { failures: number; windowStart: number; lockedUntil: number };
const g = globalThis as typeof globalThis & { __cowshiAttempts?: Map<string, Entry> };
const attempts = () => (g.__cowshiAttempts ??= new Map<string, Entry>());

/** Seconds left on a lockout for `key`, or 0 when sign-in is allowed. */
export function lockedFor(key: string): number {
  const entry = attempts().get(key);
  if (!entry) return 0;
  return Math.max(0, Math.ceil((entry.lockedUntil - Date.now()) / 1000));
}

export function recordFailure(key: string) {
  const now = Date.now();
  const map = attempts();
  let entry = map.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    entry = { failures: 0, windowStart: now, lockedUntil: 0 };
    map.set(key, entry);
  }
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) {
    entry.lockedUntil = now + LOCK_MS;
    entry.failures = 0;
    entry.windowStart = now;
  }
  // Keep the map from growing without bound.
  if (map.size > 5000) map.clear();
}

export function clearFailures(key: string) {
  attempts().delete(key);
}
