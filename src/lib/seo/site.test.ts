import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { siteUrl } from "./site";

describe("siteUrl", () => {
  // Snapshot the platform env vars we mutate so tests are isolated.
  const KEYS = [
    "NEXT_PUBLIC_SITE_URL",
    "RENDER_EXTERNAL_URL",
    "VERCEL_URL",
  ] as const;
  const original: Partial<Record<(typeof KEYS)[number], string | undefined>> =
    {};

  beforeEach(() => {
    for (const k of KEYS) {
      original[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of KEYS) {
      if (original[k] === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = original[k];
      }
    }
  });

  it("returns the localhost fallback when no env vars are set", () => {
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("uses NEXT_PUBLIC_SITE_URL when set and strips trailing slashes", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://coach.example.com/";
    expect(siteUrl()).toBe("https://coach.example.com");
  });

  it("falls back to RENDER_EXTERNAL_URL when no explicit override is set", () => {
    process.env.RENDER_EXTERNAL_URL =
      "https://coaching-platform-rlhy.onrender.com";
    expect(siteUrl()).toBe("https://coaching-platform-rlhy.onrender.com");
  });

  it("prepends https:// to VERCEL_URL since it has no scheme", () => {
    process.env.VERCEL_URL = "my-app.vercel.app";
    expect(siteUrl()).toBe("https://my-app.vercel.app");
  });

  it("preserves an explicit scheme on VERCEL_URL if one is present", () => {
    process.env.VERCEL_URL = "http://preview.vercel.app";
    expect(siteUrl()).toBe("http://preview.vercel.app");
  });

  it("prefers NEXT_PUBLIC_SITE_URL over Render and Vercel auto-injection", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://coach.example.com";
    process.env.RENDER_EXTERNAL_URL = "https://service.onrender.com";
    process.env.VERCEL_URL = "service.vercel.app";
    expect(siteUrl()).toBe("https://coach.example.com");
  });

  it("prefers RENDER_EXTERNAL_URL over VERCEL_URL", () => {
    process.env.RENDER_EXTERNAL_URL = "https://service.onrender.com";
    process.env.VERCEL_URL = "service.vercel.app";
    expect(siteUrl()).toBe("https://service.onrender.com");
  });

  it("ignores empty / whitespace-only values", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    process.env.RENDER_EXTERNAL_URL = "https://service.onrender.com";
    expect(siteUrl()).toBe("https://service.onrender.com");
  });
});
