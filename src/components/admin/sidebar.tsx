"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Apple,
  BarChart3,
  MessageCircle,
  Settings,
  Package,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

interface Props {
  newApplicationsCount?: number;
}

export function AdminSidebar({ newApplicationsCount = 0 }: Props) {
  const pathname = usePathname();
  const items: SidebarItem[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/admin/applications",
      label: "Applications",
      icon: Inbox,
      badge: newApplicationsCount,
    },
    { href: "/admin/clients", label: "Clients", icon: Users },
    { href: "/admin/messages", label: "Messages", icon: MessageCircle },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/nutrition", label: "Nutrition", icon: Apple },
    { href: "/admin/packages", label: "Packages", icon: Package },
    { href: "/admin/site-content", label: "Site Content", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-card/40 lg:block">
      <div className="px-5 py-6">
        <Link
          href="/admin/dashboard"
          className="font-display text-xl font-bold"
        >
          Coach<span className="text-primary">.</span>
        </Link>
      </div>
      <nav className="space-y-1 px-3">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {badge && badge > 0 ? (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
