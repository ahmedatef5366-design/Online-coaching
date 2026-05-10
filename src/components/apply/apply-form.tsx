"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCoachingApplication } from "@/lib/applications/actions";
import type { Locale } from "@/lib/i18n/config";
import type { Package } from "@/types/database";
import { TurnstileWidget } from "./turnstile-widget";

interface Props {
  locale: Locale;
  packages: Package[];
  initialPackageId?: string;
  turnstileSiteKey?: string;
}

type StepId =
  | "contact"
  | "goals"
  | "training"
  | "health"
  | "lifestyle"
  | "review";

const STEPS: { id: StepId; en: string; ar: string }[] = [
  { id: "contact", en: "Contact", ar: "التواصل" },
  { id: "goals", en: "Goals", ar: "الأهداف" },
  { id: "training", en: "Training", ar: "التدريب" },
  { id: "health", en: "Health & nutrition", ar: "الصحة والتغذية" },
  { id: "lifestyle", en: "Lifestyle", ar: "نمط الحياة" },
  { id: "review", en: "Review", ar: "المراجعة" },
];

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  preferred_contact: "whatsapp" | "phone" | "email";
  best_contact_time: string;

  age: string;
  gender: "male" | "female" | "other" | "";
  height_cm: string;
  weight_kg: string;
  body_fat_percent: string;

  goal:
    | "fat_loss"
    | "muscle_gain"
    | "recomposition"
    | "athletic_performance"
    | "";
  target_weight_kg: string;
  target_date: string;
  motivation_text: string;

  experience_level: "beginner" | "intermediate" | "advanced" | "";
  previous_coaching: boolean;
  previous_results_text: string;

  training_days_per_week: string;
  training_location: "home" | "gym" | "both" | "";
  available_equipment_text: string;
  preferred_training_time: string;

  injuries_or_conditions: string;
  medications: string;
  allergies: string;
  surgeries_text: string;

  dietary_restrictions: string;
  foods_disliked: string;
  current_diet_summary: string;
  water_intake_liters: string;

  occupation: string;
  daily_activity_level:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active"
    | "";
  sleep_hours_avg: string;
  stress_level: string;
  smokes: boolean;

  package_id: string;
  notes: string;
}

