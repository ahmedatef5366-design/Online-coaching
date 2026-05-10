import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { PackageForm } from "@/components/admin/packages/package-form";

export const dynamic = "force-dynamic";

export default function AdminPackageNewPage() {
  const locale = readLocaleFromCookie();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t("New package", "باقة جديدة")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "Create a coaching plan that visitors can apply to.",
            "أضف خطة كوتشينج العملاء يقدروا يقدّموا عليها.",
          )}
        </p>
      </div>
      <PackageForm locale={locale} />
    </div>
  );
}
