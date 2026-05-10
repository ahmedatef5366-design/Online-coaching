import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { privacyDoc } from "@/lib/legal/privacy";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { siteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How we collect, use, and protect your personal data — including rights under Egyptian PDPL Law 151/2020.",
  alternates: { canonical: `${siteUrl()}/privacy` },
  openGraph: {
    title: "Privacy Policy",
    description:
      "How we collect, use, and protect your personal data under Egyptian PDPL.",
    url: `${siteUrl()}/privacy`,
    type: "article",
  },
};

export default function PrivacyPage() {
  const locale = readLocaleFromCookie();
  return <LegalPage locale={locale} doc={privacyDoc} />;
}
