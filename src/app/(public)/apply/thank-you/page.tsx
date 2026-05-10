import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";

export default function ApplyThankYouPage() {
  const locale = readLocaleFromCookie();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);

  return (
    <div className="container max-w-xl py-24 text-center">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="font-display text-3xl font-bold md:text-4xl">
        {t(
          "We got your application!",
          "وصلنا طلبك!",
        )}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {t(
          "The coach will review your details and reach out via your preferred contact method within 24 hours.",
          "الكوتش هيراجع بياناتك ويتواصل معاك على الطريقة اللي اخترتها خلال ٢٤ ساعة.",
        )}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-card/70"
        >
          {t("Back to home", "ارجع للرئيسية")}
        </Link>
        <Link
          href="/packages"
          className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {t("Browse packages", "شوف الباقات")}
        </Link>
      </div>
    </div>
  );
}
