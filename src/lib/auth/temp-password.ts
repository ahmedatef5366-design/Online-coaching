/**
 * Generate a short, easy-to-read temporary password for a client account.
 *
 * Uses an unambiguous alphabet (no `0/O/1/l/I`) so the coach can read it
 * to the client over voice/WhatsApp without confusion. Always backed by
 * Web Crypto (CSPRNG) — Node 19+ exposes `globalThis.crypto` and Next.js
 * targets Node 20.10+, so the previous `Math.random` fallback is dead
 * code with weaker security guarantees and has been removed.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz";

export function generateTempPassword(length = 12): string {
  if (typeof globalThis.crypto?.getRandomValues !== "function") {
    throw new Error(
      "generateTempPassword requires Web Crypto. Run on Node 19+ / a modern browser.",
    );
  }
  const buf = new Uint32Array(length);
  globalThis.crypto.getRandomValues(buf);
  const out: string[] = [];
  for (let i = 0; i < length; i += 1) {
    out.push(ALPHABET[buf[i] % ALPHABET.length]);
  }
  return out.join("");
}
