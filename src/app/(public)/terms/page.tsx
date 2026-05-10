import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { termsDoc } from "@/lib/legal/terms";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { siteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your use of the website and the online coaching services we provide.",
  alternates: { canonical: `${siteUrl()}/terms` },
  openGraph: {
    title: "Terms of Service",
    description:
      "The terms governing your use of our online coaching services.",
    url: `${siteUrl()}/terms`,
    type: "article",
  },
};

export default function TermsPage() {
  const locale = readLocaleFromCookie();
  return <LegalPage locale={locale} doc={termsDoc} />;
}
