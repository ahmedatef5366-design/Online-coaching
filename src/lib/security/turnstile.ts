import "server-only";

/**
 * Cloudflare Turnstile server-side verification.
 *
 * Turnstile is only enforced when both env vars are set:
 *   - NEXT_PUBLIC_TURNSTILE_SITE_KEY   (browser, for the widget)
 *   - TURNSTILE_SECRET_KEY             (server, for this verification call)
 *
 * When either is unset (local dev, previews without a configured site
 * key, etc) we skip verification to keep the apply form usable. That is
 * the recommended Cloudflare pattern — see the widget page for details.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}

export interface TurnstileVerifyResult {
  ok: boolean;
  errorCodes?: string[];
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileVerifyResult> {
  if (!isTurnstileEnabled()) {
    return { ok: true };
  }
  if (!token) {
    return { ok: false, errorCodes: ["missing-input-response"] };
  }

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY as string,
    response: token,
  });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      // Turnstile should not be cached.
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, errorCodes: [`http-${res.status}`] };
    const json = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };
    if (json.success) return { ok: true };
    return { ok: false, errorCodes: json["error-codes"] ?? ["unknown"] };
  } catch (err) {
    console.error("Turnstile verify failed", err);
    return { ok: false, errorCodes: ["network-error"] };
  }
}
