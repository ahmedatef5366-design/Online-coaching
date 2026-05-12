import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentClientForMessaging,
  getThreadMessages,
} from "@/lib/messages/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { getT } from "@/lib/i18n/t";
import { MessageThread } from "@/components/messages/message-thread";

export const dynamic = "force-dynamic";

export default async function ClientMessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const locale = readLocaleFromCookie();
  const t = getT(locale);
  const client = await getCurrentClientForMessaging();
  if (!client) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("client.messages.no_link_title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("client.messages.no_link_subtitle")}
        </p>
      </div>
    );
  }

  const messages = await getThreadMessages(client.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("client.messages.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("client.messages.subtitle")}
        </p>
      </div>

      <MessageThread
        clientId={client.id}
        currentUserId={user.id}
        initialMessages={messages}
        locale={locale}
      />
    </div>
  );
}
