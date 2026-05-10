import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentClientForMessaging,
  getThreadMessages,
} from "@/lib/messages/queries";
import { readLocaleFromCookie } from "@/lib/i18n/locale-cookie";
import { MessageThread } from "@/components/messages/message-thread";

export const dynamic = "force-dynamic";

export default async function ClientMessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const locale = readLocaleFromCookie();
  const client = await getCurrentClientForMessaging();
  if (!client) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {locale === "ar" ? "الرسائل" : "Messages"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "ar"
            ? "حسابك لسه ما اترِبط بكوتش — كلم الكوتش بتاعك."
            : "Your account isn't linked to a coach yet."}
        </p>
      </div>
    );
  }

  const messages = await getThreadMessages(client.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {locale === "ar" ? "محادثتك مع الكوتش" : "Chat with your coach"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "ar"
            ? "اسأل عن أي حاجة في الخطة أو الأكل أو التمرين."
            : "Ask anything about your plan, nutrition, or training."}
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
