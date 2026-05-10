import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/auth/logout-button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MessagesLink } from "@/components/messages/messages-link";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import type { UserRole } from "@/types/database";

type AdminProfile = {
  role: UserRole;
  full_name: string | null;
  email: string;
} | null;

export default async function AdminLayout({
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
    .maybeSingle()) as { data: AdminProfile };

  if (profile?.role !== "admin") redirect("/client/dashboard");
  const locale = readLocaleFromCookie();

  const { count: newApplicationsCount } = await supabase
    .from("coaching_applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar newApplicationsCount={newApplicationsCount ?? 0} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur">
          <div className="text-sm text-muted-foreground">
            Admin · {profile?.full_name ?? profile?.email}
          </div>
          <div className="flex items-center gap-2">
            <MessagesLink href="/admin/messages" locale={locale} />
            <LocaleSwitcher current={locale} />
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
