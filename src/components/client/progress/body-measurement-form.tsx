"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { saveBodyMeasurement } from "@/lib/tracking/actions";
import type { BodyMeasurement } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n-provider";

const FIELDS = [
  { key: "weight_kg", labelKey: "client.measurements.fields.weight_kg" },
  { key: "waist_cm", labelKey: "client.measurements.fields.waist_cm" },
  { key: "chest_cm", labelKey: "client.measurements.fields.chest_cm" },
  { key: "shoulders_cm", labelKey: "client.measurements.fields.shoulders_cm" },
  { key: "hips_cm", labelKey: "client.measurements.fields.hips_cm" },
  { key: "left_arm_cm", labelKey: "client.measurements.fields.left_arm_cm" },
  { key: "right_arm_cm", labelKey: "client.measurements.fields.right_arm_cm" },
  {
    key: "left_thigh_cm",
    labelKey: "client.measurements.fields.left_thigh_cm",
  },
  {
    key: "right_thigh_cm",
    labelKey: "client.measurements.fields.right_thigh_cm",
  },
  {
    key: "body_fat_percent",
    labelKey: "client.measurements.fields.body_fat_percent",
  },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

interface Props {
  locale: Locale;
  latest: BodyMeasurement | null;
  history: BodyMeasurement[];
}

export function BodyMeasurementForm({ latest, history }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t("client.measurements.title")}
        </CardTitle>
        <CardDescription>
          {t("client.measurements.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setSaved(false);
            const fd = new FormData(e.currentTarget);
            const input: Record<string, string> = {};
            FIELDS.forEach((f) => {
              input[f.key] = String(fd.get(f.key) ?? "");
            });
            input.measured_on = String(fd.get("measured_on") ?? "");
            startTransition(async () => {
              const result = await saveBodyMeasurement(input);
              if (!result.ok) {
                const msg = result.error ?? "Could not save.";
                setError(msg);
                toast.error(msg);
                return;
              }
              setSaved(true);
              toast.success(t("client.measurements.saved_toast"));
              router.refresh();
            });
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <Label htmlFor="measured_on">{t("common.date")}</Label>
            <Input
              id="measured_on"
              name="measured_on"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label htmlFor={f.key}>{t(f.labelKey)}</Label>
                <Input
                  id={f.key}
                  name={f.key}
                  type="number"
                  step="0.1"
                  defaultValue={
                    (latest?.[f.key as FieldKey] ?? "") as
                      | string
                      | number
                      | undefined
                  }
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? t("common.saving") : t("client.measurements.save")}
            </Button>
            {saved ? (
              <span className="text-sm text-primary">{t("common.saved")}</span>
            ) : null}
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </form>

        {history.length > 0 ? (
          <div className="overflow-x-auto pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("client.measurements.last_six")}
            </p>
            <table className="w-full min-w-[600px] text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="py-2 pe-2 text-start">{t("common.date")}</th>
                  <th className="py-2 pe-2 text-end">kg</th>
                  <th className="py-2 pe-2 text-end">
                    {t("client.measurements.table_waist")}
                  </th>
                  <th className="py-2 pe-2 text-end">
                    {t("client.measurements.table_chest")}
                  </th>
                  <th className="py-2 pe-2 text-end">
                    {t("client.measurements.table_arm")}
                  </th>
                  <th className="py-2 pe-2 text-end">
                    {t("client.measurements.table_thigh")}
                  </th>
                  <th className="py-2 pe-2 text-end">BF%</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 6).map((h) => (
                  <tr
                    key={h.id}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="py-2 pe-2">{h.measured_on}</td>
                    <td className="py-2 pe-2 text-end tabular-nums">
                      {h.weight_kg ?? "—"}
                    </td>
                    <td className="py-2 pe-2 text-end tabular-nums">
                      {h.waist_cm ?? "—"}
                    </td>
                    <td className="py-2 pe-2 text-end tabular-nums">
                      {h.chest_cm ?? "—"}
                    </td>
                    <td className="py-2 pe-2 text-end tabular-nums">
                      {h.left_arm_cm ?? h.right_arm_cm ?? "—"}
                    </td>
                    <td className="py-2 pe-2 text-end tabular-nums">
                      {h.left_thigh_cm ?? h.right_thigh_cm ?? "—"}
                    </td>
                    <td className="py-2 pe-2 text-end tabular-nums">
                      {h.body_fat_percent ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
