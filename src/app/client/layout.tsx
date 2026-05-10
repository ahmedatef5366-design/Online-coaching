import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientBottomNav } from "@/components/client/bottom-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import type { UserRole } from "@/types/database";

type ClientProfile = {
  role: UserRole;
  full_name: string | null;
  email: string;
} | null;

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle()) as { data: ClientProfile };

  if (profile?.role !== "client") redirect("/admin/dashboard");
  const locale = readLocaleFromCookie();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border/60 px-4">
        <div className="font-display text-lg font-bold">
          Coaching<span className="text-primary">.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {profile?.full_name ?? profile?.email}
          </span>
          <LocaleSwitcher current={locale} />
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-12">
        {children}
      </main>
      <ClientBottomNav />
    </div>
  );
}
