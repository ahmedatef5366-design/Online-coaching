import { describe, expect, it } from "vitest";
import { billingPeriodOptions, formatBillingPeriod } from "./format";

describe("formatBillingPeriod", () => {
  it("returns localized labels", () => {
    expect(formatBillingPeriod("monthly", "en")).toBe("/ month");
    expect(formatBillingPeriod("monthly", "ar")).toBe("/ شهر");
    expect(formatBillingPeriod("one_time", "en")).toBe("one-time");
    expect(formatBillingPeriod("one_time", "ar")).toBe("دفعة واحدة");
  });
});

describe("billingPeriodOptions", () => {
  it("includes every billing period", () => {
    const opts = billingPeriodOptions("en");
    expect(opts.map((o) => o.value)).toEqual([
      "monthly",
      "quarterly",
      "biannual",
      "yearly",
      "one_time",
    ]);
  });
});
