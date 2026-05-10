"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { saveCheckin } from "@/lib/tracking/actions";
import type { DailyCheckin } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  locale: Locale;
  initial: DailyCheckin | null;
}

export function CheckinForm({ locale, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(initial?.workout_done ?? "yes");
  const [cardioDone, setCardioDone] = useState(initial?.cardio_done ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {locale === "ar" ? "تشيك إن اليوم" : "Today"}
        </CardTitle>
        <CardDescription>
          {initial
            ? locale === "ar"
              ? "اتسجّل قبل كده — هتعدله بدل ما تضيف يومك تاني."
              : "Already submitted — save again to update."
            : locale === "ar"
              ? "كل الحقول إجبارية ما عدا الملاحظات."
              : "All fields required except notes."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setSaved(false);
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const result = await saveCheckin({
                workout_done: String(fd.get("workout_done") ?? "yes"),
                workout_sets_done: String(fd.get("workout_sets_done") ?? ""),
                diet_compliance: String(fd.get("diet_compliance") ?? ""),
                cardio_done: String(fd.get("cardio_done") ?? "off"),
                cardio_minutes: String(fd.get("cardio_minutes") ?? ""),
                sleep_quality: String(fd.get("sleep_quality") ?? ""),
                sleep_hours: String(fd.get("sleep_hours") ?? ""),
                client_note: String(fd.get("client_note") ?? ""),
              });
              if (!result.ok) {
                setError(result.error ?? "Could not save.");
                return;
              }
              setSaved(true);
              router.refresh();
            });
          }}
          className="space-y-4"
        >
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              {locale === "ar" ? "تمرنت اليوم؟" : "Did you train today?"}
            </legend>
            <div className="flex flex-wrap gap-3 text-sm">
              {(["yes", "partial", "no"] as const).map((s) => (
                <label key={s} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="workout_done"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                  />
                  {s === "yes"
                    ? locale === "ar"
                      ? "آه"
                      : "Yes"
                    : s === "partial"
                      ? locale === "ar"
                        ? "جزئي"
                        : "Partial"
                      : locale === "ar"
                        ? "لأ"
                        : "No"}
                </label>
              ))}
            </div>
            {status === "partial" ? (
              <div className="space-y-1">
                <Label htmlFor="workout_sets_done">
                  {locale === "ar" ? "كم سيت عملت؟" : "How many sets?"}
                </Label>
                <Input
                  id="workout_sets_done"
                  name="workout_sets_done"
                  type="number"
                  min={0}
                  defaultValue={initial?.workout_sets_done ?? ""}
                />
              </div>
            ) : null}
          </fieldset>

          <div className="space-y-1">
            <Label htmlFor="diet_compliance">
              {locale === "ar"
                ? "الالتزام بالتغذية (٠–١٠٠٪)"
                : "Diet compliance (0–100%)"}
            </Label>
            <Input
              id="diet_compliance"
              name="diet_compliance"
              type="number"
              min={0}
              max={100}
              defaultValue={initial?.diet_compliance ?? ""}
              required
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              {locale === "ar" ? "كارديو" : "Cardio"}
            </legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="cardio_done"
                checked={cardioDone}
                onChange={(e) => setCardioDone(e.target.checked)}
              />
              {locale === "ar" ? "اتعمل كارديو" : "Did cardio"}
            </label>
            {cardioDone ? (
              <div className="space-y-1">
                <Label htmlFor="cardio_minutes">
                  {locale === "ar" ? "المدة (دقائق)" : "Minutes"}
                </Label>
                <Input
                  id="cardio_minutes"
                  name="cardio_minutes"
                  type="number"
                  min={0}
                  defaultValue={initial?.cardio_minutes ?? ""}
                />
              </div>
            ) : null}
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="sleep_quality">
                {locale === "ar" ? "جودة النوم (١–٥)" : "Sleep quality (1–5)"}
              </Label>
              <Input
                id="sleep_quality"
                name="sleep_quality"
                type="number"
                min={1}
                max={5}
                defaultValue={initial?.sleep_quality ?? ""}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sleep_hours">
                {locale === "ar" ? "ساعات النوم" : "Sleep hours"}
              </Label>
              <Input
                id="sleep_hours"
                name="sleep_hours"
                type="number"
                step="0.5"
                min={0}
                max={24}
                defaultValue={initial?.sleep_hours ?? ""}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="client_note">
              {locale === "ar"
                ? "ملاحظات للكوتش (اختياري)"
                : "Notes for coach (optional)"}
            </Label>
            <Input
              id="client_note"
              name="client_note"
              defaultValue={initial?.client_note ?? ""}
              maxLength={500}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {saved ? (
            <p className="text-sm text-primary">
              {locale === "ar" ? "تم الحفظ ✓" : "Saved ✓"}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? locale === "ar"
                  ? "جاري الحفظ…"
                  : "Saving…"
                : locale === "ar"
                  ? "حفظ التشيك إن"
                  : "Save check-in"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
