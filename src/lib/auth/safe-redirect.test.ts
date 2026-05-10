import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("accepts a same-origin absolute path", () => {
    expect(safeRedirectPath("/admin/dashboard")).toBe("/admin/dashboard");
    expect(safeRedirectPath("/client/progress?tab=weight")).toBe(
      "/client/progress?tab=weight",
    );
  });

  it("trims whitespace", () => {
    expect(safeRedirectPath("  /client/dashboard  ")).toBe("/client/dashboard");
  });

  it("rejects empty / non-string input", () => {
    expect(safeRedirectPath("")).toBeNull();
    expect(safeRedirectPath("   ")).toBeNull();
    expect(safeRedirectPath(undefined)).toBeNull();
    expect(safeRedirectPath(null)).toBeNull();
    expect(safeRedirectPath(123)).toBeNull();
  });

  it("rejects external absolute URLs (open redirect)", () => {
    expect(safeRedirectPath("https://evil.example")).toBeNull();
    expect(safeRedirectPath("http://evil.example/path")).toBeNull();
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeRedirectPath("//evil.example")).toBeNull();
    expect(safeRedirectPath("//evil.example/foo")).toBeNull();
  });

  it("rejects backslash-prefixed paths some browsers normalise to //", () => {
    expect(safeRedirectPath("/\\evil.example")).toBeNull();
  });

  it("rejects schemed paths that are not regular URLs", () => {
    expect(safeRedirectPath("javascript:alert(1)")).toBeNull();
    expect(safeRedirectPath("data:text/html,foo")).toBeNull();
    expect(safeRedirectPath("mailto:a@b.c")).toBeNull();
  });

  it("rejects relative paths", () => {
    expect(safeRedirectPath("dashboard")).toBeNull();
    expect(safeRedirectPath("./dashboard")).toBeNull();
    expect(safeRedirectPath("../etc/passwd")).toBeNull();
  });
});
