"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateClient } from "@/lib/clients/actions";
import type { Locale } from "@/lib/i18n/config";
import { ClientPersonalFields } from "./client-personal-fields";

interface InitialValues {
  full_name: string;
  age: number | null;
  height_cm: number | null;
  starting_weight_kg: number | null;
  experience_level: string | null;
  goal: string | null;
  health_notes: string | null;
  start_date: string | null;
  target_date: string | null;
}

interface Props {
  clientId: string;
  locale: Locale;
  initial: InitialValues;
}

export function ClientProfileForm({ clientId, locale, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string }
  >({ kind: "idle" });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "idle" });
    const fd = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateClient({
        client_id: clientId,
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
      if (!result.ok) {
        setStatus({ kind: "error", message: result.error ?? "Save failed." });
        return;
      }
      setStatus({ kind: "saved" });
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full_name">
          {locale === "ar" ? "الاسم بالكامل" : "Full name"}
        </Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={initial.full_name}
          required
        />
      </div>

      <ClientPersonalFields
        locale={locale}
        defaults={{
          age: initial.age,
          height_cm: initial.height_cm,
          starting_weight_kg: initial.starting_weight_kg,
          experience_level: initial.experience_level,
          goal: initial.goal,
          health_notes: initial.health_notes,
          start_date: initial.start_date,
          target_date: initial.target_date,
        }}
      />

      {status.kind === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {status.message}
        </p>
      ) : null}
      {status.kind === "saved" ? (
        <p className="text-sm text-primary" role="status">
          {locale === "ar" ? "تم الحفظ ✓" : "Saved ✓"}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
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
