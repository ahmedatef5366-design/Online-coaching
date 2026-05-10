import { describe, expect, it } from "vitest";
import { withRollingAverage } from "./rolling-average";

describe("withRollingAverage", () => {
  it("returns an empty array for empty input", () => {
    expect(withRollingAverage([])).toEqual([]);
  });

  it("returns null for the very first point (window of 1)", () => {
    const result = withRollingAverage([{ date: "2025-01-01", weight: 80 }]);
    expect(result).toEqual([{ date: "2025-01-01", weight: 80, avg: null }]);
  });

  it("computes a rolling mean over the configured window", () => {
    const data = [
      { date: "2025-01-01", weight: 80 },
      { date: "2025-01-02", weight: 81 },
      { date: "2025-01-03", weight: 82 },
    ];
    const result = withRollingAverage(data, 3);
    expect(result[0].avg).toBeNull();
    expect(result[1].avg).toBe(80.5);
    expect(result[2].avg).toBe(81);
  });

  it("rounds the average to one decimal place", () => {
    const data = [
      { date: "2025-01-01", weight: 80.123 },
      { date: "2025-01-02", weight: 81.234 },
    ];
    const result = withRollingAverage(data, 2);
    expect(result[1].avg).toBe(80.7);
  });

  it("uses up to windowDays previous points (not exactly windowDays)", () => {
    const data = [
      { date: "2025-01-01", weight: 100 },
      { date: "2025-01-02", weight: 110 },
      { date: "2025-01-03", weight: 120 },
      { date: "2025-01-04", weight: 130 },
      { date: "2025-01-05", weight: 140 },
      { date: "2025-01-06", weight: 150 },
      { date: "2025-01-07", weight: 160 },
      { date: "2025-01-08", weight: 170 },
    ];
    // Default window = 7. The last point should average days 2..8.
    const result = withRollingAverage(data);
    const last = result[result.length - 1];
    expect(last.avg).toBe(140);
  });
});
