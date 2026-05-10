import { describe, it, expect } from "vitest";
import { computeSubscriptionSnapshot } from "./status";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

describe("computeSubscriptionSnapshot", () => {
  const now = new Date("2026-05-10T12:00:00Z");

  it("returns status=none when there's no end date and no trial", () => {
    const snap = computeSubscriptionSnapshot({
      status: "none",
      subscription_ends_at: null,
      now,
    });
    expect(snap.status).toBe("none");
    expect(snap.isActive).toBe(false);
    expect(snap.daysRemaining).toBeNull();
  });

  it("is active when end date is > 7 days away", () => {
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);
    const snap = computeSubscriptionSnapshot({
      status: "active",
      subscription_ends_at: isoDate(endDate),
      now,
    });
    expect(snap.status).toBe("active");
    expect(snap.isActive).toBe(true);
    expect(snap.daysRemaining).toBe(30);
  });

  it("is expiring_soon inside the 7-day window", () => {
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 3);
    const snap = computeSubscriptionSnapshot({
      status: "active",
      subscription_ends_at: isoDate(endDate),
      now,
    });
    expect(snap.status).toBe("expiring_soon");
    expect(snap.isExpiringSoon).toBe(true);
    expect(snap.isActive).toBe(true);
  });

  it("is expired when end date is before today, even if DB says active", () => {
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() - 1);
    const snap = computeSubscriptionSnapshot({
      status: "active",
      subscription_ends_at: isoDate(endDate),
      now,
    });
    expect(snap.status).toBe("expired");
    expect(snap.isActive).toBe(false);
    expect(snap.daysRemaining).toBe(-1);
  });

  it("honours suspended even if end date is in the future", () => {
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 10);
    const snap = computeSubscriptionSnapshot({
      status: "suspended",
      subscription_ends_at: isoDate(endDate),
      now,
    });
    expect(snap.status).toBe("suspended");
    expect(snap.isActive).toBe(false);
  });
});
