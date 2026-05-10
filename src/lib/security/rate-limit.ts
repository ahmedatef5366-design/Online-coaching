/**
 * Lightweight in-memory rate limiter.
 *
 * Each key tracks a list of recent timestamps inside a sliding window.
 * On every call we drop expired timestamps and decide whether the new
 * attempt fits in the budget.
 *
 * Notes:
 *   - Designed for the single-server Node runtime that hosts our server
 *     actions. In a multi-instance / serverless setup this would need to
 *     move to Redis / Upstash; the contract of `checkRateLimit` is small
 *     enough to swap the backend later.
 *   - Pure (Date-based clock can be injected), so it is fully unit-testable.
 */

export interface RateLimitOptions {
  /** Identifier for the bucket (e.g. user id, IP, email). */
  key: string;
  /** Max attempts allowed inside `windowMs`. */
  max: number;
  /** Sliding window length in milliseconds. */
  windowMs: number;
  /** Optional clock — defaults to `Date.now`. Used by tests. */
  now?: () => number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Attempts remaining inside the current window after this call. */
  remaining: number;
  /** Earliest timestamp (ms epoch) at which a new attempt would succeed. */
  retryAt: number;
}

const buckets = new Map<string, number[]>();

export function checkRateLimit(opts: RateLimitOptions): RateLimitResult {
  const now = opts.now ? opts.now() : Date.now();
  const cutoff = now - opts.windowMs;
  const existing = buckets.get(opts.key) ?? [];
  const fresh = existing.filter((t) => t > cutoff);

  if (fresh.length >= opts.max) {
    buckets.set(opts.key, fresh);
    const retryAt = fresh[0] + opts.windowMs;
    return { ok: false, remaining: 0, retryAt };
  }

  fresh.push(now);
  buckets.set(opts.key, fresh);
  return {
    ok: true,
    remaining: opts.max - fresh.length,
    retryAt: now,
  };
}

/** Test helper — drop all in-memory state. */
export function resetRateLimitsForTests(): void {
  buckets.clear();
}

/**
 * Format a human-readable "try again in N seconds" message based on the
 * `retryAt` timestamp returned by `checkRateLimit`.
 */
export function rateLimitMessage(
  retryAt: number,
  locale: "en" | "ar" = "en",
  now: number = Date.now(),
): string {
  const seconds = Math.max(1, Math.ceil((retryAt - now) / 1000));
  if (locale === "ar") {
    return `كثرة محاولات. حاول تاني بعد ${seconds} ثانية.`;
  }
  return `Too many attempts. Try again in ${seconds}s.`;
}