const EMPTY: FormState = {
  full_name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  preferred_contact: "whatsapp",
  best_contact_time: "",

  age: "",
  gender: "",
  height_cm: "",
  weight_kg: "",
  body_fat_percent: "",

  goal: "",
  target_weight_kg: "",
  target_date: "",
  motivation_text: "",

  experience_level: "",
  previous_coaching: false,
  previous_results_text: "",

  training_days_per_week: "",
  training_location: "",
  available_equipment_text: "",
  preferred_training_time: "",

  injuries_or_conditions: "",
  medications: "",
  allergies: "",
  surgeries_text: "",

  dietary_restrictions: "",
  foods_disliked: "",
  current_diet_summary: "",
  water_intake_liters: "",

  occupation: "",
  daily_activity_level: "",
  sleep_hours_avg: "",
  stress_level: "",
  smokes: false,

  package_id: "",
  notes: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ApplyForm({
  locale,
  packages,
  initialPackageId,
  turnstileSiteKey,
}: Props) {
  const router = useRouter();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [step, setStep] = useState<StepId>("contact");
  const [state, setState] = useState<FormState>({
    ...EMPTY,
    package_id: initialPackageId ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function validateStep(id: StepId): Record<string, string> {
    const errs: Record<string, string> = {};
    if (id === "contact") {
      if (state.full_name.trim().length < 2) {
        errs.full_name = t("Required.", "مطلوب.");
      }
      if (!EMAIL_RE.test(state.email.trim())) {
        errs.email = t("Invalid email.", "بريد غير صحيح.");
      }
      if (state.phone.trim().length < 5) {
        errs.phone = t("Required.", "مطلوب.");
      }
    }
    return errs;
  }

  function goNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const next = Math.min(stepIndex + 1, STEPS.length - 1);
    setStep(STEPS[next].id);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function goBack() {
    const next = Math.max(stepIndex - 1, 0);
    setStep(STEPS[next].id);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateStep("contact");
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setStep("contact");
      return;
    }
    if (turnstileSiteKey && !captchaToken) {
      toast.error(
        t("Please complete the CAPTCHA.", "برجاء تأكيد أنك لست روبوت."),
      );
      return;
    }
    startTransition(async () => {
      const payload: Record<string, string> = {};
      (Object.keys(state) as (keyof FormState)[]).forEach((k) => {
        const v = state[k];
        if (typeof v === "boolean") {
          payload[k] = v ? "true" : "false";
        } else {
          payload[k] = v ?? "";
        }
      });
      payload.locale = locale;
      if (captchaToken) payload.captcha_token = captchaToken;
      const res = await submitCoachingApplication(payload);
      if (res.ok) {
        toast.success(t("Application submitted!", "تم إرسال طلبك!"));
        router.push("/apply/thank-you");
      } else {
        toast.error(res.error ?? t("Something went wrong.", "حصل خطأ."));
      }
    });
  }

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === state.package_id) ?? null,
    [packages, state.package_id],
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <Stepper step={stepIndex} locale={locale} />

      {step === "contact" && (
        <Section
          title={t("How can we reach you?", "إزاي نقدر نوصلك؟")}
          subtitle={t(
            "These are the only required fields.",
            "الحقول دي بس المطلوبة.",
          )}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("Full name", "الاسم الكامل")}
              required
              value={state.full_name}
              onChange={(v) => update("full_name", v)}
              error={errors.full_name}
            />
            <Field
              label={t("Email", "البريد الإلكتروني")}
              required
              type="email"
              value={state.email}
              onChange={(v) => update("email", v)}
              error={errors.email}
            />
            <Field
              label={t(
                "Phone (with country code)",
                "رقم الموبايل (مع كود الدولة)",
              )}
              required
              type="tel"
              placeholder="+201234567890"
              value={state.phone}
              onChange={(v) => update("phone", v)}
              error={errors.phone}
            />
            <Field
              label={t("Country", "الدولة")}
              value={state.country}
              onChange={(v) => update("country", v)}
            />
            <Field
              label={t("City", "المدينة")}
              value={state.city}
              onChange={(v) => update("city", v)}
            />
            <SelectField
              label={t("Preferred contact method", "وسيلة التواصل المفضلة")}
              value={state.preferred_contact}
              onChange={(v) =>
                update("preferred_contact", v as FormState["preferred_contact"])
              }
              options={[
                { value: "whatsapp", label: t("WhatsApp", "واتساب") },
                { value: "phone", label: t("Phone call", "مكالمة") },
                { value: "email", label: t("Email", "إيميل") },
              ]}
            />
            <Field
              label={t("Best time to contact you", "أنسب وقت للتواصل")}
              placeholder={t("e.g. evenings 8-10pm", "مثلاً المساء ٨-١٠")}
              value={state.best_contact_time}
              onChange={(v) => update("best_contact_time", v)}
            />
          </div>

          {packages.length > 0 && (
            <div className="mt-4">
              <Label>
                {t("Interested in package", "الباقة اللي مهتم بيها")}
              </Label>
              <select
                value={state.package_id}
                onChange={(e) => update("package_id", e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{t("Not sure yet", "مش متأكد لسه")}</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {locale === "ar" ? p.name_ar : p.name_en} —{" "}
                    {p.price > 0
                      ? `${p.price} ${p.currency}`
                      : t("Custom", "مخصصة")}
                  </option>
                ))}
              </select>
              {selectedPackage && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {locale === "ar"
                    ? selectedPackage.description_ar
                    : selectedPackage.description_en}
                </p>
              )}
            </div>
          )}
        </Section>
      )}

      {step === "goals" && (
        <Section
          title={t("What are you working toward?", "إنت بتشتغل على إيه؟")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("Age", "العمر")}
              type="number"
              value={state.age}
              onChange={(v) => update("age", v)}
            />
            <SelectField
              label={t("Gender", "النوع")}
              value={state.gender}
              onChange={(v) => update("gender", v as FormState["gender"])}
              options={[
                { value: "", label: "—" },
                { value: "male", label: t("Male", "ذكر") },
                { value: "female", label: t("Female", "أنثى") },
                {
                  value: "other",
                  label: t("Prefer not to say", "أفضّل عدم الذكر"),
                },
              ]}
            />
            <Field
              label={t("Height (cm)", "الطول (سم)")}
              type="number"
              value={state.height_cm}
              onChange={(v) => update("height_cm", v)}
            />
            <Field
              label={t("Current weight (kg)", "الوزن الحالي (كجم)")}
              type="number"
              value={state.weight_kg}
              onChange={(v) => update("weight_kg", v)}
            />
            <Field
              label={t("Body fat % (if known)", "نسبة الدهون % (لو بتعرفها)")}
              type="number"
              value={state.body_fat_percent}
              onChange={(v) => update("body_fat_percent", v)}
            />
            <SelectField
              label={t("Main goal", "الهدف الأساسي")}
              value={state.goal}
              onChange={(v) => update("goal", v as FormState["goal"])}
              options={[
                { value: "", label: "—" },
                { value: "fat_loss", label: t("Fat loss", "خسارة دهون") },
                {
                  value: "muscle_gain",
                  label: t("Muscle gain", "زيادة عضلية"),
                },
                {
                  value: "recomposition",
                  label: t("Recomposition", "تنحيف وتضخيم"),
                },
                {
                  value: "athletic_performance",
                  label: t("Athletic performance", "أداء رياضي"),
                },
              ]}
            />
            <Field
              label={t("Target weight (kg)", "الوزن المستهدف (كجم)")}
              type="number"
              value={state.target_weight_kg}
              onChange={(v) => update("target_weight_kg", v)}
            />
            <Field
              label={t("Target date", "التاريخ المستهدف")}
              type="date"
              value={state.target_date}
              onChange={(v) => update("target_date", v)}
            />
          </div>
          <TextareaField
            label={t(
              "Why this goal? What does success look like?",
              "ليه الهدف ده؟ النجاح بالنسبالك شكله إيه؟",
            )}
            value={state.motivation_text}
            onChange={(v) => update("motivation_text", v)}
          />
        </Section>
      )}

      {step === "training" && (
        <Section title={t("Training background", "تاريخك مع التدريب")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label={t("Experience level", "مستوى الخبرة")}
              value={state.experience_level}
              onChange={(v) =>
                update("experience_level", v as FormState["experience_level"])
              }
              options={[
                { value: "", label: "—" },
                { value: "beginner", label: t("Beginner", "مبتدئ") },
                { value: "intermediate", label: t("Intermediate", "متوسط") },
                { value: "advanced", label: t("Advanced", "متقدم") },
              ]}
            />
            <SelectField
              label={t(
                "Trained with a coach before?",
                "اتمرنت مع كوتش قبل كده؟",
              )}
              value={state.previous_coaching ? "yes" : "no"}
              onChange={(v) => update("previous_coaching", v === "yes")}
              options={[
                { value: "no", label: t("No", "لأ") },
                { value: "yes", label: t("Yes", "أيوه") },
              ]}
            />
            <Field
              label={t(
                "Days per week you can train",
                "عدد أيام التمرين في الأسبوع",
              )}
              type="number"
              value={state.training_days_per_week}
              onChange={(v) => update("training_days_per_week", v)}
            />
            <SelectField
              label={t("Where will you train?", "هتتمرن فين؟")}
              value={state.training_location}
              onChange={(v) =>
                update("training_location", v as FormState["training_location"])
              }
              options={[
                { value: "", label: "—" },
                { value: "gym", label: t("Gym", "جيم") },
                { value: "home", label: t("Home", "في البيت") },
                { value: "both", label: t("Both", "الاتنين") },
              ]}
            />
            <Field
              label={t("Preferred training time", "أنسب وقت للتمرين")}
              placeholder={t("e.g. mornings", "مثلاً الصبح")}
              value={state.preferred_training_time}
              onChange={(v) => update("preferred_training_time", v)}
            />
          </div>
          <TextareaField
            label={t(
              "Equipment available (if home)",
              "الأجهزة المتاحة (لو في البيت)",
            )}
            value={state.available_equipment_text}
            onChange={(v) => update("available_equipment_text", v)}
            rows={2}
          />
          <TextareaField
            label={t(
              "Previous coaching experience or programs you've tried",
              "الكوتشينج/البرامج اللي جربتها قبل كده",
            )}
            value={state.previous_results_text}
            onChange={(v) => update("previous_results_text", v)}
            rows={3}
          />
        </Section>
      )}

      {step === "health" && (
        <Section
          title={t("Health & nutrition", "الصحة والتغذية")}
          subtitle={t(
            "We need this to keep you safe and pick the right approach.",
            "محتاجين دي عشان نحافظ على سلامتك ونختار الطريقة المناسبة.",
          )}
        >
          <div className="grid gap-4">
            <TextareaField
              label={t(
                "Injuries or medical conditions",
                "أي إصابات أو حالات طبية",
              )}
              value={state.injuries_or_conditions}
              onChange={(v) => update("injuries_or_conditions", v)}
              rows={2}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("Medications", "الأدوية")}
                value={state.medications}
                onChange={(v) => update("medications", v)}
              />
              <Field
                label={t("Allergies", "حساسية")}
                value={state.allergies}
                onChange={(v) => update("allergies", v)}
              />
            </div>
            <TextareaField
              label={t("Past surgeries (if any)", "أي عمليات جراحية سابقة")}
              value={state.surgeries_text}
              onChange={(v) => update("surgeries_text", v)}
              rows={2}
            />
            <TextareaField
              label={t(
                "Dietary restrictions",
                "قيود غذائية (نباتي، حلال، إلخ)",
              )}
              value={state.dietary_restrictions}
              onChange={(v) => update("dietary_restrictions", v)}
              rows={2}
            />
            <TextareaField
              label={t(
                "Foods you don't like / can't eat",
                "أكلات مش بتحبها / مش بتاكلها",
              )}
              value={state.foods_disliked}
              onChange={(v) => update("foods_disliked", v)}
              rows={2}
            />
            <TextareaField
              label={t(
                "Describe a typical day of eating",
                "صف لينا يوم أكل عادي عندك",
              )}
              value={state.current_diet_summary}
              onChange={(v) => update("current_diet_summary", v)}
              rows={3}
            />
            <Field
              label={t("Water intake (liters/day)", "كمية الميه يومياً (لتر)")}
              type="number"
              value={state.water_intake_liters}
              onChange={(v) => update("water_intake_liters", v)}
            />
          </div>
        </Section>
      )}

      {step === "lifestyle" && (
        <Section title={t("Lifestyle", "نمط الحياة")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("Occupation", "الشغل")}
              value={state.occupation}
              onChange={(v) => update("occupation", v)}
            />
            <SelectField
              label={t("Daily activity level", "مستوى النشاط اليومي")}
              value={state.daily_activity_level}
              onChange={(v) =>
                update(
                  "daily_activity_level",
                  v as FormState["daily_activity_level"],
                )
              }
              options={[
                { value: "", label: "—" },
                {
                  value: "sedentary",
                  label: t("Sedentary (desk job)", "قليل (مكتبي)"),
                },
                { value: "light", label: t("Light", "خفيف") },
                { value: "moderate", label: t("Moderate", "متوسط") },
                { value: "active", label: t("Active", "نشيط") },
                { value: "very_active", label: t("Very active", "نشاط عالي") },
              ]}
            />
            <Field
              label={t("Average sleep (hours)", "متوسط النوم (ساعات)")}
              type="number"
              value={state.sleep_hours_avg}
              onChange={(v) => update("sleep_hours_avg", v)}
            />
            <SelectField
              label={t("Stress level (1-5)", "مستوى التوتر (١-٥)")}
              value={state.stress_level}
              onChange={(v) => update("stress_level", v)}
              options={[
                { value: "", label: "—" },
                { value: "1", label: t("1 — very low", "١ — منخفض جداً") },
                { value: "2", label: "2" },
                { value: "3", label: t("3 — moderate", "٣ — متوسط") },
                { value: "4", label: "4" },
                { value: "5", label: t("5 — very high", "٥ — مرتفع جداً") },
              ]}
            />
            <SelectField
              label={t("Do you smoke?", "بتدخن؟")}
              value={state.smokes ? "yes" : "no"}
              onChange={(v) => update("smokes", v === "yes")}
              options={[
                { value: "no", label: t("No", "لأ") },
                { value: "yes", label: t("Yes", "أيوه") },
              ]}
            />
          </div>
          <TextareaField
            label={t(
              "Anything else we should know?",
              "أي حاجة تانية محتاج تقولهالنا؟",
            )}
            value={state.notes}
            onChange={(v) => update("notes", v)}
            rows={3}
          />
        </Section>
      )}

      {step === "review" && (
        <Section
          title={t("Almost done!", "تقريباً خلصنا!")}
          subtitle={t(
            "Double-check your contact info — that's how we'll reach out.",
            "راجع بيانات التواصل — دي الطريقة اللي هنتواصل بيها معاك.",
          )}
        >
          <div className="grid gap-3 rounded-lg border border-border bg-card/40 p-4 text-sm">
            <ReviewRow label={t("Name", "الاسم")} value={state.full_name} />
            <ReviewRow label={t("Email", "البريد")} value={state.email} />
            <ReviewRow label={t("Phone", "الموبايل")} value={state.phone} />
            <ReviewRow
              label={t("Preferred contact", "وسيلة التواصل")}
              value={state.preferred_contact}
            />
            {selectedPackage && (
              <ReviewRow
                label={t("Package", "الباقة")}
                value={
                  locale === "ar"
                    ? selectedPackage.name_ar
                    : selectedPackage.name_en
                }
              />
            )}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t(
              "By submitting you agree the coach can contact you on the channel you selected.",
              "بإرسال الطلب أنت توافق إن الكوتش يتواصل معاك على الوسيلة اللي اخترتها.",
            )}
          </p>
          {turnstileSiteKey && (
            <div className="mt-4">
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                onToken={setCaptchaToken}
              />
            </div>
          )}
        </Section>
      )}

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-border/60 bg-background/80 p-4 backdrop-blur sm:mx-0 sm:rounded-b-md">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={stepIndex === 0 || isPending}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("Back", "رجوع")}
        </Button>
        {step === "review" ? (
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("Submit application", "أرسل الطلب")}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            {t("Next", "التالي")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Stepper({ step, locale }: { step: number; locale: Locale }) {
  return (
    <ol className="flex flex-wrap items-center gap-1 text-xs">
      {STEPS.map((s, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <li key={s.id} className="flex items-center gap-1">
            <span
              className={
                "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold " +
                (active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "bg-primary/30 text-foreground"
                    : "bg-muted text-muted-foreground")
              }
            >
              {i + 1}
            </span>
            <span
              className={
                "hidden sm:inline " +
                (active ? "font-semibold" : "text-muted-foreground")
              }
            >
              {locale === "ar" ? s.ar : s.en}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 text-muted-foreground/40">·</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card/40 p-5">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  error,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/30 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
