"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, RefreshCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateTempPassword } from "@/lib/auth/temp-password";
import { resetClientPassword } from "@/lib/clients/actions";
import type { Locale } from "@/lib/i18n/config";
import { CredentialsPanel } from "./credentials-panel";

interface Props {
  locale: Locale;
  clientId: string;
  email: string;
}

export function ResetPasswordCard({ locale, clientId, email }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ password: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && !password) setPassword(generateTempPassword(12));
  }, [open, password]);

  const loginUrl = useMemo(() => {
    if (typeof window === "undefined") return "/login";
    return `${window.location.origin}/login`;
  }, []);

  function handleReset() {
    setError(null);
    const value = password;
    startTransition(async () => {
      const result = await resetClientPassword({
        client_id: clientId,
        password: value,
      });
      if (!result.ok) {
        setError(result.error ?? "Could not reset password.");
        return;
      }
      setIssued({ password: value });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <div className="rounded-full bg-primary/15 p-2 text-primary">
          <KeyRound className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <CardTitle className="text-base">
            {locale === "ar" ? "بيانات الدخول" : "Login credentials"}
          </CardTitle>
          <CardDescription>
            {locale === "ar"
              ? "صدّر كلمة سر مؤقتة جديدة لو العميل نسيها أو احتاج تغييرها."
              : "Issue a fresh temporary password if the client forgot or needs a new one."}
          </CardDescription>
        </div>
        {!open ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
          >
            {locale === "ar" ? "إعادة تعيين" : "Reset password"}
          </Button>
        ) : null}
      </CardHeader>
      {open ? (
        <CardContent className="space-y-4">
          {issued ? (
            <CredentialsPanel
              locale={locale}
              email={email}
              password={issued.password}
              loginUrl={loginUrl}
              onClose={() => {
                setIssued(null);
                setOpen(false);
                setPassword("");
              }}
            />
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reset-password">
                  {locale === "ar"
                    ? "كلمة السر المؤقتة الجديدة"
                    : "New temporary password"}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="reset-password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    autoComplete="off"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShow((v) => !v)}
                    aria-label={
                      locale === "ar"
                        ? show
                          ? "إخفاء"
                          : "إظهار"
                        : show
                          ? "Hide"
                          : "Show"
                    }
                  >
                    {show ? (
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
              </div>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={handleReset}
                  disabled={isPending || password.length < 8}
                >
                  {isPending
                    ? locale === "ar"
                      ? "جاري الحفظ…"
                      : "Saving…"
                    : locale === "ar"
                      ? "تأكيد"
                      : "Apply password"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    setPassword("");
                    setError(null);
                  }}
                >
                  {locale === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
}
