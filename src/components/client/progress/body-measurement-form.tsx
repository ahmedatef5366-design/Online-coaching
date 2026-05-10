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

const FIELDS = [
  { key: "weight_kg", labelEn: "Weight (kg)", labelAr: "الوزن (كجم)" },
  { key: "waist_cm", labelEn: "Waist (cm)", labelAr: "الخصر (سم)" },
  { key: "chest_cm", labelEn: "Chest (cm)", labelAr: "الصدر (سم)" },
  { key: "shoulders_cm", labelEn: "Shoulders (cm)", labelAr: "الأكتاف (سم)" },
  { key: "hips_cm", labelEn: "Hips (cm)", labelAr: "الورك (سم)" },
  { key: "left_arm_cm", labelEn: "L. Arm (cm)", labelAr: "الذراع الشمال (سم)" },
  {
    key: "right_arm_cm",
    labelEn: "R. Arm (cm)",
    labelAr: "الذراع اليمين (سم)",
  },
  {
    key: "left_thigh_cm",
    labelEn: "L. Thigh (cm)",
    labelAr: "الفخذ الشمال (سم)",
  },
  {
    key: "right_thigh_cm",
    labelEn: "R. Thigh (cm)",
    labelAr: "الفخذ اليمين (سم)",
  },
  {
    key: "body_fat_percent",
    labelEn: "Body fat %",
    labelAr: "نسبة الدهون %",
  },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

interface Props {
  locale: Locale;
  latest: BodyMeasurement | null;
  history: BodyMeasurement[];
}

export function BodyMeasurementForm({ locale, latest, history }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {locale === "ar" ? "قياسات الجسم" : "Body measurements"}
        </CardTitle>
        <CardDescription>
          {locale === "ar"
            ? "سجّل قياساتك مرة في الأسبوع. أحدث قياس بيتعرض في صفحة التحليل."
            : "Log measurements weekly. Latest values are surfaced to your coach."}
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
              toast.success(
                locale === "ar" ? "تم حفظ القياسات" : "Measurements saved",
              );
              router.refresh();
            });
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <Label htmlFor="measured_on">
              {locale === "ar" ? "التاريخ" : "Date"}
            </Label>
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
                <Label htmlFor={f.key}>
                  {locale === "ar" ? f.labelAr : f.labelEn}
                </Label>
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
              {isPending
                ? locale === "ar"
                  ? "جاري الحفظ…"
                  : "Saving…"
                : locale === "ar"
                  ? "حفظ القياسات"
                  : "Save measurements"}
            </Button>
            {saved ? (
              <span className="text-sm text-primary">
                {locale === "ar" ? "تم الحفظ ✓" : "Saved ✓"}
              </span>
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
              {locale === "ar" ? "أحدث ٦ قياسات" : "Last 6 entries"}
            </p>
            <table className="w-full min-w-[600px] text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="py-2 pe-2 text-start">
                    {locale === "ar" ? "التاريخ" : "Date"}
                  </th>
                  <th className="py-2 pe-2 text-end">kg</th>
                  <th className="py-2 pe-2 text-end">
                    {locale === "ar" ? "خصر" : "Waist"}
                  </th>
                  <th className="py-2 pe-2 text-end">
                    {locale === "ar" ? "صدر" : "Chest"}
                  </th>
                  <th className="py-2 pe-2 text-end">
                    {locale === "ar" ? "ذراع" : "Arm"}
                  </th>
                  <th className="py-2 pe-2 text-end">
                    {locale === "ar" ? "فخذ" : "Thigh"}
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
