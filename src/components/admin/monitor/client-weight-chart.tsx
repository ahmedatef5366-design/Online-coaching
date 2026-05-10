"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightLogRow } from "@/types/database";

export function ClientWeightChart({ weights }: { weights: WeightLogRow[] }) {
  if (weights.length < 2) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Need at least two entries to draw a trend line.
      </p>
    );
  }
  const data = [...weights]
    .reverse()
    .map((w) => ({ date: w.log_date.slice(5), weight: Number(w.weight_kg) }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
