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
    labelEn: "Home",
    labelAr: "الرئيسية",
    icon: LayoutDashboard,
  },
  {
    href: "/client/workouts",
    labelEn: "Workouts",
    labelAr: "تمرين",
    icon: Dumbbell,
  },
  {
    href: "/client/nutrition",
    labelEn: "Nutrition",
    labelAr: "تغذية",
    icon: Apple,
  },
  {
    href: "/client/progress",
    labelEn: "Progress",
    labelAr: "التقدم",
    icon: TrendingUp,
  },
  {
    href: "/client/checkin",
    labelEn: "Check-in",
    labelAr: "تشيك إن",
    icon: ClipboardCheck,
  },
];

export function ClientBottomNav() {
  const pathname = usePathname();
  const { locale } = useI18n();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ href, labelEn, labelAr, icon: Icon }) => {
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
                {locale === "ar" ? labelAr : labelEn}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
