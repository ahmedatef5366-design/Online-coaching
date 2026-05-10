import "server-only";
import { Resend } from "resend";

// Default FROM address. Resend's onboarding sender works without verifying
// a custom domain — useful for development. Override EMAIL_FROM with a
// verified domain ("Coaching <noreply@yourdomain.com>") in production.
const DEFAULT_FROM = "Coaching Platform <onboarding@resend.dev>";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; id: string | null; skipped?: false }
  | { ok: true; id: null; skipped: true; reason: string }
  | { ok: false; error: string };

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cachedClient) cachedClient = new Resend(key);
  return cachedClient;
}

/**
 * Send a single transactional email via Resend.
 *
 * No-ops when RESEND_API_KEY is unset — the call returns
 * `{ ok: true, skipped: true }` so callers can treat email delivery as a
 * best-effort side effect rather than a hard dependency. This keeps local
 * dev and unconfigured deployments working without bouncing form submissions.
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const client = getClient();
  if (!client) {
    return { ok: true, id: null, skipped: true, reason: "RESEND_API_KEY unset" };
  }

  const from = process.env.EMAIL_FROM ?? DEFAULT_FROM;
  const replyTo = input.replyTo ?? process.env.EMAIL_REPLY_TO ?? undefined;

  try {
    const { data, error } = await client.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo,
    });
    if (error) {
      console.error("sendEmail Resend error", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("sendEmail threw", err);
    return { ok: false, error: message };
  }
}
