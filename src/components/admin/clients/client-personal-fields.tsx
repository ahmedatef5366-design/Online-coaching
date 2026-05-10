"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  locale: Locale;
  defaults?: {
    age?: number | null;
    height_cm?: number | null;
    starting_weight_kg?: number | null;
    experience_level?: string | null;
    goal?: string | null;
    health_notes?: string | null;
    start_date?: string | null;
    target_date?: string | null;
  };
}

const T = {
  age: { en: "Age", ar: "العمر" },
  height: { en: "Height (cm)", ar: "الطول (سم)" },
  weight: { en: "Starting weight (kg)", ar: "الوزن الابتدائي (كجم)" },
  experience: { en: "Experience level", ar: "مستوى الخبرة" },
  goal: { en: "Training goal", ar: "هدف التمرين" },
  health: { en: "Health notes / injuries", ar: "ملاحظات صحية / إصابات" },
  start: { en: "Start date", ar: "تاريخ البداية" },
  target: { en: "Target date", ar: "تاريخ مستهدف" },
  any: { en: "—", ar: "—" },
} as const;

const EXPERIENCE: { value: string; en: string; ar: string }[] = [
  { value: "beginner", en: "Beginner", ar: "مبتدئ" },
  { value: "intermediate", en: "Intermediate", ar: "متوسط" },
  { value: "advanced", en: "Advanced", ar: "متقدم" },
];

const GOALS: { value: string; en: string; ar: string }[] = [
  { value: "fat_loss", en: "Fat loss", ar: "خسارة دهون" },
  { value: "muscle_gain", en: "Muscle gain", ar: "زيادة عضلية" },
  { value: "recomposition", en: "Body recomposition", ar: "تنحيف وتضخيم" },
  {
    value: "athletic_performance",
    en: "Athletic performance",
    ar: "أداء رياضي",
  },
];

export function ClientPersonalFields({ locale, defaults }: Props) {
  const v = defaults ?? {};
  return (
    <div className="space-y-4">
      <h3 className="font-display text-base font-semibold">
        {locale === "ar" ? "بيانات العميل" : "Personal info"}
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="age">{T.age[locale]}</Label>
          <Input
            id="age"
            name="age"
            type="number"
            min={10}
            max={100}
            defaultValue={v.age ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height_cm">{T.height[locale]}</Label>
          <Input
            id="height_cm"
            name="height_cm"
            type="number"
            step="0.1"
            min={100}
            max={250}
            defaultValue={v.height_cm ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="starting_weight_kg">{T.weight[locale]}</Label>
          <Input
            id="starting_weight_kg"
            name="starting_weight_kg"
            type="number"
            step="0.1"
            min={30}
            max={300}
            defaultValue={v.starting_weight_kg ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="experience_level">{T.experience[locale]}</Label>
          <select
            id="experience_level"
            name="experience_level"
            defaultValue={v.experience_level ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{T.any[locale]}</option>
            {EXPERIENCE.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt[locale]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal">{T.goal[locale]}</Label>
          <select
            id="goal"
            name="goal"
            defaultValue={v.goal ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{T.any[locale]}</option>
            {GOALS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt[locale]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="health_notes">{T.health[locale]}</Label>
        <Textarea
          id="health_notes"
          name="health_notes"
          rows={3}
          defaultValue={v.health_notes ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">{T.start[locale]}</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={v.start_date ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target_date">{T.target[locale]}</Label>
          <Input
            id="target_date"
            name="target_date"
            type="date"
            defaultValue={v.target_date ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
