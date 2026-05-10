"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BILLING_PERIOD_DAYS,
  createPayment,
} from "@/lib/payments/actions";
import type { BillingPeriod } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";

interface Option {
  id: string;
  label: string;
}
interface PackageOption extends Option {
  price: number;
  currency: string;
  billing_period: BillingPeriod;
}

interface Props {
  locale: Locale;
  clients: Option[];
  applications: Option[];
  packages: PackageOption[];
  initialClientId?: string;
  initialApplicationId?: string;
}

/**
 * Admin form for logging a Vodafone Cash (or other) payment.
 *
 * A payment must be attached to EITHER a client (the usual renewal case)
 * OR an application (first payment before the client account exists).
 * We show a subject-type toggle so the admin picks one without juggling
 * two dropdowns that can contradict each other.
 */
export function NewPaymentForm({
  locale,
  clients,
  applications,
  packages,
  initialClientId,
  initialApplicationId,
}: Props) {
  const router = useRouter();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [isPending, startTransition] = useTransition();

  const [subjectType, setSubjectType] = useState<"client" | "application">(
    initialApplicationId && !initialClientId ? "application" : "client",
  );
  const [clientId, setClientId] = useState(initialClientId ?? "");
  const [applicationId, setApplicationId] = useState(
    initialApplicationId ?? "",
  );
  const [packageId, setPackageId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EGP");
  const [method, setMethod] = useState("vodafone_cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [periodStart, setPeriodStart] = useState(todayIso());
  const [durationDays, setDurationDays] = useState("");
  const [paidAt, setPaidAt] = useState(todayIso());
  const [notes, setNotes] = useState("");
  const [confirmNow, setConfirmNow] = useState(true);

  // When a package is picked, prefill the amount, currency and duration
  // for quick data entry. Admin can still override manually.
  useEffect(() => {
    if (!packageId) return;
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return;
    setAmount((prev) => (prev ? prev : String(pkg.price)));
    setCurrency(pkg.currency);
    const d = BILLING_PERIOD_DAYS[pkg.billing_period];
    if (d && !durationDays) setDurationDays(String(d));
  }, [packageId, packages, durationDays]);

  const computedEnd = useMemo(() => {
    const d = Number(durationDays);
    if (!periodStart || !Number.isFinite(d) || d <= 0) return null;
    const start = new Date(periodStart + "T00:00:00Z");
    start.setUTCDate(start.getUTCDate() + d);
    return start.toISOString().slice(0, 10);
  }, [periodStart, durationDays]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const targetClient = subjectType === "client" ? clientId : null;
    const targetApplication =
      subjectType === "application" ? applicationId : null;
    if (!targetClient && !targetApplication) {
      toast.error(
        t("Pick a client or application first.", "اختار عميل أو طلب الأول."),
      );
      return;
    }
    if (!amount) {
      toast.error(t("Enter the amount.", "ادخل المبلغ."));
      return;
    }

    startTransition(async () => {
      const res = await createPayment({
        client_id: targetClient,
        application_id: targetApplication,
        package_id: packageId || null,
        amount,
        currency,
        method,
        reference_number: referenceNumber,
        sender_phone: senderPhone,
        period_start: periodStart,
        duration_days: durationDays,
        paid_at: paidAt,
        notes,
        confirm_now: confirmNow,
      });
      if (!res.ok || !res.data) {
        toast.error(res.error ?? t("Failed.", "فشل."));
        return;
      }
      toast.success(t("Payment saved.", "تم حفظ الدفعة."));
      router.push(`/admin/payments/${res.data.id}`);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Subject */}
      <div className="space-y-2">
        <Label>{t("Attach to", "ابعت الدفعة لـ")}</Label>
        <div className="flex gap-2">
          <button
            type="button"
            className={
              "flex-1 rounded-md border px-3 py-2 text-sm " +
              (subjectType === "client"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card hover:bg-card/70")
            }
            onClick={() => setSubjectType("client")}
          >
            {t("Existing client", "عميل موجود")}
          </button>
          <button
            type="button"
            className={
              "flex-1 rounded-md border px-3 py-2 text-sm " +
              (subjectType === "application"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card hover:bg-card/70")
            }
            onClick={() => setSubjectType("application")}
          >
            {t("Application (lead)", "طلب اشتراك")}
          </button>
        </div>
        {subjectType === "client" ? (
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">
              {t("— pick a client —", "— اختار عميل —")}
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">
              {t("— pick an application —", "— اختار طلب —")}
            </option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Package (optional, used for amount + duration prefill) */}
      <div className="space-y-2">
        <Label>{t("Package (optional)", "الباقة (اختياري)")}</Label>
        <select
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("— none —", "— لا شيء —")}</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Money */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="amount">{t("Amount", "المبلغ")}</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">{t("Currency", "العملة")}</Label>
          <Input
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>
      </div>

      {/* Method + proof */}
      <div className="space-y-2">
        <Label>{t("Method", "وسيلة الدفع")}</Label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="vodafone_cash">
            {t("Vodafone Cash", "فودافون كاش")}
          </option>
          <option value="instapay">{t("InstaPay", "إنستا باي")}</option>
          <option value="bank_transfer">
            {t("Bank transfer", "تحويل بنكي")}
          </option>
          <option value="cash">{t("Cash", "كاش")}</option>
          <option value="other">{t("Other", "آخر")}</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reference_number">
            {t("Reference / Txn #", "رقم العملية / المرجع")}
          </Label>
          <Input
            id="reference_number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sender_phone">
            {t("Sender phone", "رقم المُرسِل")}
          </Label>
          <Input
            id="sender_phone"
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            placeholder="+201..."
          />
        </div>
      </div>

      {/* Billing window */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="period_start">
            {t("Starts on", "تاريخ البداية")}
          </Label>
          <Input
            id="period_start"
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration_days">
            {t("Duration (days)", "المدة (أيام)")}
          </Label>
          <Input
            id="duration_days"
            type="number"
            min="1"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("Ends on", "تاريخ الانتهاء")}</Label>
          <Input value={computedEnd ?? "—"} readOnly disabled />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paid_at">{t("Paid at", "تاريخ الدفع")}</Label>
        <Input
          id="paid_at"
          type="date"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("Notes", "ملاحظات")}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirmNow}
          onChange={(e) => setConfirmNow(e.target.checked)}
          className="h-4 w-4"
        />
        {t(
          "Confirm now and activate the subscription",
          "تأكيد فوراً وتفعيل الاشتراك",
        )}
      </label>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("Save payment", "حفظ الدفعة")}
        </Button>
      </div>
    </form>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
