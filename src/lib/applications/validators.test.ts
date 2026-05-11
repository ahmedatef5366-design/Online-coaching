import { describe, expect, it } from "vitest";
import {
  APPLICATION_TEXT_LIMITS,
  capApplicationText,
} from "./validators";

describe("capApplicationText", () => {
  it("returns null for non-string values", () => {
    expect(capApplicationText(undefined, "notes")).toBeNull();
    expect(capApplicationText(null, "notes")).toBeNull();
    expect(capApplicationText(123, "notes")).toBeNull();
    expect(capApplicationText([], "notes")).toBeNull();
  });

  it("returns null for empty / whitespace-only strings", () => {
    expect(capApplicationText("", "notes")).toBeNull();
    expect(capApplicationText("   ", "notes")).toBeNull();
    expect(capApplicationText("\t\n", "notes")).toBeNull();
  });

  it("returns trimmed strings unchanged when under the limit", () => {
    expect(capApplicationText("  hello  ", "notes")).toBe("hello");
  });

  it("caps oversize strings to the field's configured limit", () => {
    const oversize = "a".repeat(APPLICATION_TEXT_LIMITS.notes + 500);
    const capped = capApplicationText(oversize, "notes");
    expect(capped).not.toBeNull();
    expect(capped!.length).toBe(APPLICATION_TEXT_LIMITS.notes);
  });

  it("uses per-field limits, not a shared one", () => {
    const text = "x".repeat(2_000);
    expect(capApplicationText(text, "phone")?.length).toBe(
      APPLICATION_TEXT_LIMITS.phone,
    );
    expect(capApplicationText(text, "notes")?.length).toBe(text.length);
    // motivation_text allows 4 KB → 2 KB input is preserved in full
    expect(capApplicationText(text, "motivation_text")?.length).toBe(
      text.length,
    );
  });

  it("prevents a single submission from inserting megabytes of text", () => {
    const meg = "z".repeat(2 * 1024 * 1024);
    for (const field of Object.keys(
      APPLICATION_TEXT_LIMITS,
    ) as (keyof typeof APPLICATION_TEXT_LIMITS)[]) {
      const capped = capApplicationText(meg, field);
      expect(capped!.length).toBeLessThanOrEqual(
        APPLICATION_TEXT_LIMITS[field],
      );
    }
  });
});
