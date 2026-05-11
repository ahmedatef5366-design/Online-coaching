import { describe, expect, it } from "vitest";
import { generateTempPassword } from "./temp-password";

const ALLOWED = /^[A-HJ-NP-Za-hj-km-np-z2-9]+$/;

describe("generateTempPassword", () => {
  it("returns the requested length", () => {
    expect(generateTempPassword().length).toBe(12);
    expect(generateTempPassword(20).length).toBe(20);
  });

  it("uses only the unambiguous alphabet (no 0/O/1/l/I)", () => {
    for (let i = 0; i < 200; i += 1) {
      const pw = generateTempPassword();
      expect(ALLOWED.test(pw)).toBe(true);
      expect(pw).not.toMatch(/[0O1lI]/);
    }
  });

  it("produces high-entropy output (no trivial duplicates over many calls)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i += 1) seen.add(generateTempPassword());
    // 500 16-char passwords from an alphabet of 55 → collisions astronomically
    // unlikely. Anything <500 means we accidentally regressed to a weak RNG.
    expect(seen.size).toBe(500);
  });
});
