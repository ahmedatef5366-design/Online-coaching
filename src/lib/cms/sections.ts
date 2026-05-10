/**
 * Site-content (landing-page CMS) section registry.
 *
 * Each row in the `site_content` Postgres table has a `section_key` and a
 * `content_json` payload. The shape of `content_json` is determined by the
 * section_key. This module is the single source of truth for:
 *
 *   - what sections exist
 *   - what their JSON payload looks like (via the per-section *Content type)
 *   - what their default values are (used to render a fresh editor when a
 *     section row is missing or malformed)
 *
 * The seed migration `0004_seed_site_content.sql` inserts these rows on a
 * fresh project; defaults below mirror that seed so an admin who clears a
 * field can restore the original copy via the editor's Reset button.
 */
import type { Locale } from "@/lib/i18n/config";

// ---------------------------------------------------------------------------
// Section payload types
// ---------------------------------------------------------------------------

export interface HeroContent {
  headline_en: string;
  headline_ar: string;
  subheadline_en: string;
  subheadline_ar: string;
  cta_text_en: string;
  cta_text_ar: string;
  background_url: string;
}

export interface FeatureItem {
  icon: string;
  title_en: string;
  title_ar: string;
  desc_en: string;
  desc_ar: string;
}

export interface FeaturesContent {
  items: FeatureItem[];
}

export interface HowItWorksStep {
  title_en: string;
  title_ar: string;
  desc_en: string;
  desc_ar: string;
}

export interface HowItWorksContent {
  steps: HowItWorksStep[];
}

export interface TestimonialItem {
  name: string;
  quote_en: string;
  quote_ar: string;
  rating: number; // 1..5
  before_url: string;
  after_url: string;
}

export interface TestimonialsContent {
  items: TestimonialItem[];
}

export interface PricingTier {
  name_en: string;
  name_ar: string;
  price: string;
  currency: string;
  features_en: string;
  features_ar: string;
}

export interface PricingContent {
  tiers: PricingTier[];
}

export interface CtaFooterContent {
  headline_en: string;
  headline_ar: string;
  subheadline_en: string;
  subheadline_ar: string;
  cta_text_en: string;
  cta_text_ar: string;
}

export interface ThemeContent {
  primary: string;
  accent: string;
  background: string;
}

export type SectionKey =
  | "hero"
  | "features"
  | "how_it_works"
  | "testimonials"
  | "pricing"
  | "cta_footer"
  | "theme";

