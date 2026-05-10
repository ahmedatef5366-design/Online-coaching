import Link from "next/link";
import { Plus, Pencil, EyeOff, Eye } from "lucide-react";
import { listAllPackages } from "@/lib/packages/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { formatBillingPeriod } from "@/lib/packages/format";
import { PackageActiveToggle } from "@/components/admin/packages/package-active-toggle";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  const locale = readLocaleFromCookie();
  const packages = await listAllPackages();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {t("Packages", "الباقات")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Coaching plans visible on the public landing page and packages page.",
              "خطط الكوتشينج المعروضة في الموقع العام وصفحة الباقات.",
            )}
          </p>
        </div>
        <Link
          href="/admin/packages/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("New package", "باقة جديدة")}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("All packages", "كل الباقات")}
            <span className="ms-2 text-sm font-normal text-muted-foreground">
              ({packages.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t(
                "No packages yet. Create your first one to start collecting applications.",
                "مفيش باقات. أضف أول باقة وابدأ تستقبل الطلبات.",
              )}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-start text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pe-3 text-start">
                      {t("Order", "الترتيب")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("Name", "الاسم")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("Price", "السعر")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("Period", "المدة")}
                    </th>
                    <th className="py-2 pe-3 text-start">
                      {t("Status", "الحالة")}
                    </th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((p) => {
                    const name = locale === "ar" ? p.name_ar : p.name_en;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-border/30 last:border-0"
                      >
                        <td className="py-3 pe-3 text-muted-foreground">
                          {p.display_order}
                        </td>
                        <td className="py-3 pe-3 font-medium">
                          <div className="flex items-center gap-2">
                            {p.is_featured && (
                              <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                                {t("Featured", "مميزة")}
                              </span>
                            )}
                            {name}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            /{p.slug}
                          </p>
                        </td>
                        <td className="py-3 pe-3">
                          {p.price > 0
                            ? `${p.price} ${p.currency}`
                            : t("Custom", "مخصصة")}
                        </td>
                        <td className="py-3 pe-3 text-muted-foreground">
                          {formatBillingPeriod(p.billing_period, locale)}
                        </td>
                        <td className="py-3 pe-3">
                          <span
                            className={
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs " +
                              (p.is_active
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground")
                            }
                          >
                            {p.is_active ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                            {p.is_active
                              ? t("Active", "نشطة")
                              : t("Hidden", "مخفية")}
                          </span>
                        </td>
                        <td className="py-3 ps-3 text-end">
                          <div className="inline-flex items-center gap-2">
                            <PackageActiveToggle
                              packageId={p.id}
                              isActive={p.is_active}
                              locale={locale}
                            />
                            <Link
                              href={`/admin/packages/${p.id}`}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-card/70"
                            >
                              <Pencil className="h-3 w-3" />
                              {t("Edit", "تعديل")}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
