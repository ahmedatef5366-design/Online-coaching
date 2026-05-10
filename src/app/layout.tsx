import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/i18n-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { dirFor } from "@/lib/i18n/config";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "Coaching Platform",
  description:
    "Personalized coaching, smart nutrition, and daily accountability.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = readLocaleFromCookie();
  const dir = dirFor(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${jakarta.variable} ${syne.variable}`}
    >
      <body>
        <I18nProvider locale={locale}>{children}</I18nProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
