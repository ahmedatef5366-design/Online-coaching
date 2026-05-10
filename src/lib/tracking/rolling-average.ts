/**
 * Rolling average helpers for time-series chart overlays.
 *
 * The master prompt asks for "weekly average trend line overlay" on the
 * weight chart — the easiest interpretation is a 7-day moving average that
 * smooths daily noise. Each output point is the mean of the most recent
 * `windowDays` entries (including itself), capped to 1 decimal place.
 */

interface Point {
  date: string;
  weight: number;
}

export function withRollingAverage(
  data: Point[],
  windowDays = 7,
): Array<Point & { avg: number | null }> {
  if (data.length === 0) return [];
  const result: Array<Point & { avg: number | null }> = [];
  for (let i = 0; i < data.length; i += 1) {
    const start = Math.max(0, i - windowDays + 1);
    const window = data.slice(start, i + 1);
    if (window.length < Math.min(windowDays, 2)) {
      result.push({ ...data[i], avg: null });
      continue;
    }
    const sum = window.reduce((acc, p) => acc + p.weight, 0);
    const avg = Math.round((sum / window.length) * 10) / 10;
    result.push({ ...data[i], avg });
  }
  return result;
}
