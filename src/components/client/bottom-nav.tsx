"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  TrendingUp,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

const ITEMS = [
  {
    href: "/client/dashboard",
    labelKey: "client.nav.home",
    icon: LayoutDashboard,
  },
  { href: "/client/workouts", labelKey: "client.nav.workouts", icon: Dumbbell },
  { href: "/client/nutrition", labelKey: "client.nav.nutrition", icon: Apple },
  {
    href: "/client/progress",
    labelKey: "client.nav.progress",
    icon: TrendingUp,
  },
  {
    href: "/client/checkin",
    labelKey: "client.nav.checkin",
    icon: ClipboardCheck,
  },
];

export function ClientBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {t(labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
