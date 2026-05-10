/**
 * Generate a short, easy-to-read temporary password for a client account.
 *
 * Uses an unambiguous alphabet (no `0/O/1/l/I`) so the coach can read it
 * to the client over voice/WhatsApp without confusion. Backed by Web Crypto
 * when available, falling back to `Math.random` for older Node runtimes.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz";

export function generateTempPassword(length = 12): string {
  const out: string[] = [];
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buf = new Uint32Array(length);
    globalThis.crypto.getRandomValues(buf);
    for (let i = 0; i < length; i += 1) {
      out.push(ALPHABET[buf[i] % ALPHABET.length]);
    }
    return out.join("");
  }
  for (let i = 0; i < length; i += 1) {
    out.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
  }
  return out.join("");
}
