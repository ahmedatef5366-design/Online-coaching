"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createNewClient } from "@/lib/clients/actions";
import type { Locale } from "@/lib/i18n/config";
import { ClientPersonalFields } from "./client-personal-fields";

interface Props {
  locale: Locale;
}

export function NewClientForm({ locale }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const fd = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createNewClient({
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
        full_name: String(fd.get("full_name") ?? ""),
        age: String(fd.get("age") ?? ""),
        height_cm: String(fd.get("height_cm") ?? ""),
        starting_weight_kg: String(fd.get("starting_weight_kg") ?? ""),
        experience_level: String(fd.get("experience_level") ?? ""),
        goal: String(fd.get("goal") ?? ""),
        health_notes: String(fd.get("health_notes") ?? ""),
        start_date: String(fd.get("start_date") ?? ""),
        target_date: String(fd.get("target_date") ?? ""),
      });
      if (!result.ok || !result.data) {
        setError(result.error ?? "Could not create client.");
        return;
      }
      router.replace(`/admin/clients/${result.data.clientId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">
            {locale === "ar" ? "الاسم بالكامل" : "Full name"}
          </Label>
          <Input id="full_name" name="full_name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="password">
            {locale === "ar" ? "كلمة السر المؤقتة" : "Initial password"}
          </Label>
          <Input
            id="password"
            name="password"
            type="text"
            required
            minLength={8}
            placeholder={
              locale === "ar" ? "حد أدنى ٨ أحرف" : "Min 8 characters"
            }
          />
          <p className="text-xs text-muted-foreground">
            {locale === "ar"
              ? "ابعتها للعميل عشان يدخل ويغيرها."
              : "Send this to the client so they can log in and change it."}
          </p>
        </div>
      </div>

      <ClientPersonalFields locale={locale} />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? locale === "ar"
              ? "جاري الإنشاء…"
              : "Creating…"
            : locale === "ar"
              ? "إنشاء العميل"
              : "Create client"}
        </Button>
      </div>
    </form>
  );
}
