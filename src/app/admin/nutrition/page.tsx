import { listFoods } from "@/lib/nutrition/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { FoodDatabaseEditor } from "@/components/admin/nutrition/food-database-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminNutritionPage() {
  const locale = readLocaleFromCookie();
  const foods = await listFoods();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {locale === "ar" ? "قاعدة بيانات الأكل" : "Food database"}
        </h1>
        <p className="text-muted-foreground">
          {locale === "ar"
            ? "كل الأصناف المتاحة للعملاء في وضع الماكروز المرنة. ضيف الأصناف الناقصة بنفسك."
            : "Every food available to your clients in flexible-mode logging. Add anything that's missing."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {locale === "ar"
              ? `إجمالي الأصناف (${foods.length})`
              : `Foods (${foods.length})`}
          </CardTitle>
          <CardDescription>
            {locale === "ar"
              ? "الماكروز محسوبة لكل ١٠٠ جم."
              : "Macros listed per 100g."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FoodDatabaseEditor locale={locale} foods={foods} />
        </CardContent>
      </Card>
    </div>
  );
}
