import Link from "next/link";
import { MessageCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listClientThreadsForAdmin } from "@/lib/messages/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const locale = readLocaleFromCookie();
  const threads = await listClientThreadsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {locale === "ar" ? "الرسائل" : "Messages"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "ar"
            ? "كل المحادثات مع العملاء في مكان واحد."
            : "Every client conversation, in one inbox."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {locale === "ar" ? "العملاء" : "Clients"}
          </CardTitle>
          <CardDescription>
            {locale === "ar"
              ? "اختار محادثة عشان تفتحها."
              : "Pick a conversation to open it."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {locale === "ar" ? "مفيش عملاء لسه." : "No clients yet."}
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {threads.map((t) => {
                const name = t.full_name ?? t.email;
                const lastBody = t.last_message?.body ?? "";
                return (
                  <li key={t.client_id}>
                    <Link
                      href={`/admin/clients/${t.client_id}/messages`}
                      className="flex items-start gap-3 px-2 py-3 hover:bg-card"
                    >
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{name}</p>
                          {t.unread_for_admin > 0 ? (
                            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                              {t.unread_for_admin}
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {lastBody ||
                            (locale === "ar"
                              ? "ما فيش رسائل لسه."
                              : "No messages yet.")}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
