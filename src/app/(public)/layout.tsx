import Link from "next/link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = readLocaleFromCookie();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            Coaching<span className="text-primary">.</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <LocaleSwitcher current={locale} />
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Coaching Platform
      </footer>
    </div>
  );
}
