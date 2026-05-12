"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logWeight } from "@/lib/tracking/actions";
import { withRollingAverage } from "@/lib/tracking/rolling-average";
import type { WeightLogRow } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n-provider";

interface Props {
  locale: Locale;
  clientId: string;
  weights: WeightLogRow[];
}

export function WeightLogger({ weights }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const weeklyAvg = useMemo(() => {
    if (weights.length === 0) return null;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const last7 = weights.filter((w) => w.log_date >= cutoffStr);
    if (last7.length === 0) return null;
    const sum = last7.reduce((acc, w) => acc + Number(w.weight_kg), 0);
    return Math.round((sum / last7.length) * 10) / 10;
  }, [weights]);

  const chartData = useMemo(
    () =>
      withRollingAverage(
        [...weights].reverse().map((w) => ({
          date: w.log_date.slice(5),
          weight: Number(w.weight_kg),
        })),
      ),
    [weights],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("client.weight.title")}</CardTitle>
        <CardDescription>
          {weeklyAvg !== null
            ? t("client.weight.weekly_average", { kg: weeklyAvg })
            : t("client.weight.log_morning")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setSaved(false);
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const result = await logWeight({
                weight_kg: String(fd.get("weight_kg") ?? ""),
              });
              if (!result.ok) {
                const msg = result.error ?? "Could not save.";
                setError(msg);
                toast.error(msg);
                return;
              }
              setSaved(true);
              toast.success(t("client.weight.logged_toast"));
              (e.target as HTMLFormElement).reset();
              router.refresh();
            });
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <div className="min-w-[140px] flex-1 space-y-1">
            <Label htmlFor="weight_kg">{t("client.weight.weight_label")}</Label>
            <Input
              id="weight_kg"
              name="weight_kg"
              type="number"
              step="0.1"
              min={20}
              max={400}
              required
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? t("common.saving") : t("client.weight.log")}
          </Button>
          {saved ? (
            <span className="text-sm text-primary">
              {t("client.weight.logged")}
            </span>
          ) : null}
        </form>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {chartData.length >= 2 ? (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  name={t("client.weight.chart_weight")}
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  name={t("client.weight.chart_avg")}
                  type="monotone"
                  dataKey="avg"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t("client.weight.chart_empty")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
