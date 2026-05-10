"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createNewClient } from "@/lib/clients/actions";
import { generateTempPassword } from "@/lib/auth/temp-password";
import type { Locale } from "@/lib/i18n/config";
import { ClientPersonalFields } from "./client-personal-fields";
import { CredentialsPanel } from "./credentials-panel";

interface Props {
  locale: Locale;
}

export function NewClientForm({ locale }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [created, setCreated] = useState<{
    clientId: string;
    email: string;
    password: string;
  } | null>(null);

  // Generate an initial password on mount (client-only, avoids hydration
  // mismatch by waiting for the effect to run).
  useEffect(() => {
    setPassword(generateTempPassword(12));
  }, []);

  const loginUrl = useMemo(() => {
    if (typeof window === "undefined") return "/login";
    return `${window.location.origin}/login`;
  }, []);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const fd = new FormData(event.currentTarget);
    const submittedEmail = String(fd.get("email") ?? "")
      .trim()
      .toLowerCase();
    const submittedPassword = password;
    startTransition(async () => {
      const result = await createNewClient({
        email: submittedEmail,
        password: submittedPassword,
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
      setCreated({
        clientId: result.data.clientId,
        email: submittedEmail,
        password: submittedPassword,
      });
      router.refresh();
    });
  }

  if (created) {
    return (
      <div className="space-y-4">
        <CredentialsPanel
          locale={locale}
          email={created.email}
          password={created.password}
          loginUrl={loginUrl}
          continueHref={`/admin/clients/${created.clientId}`}
        />
      </div>
    );
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
          <div className="flex items-center gap-2">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="off"
              className="font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                locale === "ar"
                  ? showPassword
                    ? "إخفاء"
                    : "إظهار"
                  : showPassword
                    ? "Hide"
                    : "Show"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setPassword(generateTempPassword(12))}
              aria-label={locale === "ar" ? "توليد جديدة" : "Regenerate"}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {locale === "ar"
              ? "هتظهر مرة واحدة بس بعد الحفظ — هتنسخها وتبعتها للعميل."
              : "Shown once after saving — you'll copy it and send it to the client."}
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
