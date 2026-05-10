import { Suspense } from "react";
import { listActivePackages } from "@/lib/packages/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { ApplyForm } from "@/components/apply/apply-form";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { package_id?: string };
}

export default async function ApplyPage({ searchParams }: Props) {
  const locale = readLocaleFromCookie();
  const packages = await listActivePackages();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const initialPackageId = searchParams.package_id ?? "";

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {t("Coaching application", "فورم الاشتراك في الكوتشينج")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t(
            "Tell us about yourself so we can build a plan that actually fits you. The coach will reach out personally to confirm.",
            "اكتبلنا كل المعلومات اللي محتاجينها عشان نبني خطة تناسبك فعلاً. الكوتش هيتواصل معاك بشكل شخصي للتأكيد.",
          )}
        </p>
      </div>

      <Suspense>
        <ApplyForm
          locale={locale}
          packages={packages}
          initialPackageId={initialPackageId}
        />
      </Suspense>
    </div>
  );
}
