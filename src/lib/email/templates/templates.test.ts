import { describe, expect, it } from "vitest";
import { applicationReceivedTemplate } from "./application-received";
import { applicationAcceptedTemplate } from "./application-accepted";

describe("applicationReceivedTemplate", () => {
  it("renders an English subject and includes the first name", () => {
    const tpl = applicationReceivedTemplate({
      fullName: "Ahmed Mostafa",
      locale: "en",
    });
    expect(tpl.subject).toMatch(/received|application/i);
    expect(tpl.html).toContain("Ahmed");
    expect(tpl.text).toContain("Ahmed");
    expect(tpl.html).toContain('dir="ltr"');
  });

  it("renders Arabic markup when locale is ar", () => {
    const tpl = applicationReceivedTemplate({
      fullName: "أحمد مصطفى",
      locale: "ar",
    });
    expect(tpl.html).toContain('dir="rtl"');
    expect(tpl.html).toContain("أحمد");
  });

  it("escapes HTML in user-supplied names", () => {
    const tpl = applicationReceivedTemplate({
      fullName: "<script>alert(1)</script>",
      locale: "en",
    });
    expect(tpl.html).not.toContain("<script>alert(1)</script>");
    expect(tpl.html).toContain("&lt;script&gt;");
  });
});

describe("applicationAcceptedTemplate", () => {
  it("includes the login URL in body and CTA href", () => {
    const tpl = applicationAcceptedTemplate({
      fullName: "Sara",
      locale: "en",
      loginUrl: "https://example.com/login",
    });
    expect(tpl.html).toContain("https://example.com/login");
    expect(tpl.text).toContain("https://example.com/login");
    expect(tpl.html.toLowerCase()).toContain("log in");
  });

  it("uses RTL direction and Arabic CTA copy when locale is ar", () => {
    const tpl = applicationAcceptedTemplate({
      fullName: "سارة",
      locale: "ar",
      loginUrl: "https://example.com/login",
    });
    expect(tpl.html).toContain('dir="rtl"');
    expect(tpl.html).toContain("ادخل");
  });
});
