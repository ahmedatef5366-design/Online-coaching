import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getUnreadCountForCurrentUser } from "@/lib/messages/queries";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  href: string;
  locale: Locale;
}

/** Header link to the messages inbox with an unread-count badge. */
export async function MessagesLink({ href, locale }: Props) {
  const unread = await getUnreadCountForCurrentUser();
  const label = locale === "ar" ? "الرسائل" : "Messages";
  return (
    <Link
      href={href}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground"
      aria-label={label}
      title={label}
    >
      <MessageCircle className="h-5 w-5" />
      {unread > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