export interface SectionContentMap {
  hero: HeroContent;
  features: FeaturesContent;
  how_it_works: HowItWorksContent;
  testimonials: TestimonialsContent;
  pricing: PricingContent;
  cta_footer: CtaFooterContent;
  theme: ThemeContent;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const SECTION_DEFAULTS: SectionContentMap = {
  hero: {
    headline_en: "Build the body you actually want.",
    headline_ar: "ابني الجسم اللي إنت عايزه فعلاً.",
    subheadline_en:
      "Personalized coaching, smart nutrition, and daily accountability — all in one place.",
    subheadline_ar:
      "كوتشينج شخصي، تغذية ذكية، ومتابعة يومية — كل ده في مكان واحد.",
    cta_text_en: "Start your journey",
    cta_text_ar: "ابدأ رحلتك",
    background_url: "",
  },
  features: {
    items: [
      {
        icon: "Dumbbell",
        title_en: "Personalized Workout Plan",
        title_ar: "خطة تمرين مخصصة",
        desc_en: "Programs built around your level, schedule, and goals.",
        desc_ar: "برامج مصممة حسب مستواك وجدولك وأهدافك.",
      },
      {
        icon: "Apple",
        title_en: "Flexible Nutrition System",
        title_ar: "نظام تغذية مرن",
        desc_en: "Hit your macros without giving up the foods you love.",
        desc_ar: "وصّل أهدافك من غير ما تتنازل عن الأكل اللي بتحبه.",
      },
      {
        icon: "Activity",
        title_en: "Daily Check-in & Tracking",
        title_ar: "متابعة يومية",
        desc_en: "Stay accountable with quick nightly check-ins.",
        desc_ar: "اتابع نفسك يومياً بفورم سريع كل ليلة.",
      },
      {
        icon: "MessageCircle",
        title_en: "Direct Coach Access",
        title_ar: "تواصل مباشر مع الكوتش",
        desc_en: "Real feedback from a real coach — not a chatbot.",
        desc_ar: "فيدباك حقيقي من كوتش حقيقي — مش بوت.",
      },
      {
        icon: "Camera",
        title_en: "Visual & Metric Progress",
        title_ar: "تتبع التقدم بالصور والأرقام",
        desc_en:
          "Track weight, measurements, and progress photos in one place.",
        desc_ar: "تابع وزنك ومقاساتك وصور التقدم في مكان واحد.",
      },
    ],
  },
  how_it_works: {
    steps: [
      {
        title_en: "Join",
        title_ar: "سجّل",
        desc_en: "Sign up and share your goals.",
        desc_ar: "سجّل وقولنا هدفك.",
      },
      {
        title_en: "Get Your Plan",
        title_ar: "استلم برنامجك",
        desc_en: "Receive a custom workout + nutrition plan.",
        desc_ar: "هتستلم برنامج تمرين وتغذية مخصص ليك.",
      },
      {
        title_en: "Track & Transform",
        title_ar: "تابع واتغير",
        desc_en: "Log workouts and check in daily — we adjust as you go.",
        desc_ar: "سجّل تمرينك وعمل تشيك-إن يومي — احنا بنعدل معاك.",
      },
    ],
  },
  testimonials: {
    items: [],
  },
  pricing: {
    tiers: [],
  },
  cta_footer: {
    headline_en: "Ready to start?",
    headline_ar: "جاهز تبدأ؟",
    subheadline_en:
      "Stop guessing. Get a plan that fits your life and a coach who actually pays attention.",
    subheadline_ar: "بطّل تخمين. احصل على خطة تناسب حياتك وكوتش بيتابعك فعلاً.",
    cta_text_en: "Sign up now",
    cta_text_ar: "سجّل دلوقتي",
  },
  theme: {
    primary: "#a3e635",
    accent: "#f97316",
    background: "#0f0f0f",
  },
};

// ---------------------------------------------------------------------------
// Section registry (display order, labels, helper metadata)
// ---------------------------------------------------------------------------

export interface SectionDescriptor {
  key: SectionKey;
  label_en: string;
  label_ar: string;
  description_en: string;
  description_ar: string;
  /** When false, this section is structural (e.g. theme) and is always shown
   *  in editor lists but never rendered as a public-facing page section. */
  rendersOnLanding: boolean;
}

export const SECTIONS: SectionDescriptor[] = [
  {
    key: "hero",
    label_en: "Hero",
    label_ar: "البانر الرئيسي",
    description_en: "Top of the landing page — headline, subheadline, CTA.",
    description_ar: "أعلى الصفحة — العنوان، الوصف، وزرار الدعوة للتسجيل.",
    rendersOnLanding: true,
  },
  {
    key: "features",
    label_en: "Features",
    label_ar: "المميزات",
    description_en: "Cards highlighting what's included in the program.",
    description_ar: "كروت بتعرض مميزات البرنامج.",
    rendersOnLanding: true,
  },
  {
    key: "how_it_works",
    label_en: "How it works",
    label_ar: "إزاي بيشتغل",
    description_en: "3-step explainer (Join → Plan → Transform).",
    description_ar: "٣ خطوات (التسجيل → الخطة → النتيجة).",
    rendersOnLanding: true,
  },
  {
    key: "testimonials",
    label_en: "Testimonials",
    label_ar: "آراء العملاء",
    description_en: "Client transformations + quotes (with star ratings).",
    description_ar: "تحولات وآراء العملاء (مع التقييم بالنجوم).",
    rendersOnLanding: true,
  },
  {
    key: "pricing",
    label_en: "Pricing",
    label_ar: "الأسعار",
    description_en: "Optional pricing tiers — hide via the publish toggle.",
    description_ar: "خطط الأسعار (اختياري) — اخفي القسم بزرار النشر.",
    rendersOnLanding: true,
  },
  {
    key: "cta_footer",
    label_en: "CTA Footer",
    label_ar: "دعوة التسجيل في النهاية",
    description_en: "Closing call-to-action above the page footer.",
    description_ar: "زرار التسجيل النهائي قبل الفوتر.",
    rendersOnLanding: true,
  },
  {
    key: "theme",
    label_en: "Theme colors",
    label_ar: "ألوان الموقع",
    description_en:
      "Primary / accent / background colors. Saved here for the design system; live application is wired in Phase 6.",
    description_ar:
      "اللون الأساسي والثانوي والخلفية. يتم تطبيقها على الموقع في المرحلة الأخيرة.",
    rendersOnLanding: false,
  },
];

export function getSectionDescriptor(
  key: string,
): SectionDescriptor | undefined {
  return SECTIONS.find((s) => s.key === key);
}

export function isValidSectionKey(key: string): key is SectionKey {
  return SECTIONS.some((s) => s.key === key);
}

// ---------------------------------------------------------------------------
// Locale-aware text picker
// ---------------------------------------------------------------------------

/**
 * Read `obj[base]_<locale>` with English fallback.
 *
 * Example: `pickLocaleText({ title_en: "Hi", title_ar: "أهلاً" }, "title", "ar")` → "أهلاً"
 */
export function pickLocaleText(
  obj: object | null | undefined,
  base: string,
  locale: Locale,
): string {
  if (!obj) return "";
  const record = obj as Record<string, unknown>;
  const localized = record[`${base}_${locale}`];
  if (typeof localized === "string" && localized.length > 0) return localized;
  const fallback = record[`${base}_en`];
  return typeof fallback === "string" ? fallback : "";
}

/**
 * Merge a partial/unknown JSON payload from the database with the section's
 * defaults so consumers always see fully-populated fields. Unknown keys in
 * the DB row are dropped (defensive — content shape is owned by this file).
 */
export function withDefaults<K extends SectionKey>(
  key: K,
  raw: unknown,
): SectionContentMap[K] {
  const defaults = SECTION_DEFAULTS[key];
  if (!raw || typeof raw !== "object") return defaults;
  // Shallow merge only at the top level — nested arrays/objects come from
  // raw verbatim if present, since they have admin-edited shape.
  return { ...defaults, ...(raw as object) } as SectionContentMap[K];
}
