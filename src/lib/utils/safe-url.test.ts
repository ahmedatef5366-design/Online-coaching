import { describe, expect, it } from "vitest";
import { safeHttpUrl } from "./safe-url";

describe("safeHttpUrl", () => {
  it("accepts http and https URLs", () => {
    expect(safeHttpUrl("https://example.com/foo")).toBe(
      "https://example.com/foo",
    );
    expect(safeHttpUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rejects javascript:, data:, vbscript: and similar schemes", () => {
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("JAVASCRIPT:alert(1)")).toBeNull();
    expect(safeHttpUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeHttpUrl("vbscript:msgbox(1)")).toBeNull();
    expect(safeHttpUrl("file:///etc/passwd")).toBeNull();
  });

  it("returns null for empty / non-string / unparseable input", () => {
    expect(safeHttpUrl(null)).toBeNull();
    expect(safeHttpUrl(undefined)).toBeNull();
    expect(safeHttpUrl("")).toBeNull();
    expect(safeHttpUrl("   ")).toBeNull();
    expect(safeHttpUrl("not a url")).toBeNull();
  });
});
