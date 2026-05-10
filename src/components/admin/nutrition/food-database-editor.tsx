"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteFood, upsertFood } from "@/lib/nutrition/actions";
import type { FoodDatabaseRow } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  locale: Locale;
  foods: FoodDatabaseRow[];
}

export function FoodDatabaseEditor({ locale, foods }: Props) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<FoodDatabaseRow | null>(null);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.name_ar?.toLowerCase().includes(q) ?? false),
    );
  }, [foods, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "ar" ? "بحث…" : "Search…"}
            className="ps-9"
          />
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setAdding(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {locale === "ar" ? "صنف جديد" : "New food"}
        </Button>
      </div>

      {(adding || editing) && (
        <FoodForm
          locale={locale}
          existing={editing}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-start text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pe-3 text-start">
                {locale === "ar" ? "الاسم" : "Name"}
              </th>
              <th className="py-2 pe-3 text-end">kcal</th>
              <th className="py-2 pe-3 text-end">P</th>
              <th className="py-2 pe-3 text-end">C</th>
              <th className="py-2 pe-3 text-end">F</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr
                key={f.id}
                className="border-b border-border/30 last:border-0"
              >
                <td className="py-2 pe-3">
                  <p className="font-medium">{f.name}</p>
                  {f.name_ar ? (
                    <p className="text-xs text-muted-foreground">{f.name_ar}</p>
                  ) : null}
                </td>
                <td className="py-2 pe-3 text-end tabular-nums">
                  {f.calories_per_100g}
                </td>
                <td className="py-2 pe-3 text-end tabular-nums">
                  {f.protein_per_100g}
                </td>
                <td className="py-2 pe-3 text-end tabular-nums">
                  {f.carbs_per_100g}
                </td>
                <td className="py-2 pe-3 text-end tabular-nums">
                  {f.fat_per_100g}
                </td>
                <td className="py-2 text-end">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAdding(false);
                        setEditing(f);
                      }}
                      className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-card hover:text-foreground"
                    >
                      {locale === "ar" ? "تعديل" : "Edit"}
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        const ok = window.confirm(
                          locale === "ar"
                            ? "حذف الصنف ده؟"
                            : "Delete this food?",
                        );
                        if (!ok) return;
                        startTransition(async () => {
                          const result = await deleteFood(f.id);
                          if (!result.ok) {
                            setError(result.error ?? "Delete failed.");
                          } else {
                            router.refresh();
                          }
                        });
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                      aria-label={locale === "ar" ? "حذف" : "Delete"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  {locale === "ar" ? "مفيش نتايج." : "No matches."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FoodForm({
  locale,
  existing,
  onClose,
}: {
  locale: Locale;
  existing: FoodDatabaseRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await upsertFood({
            food_id: existing?.id,
            name: String(fd.get("name") ?? ""),
            name_ar: String(fd.get("name_ar") ?? ""),
            calories_per_100g: String(fd.get("calories_per_100g") ?? ""),
            protein_per_100g: String(fd.get("protein_per_100g") ?? ""),
            carbs_per_100g: String(fd.get("carbs_per_100g") ?? ""),
            fat_per_100g: String(fd.get("fat_per_100g") ?? ""),
          });
          if (!result.ok) {
            setError(result.error ?? "Save failed.");
            return;
          }
          onClose();
          router.refresh();
        });
      }}
      className="space-y-3 rounded-md border border-border/60 bg-card/80 p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {existing
            ? locale === "ar"
              ? "تعديل صنف"
              : "Edit food"
            : locale === "ar"
              ? "صنف جديد"
              : "New food"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">
            {locale === "ar" ? "الاسم بالإنجليزي" : "Name (English)"}
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={existing?.name ?? ""}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="name_ar">
            {locale === "ar" ? "الاسم بالعربي" : "Name (Arabic)"}
          </Label>
          <Input
            id="name_ar"
            name="name_ar"
            defaultValue={existing?.name_ar ?? ""}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="calories_per_100g">
            {locale === "ar" ? "سعرات / ١٠٠ جم" : "Calories / 100g"}
          </Label>
          <Input
            id="calories_per_100g"
            name="calories_per_100g"
            type="number"
            step="0.1"
            min={0}
            defaultValue={existing?.calories_per_100g ?? ""}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="protein_per_100g">
            {locale === "ar" ? "بروتين / ١٠٠ جم" : "Protein / 100g"}
          </Label>
          <Input
            id="protein_per_100g"
            name="protein_per_100g"
            type="number"
            step="0.1"
            min={0}
            defaultValue={existing?.protein_per_100g ?? ""}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="carbs_per_100g">
            {locale === "ar" ? "كارب / ١٠٠ جم" : "Carbs / 100g"}
          </Label>
          <Input
            id="carbs_per_100g"
            name="carbs_per_100g"
            type="number"
            step="0.1"
            min={0}
            defaultValue={existing?.carbs_per_100g ?? ""}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="fat_per_100g">
            {locale === "ar" ? "دهون / ١٠٠ جم" : "Fat / 100g"}
          </Label>
          <Input
            id="fat_per_100g"
            name="fat_per_100g"
            type="number"
            step="0.1"
            min={0}
            defaultValue={existing?.fat_per_100g ?? ""}
            required
          />
        </div>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          {locale === "ar" ? "إلغاء" : "Cancel"}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? locale === "ar"
              ? "جاري الحفظ…"
              : "Saving…"
            : locale === "ar"
              ? "حفظ"
              : "Save"}
        </Button>
      </div>
    </form>
  );
}
