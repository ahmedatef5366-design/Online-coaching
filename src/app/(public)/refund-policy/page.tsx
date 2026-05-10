import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { refundDoc } from "@/lib/legal/refund";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { siteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "When refunds are available for coaching packages and how to request one.",
  alternates: { canonical: `${siteUrl()}/refund-policy` },
  openGraph: {
    title: "Refund Policy",
    description:
      "When refunds are available for coaching packages and how to request one.",
    url: `${siteUrl()}/refund-policy`,
    type: "article",
  },
};

export default function RefundPolicyPage() {
  const locale = readLocaleFromCookie();
  return <LegalPage locale={locale} doc={refundDoc} />;
}
