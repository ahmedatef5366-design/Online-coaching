import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/types/database";

export interface ClientThreadSummary {
  client_id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  last_message: Message | null;
  unread_for_admin: number;
}

/** All threads for the admin inbox, sorted most-recent-first. */
export async function listClientThreadsForAdmin(): Promise<
  ClientThreadSummary[]
> {
  const supabase = createClient();

  const { data: clients } = (await supabase
    .from("clients")
    .select("id, user_id")) as {
    data: { id: string; user_id: string }[] | null;
  };
  const rows = clients ?? [];
  if (rows.length === 0) return [];

  const userIds = rows.map((c) => c.user_id);
  const clientIds = rows.map((c) => c.id);

  const [profilesRes, messagesRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").in("id", userIds),
    supabase
      .from("messages")
      .select("*")
      .in("client_id", clientIds)
      .order("created_at", { ascending: false }),
  ]);

  const profiles = (profilesRes.data ?? []) as {
    id: string;
    full_name: string | null;
    email: string;
  }[];
  const messages = (messagesRes.data ?? []) as Message[];
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return rows
    .map((c): ClientThreadSummary => {
      const p = profileMap.get(c.user_id);
      const threadMessages = messages.filter((m) => m.client_id === c.id);
      const last = threadMessages[0] ?? null;
      // Unread *for the admin* = client → admin messages with no read_at.
      const unread = threadMessages.filter(
        (m) => m.read_at === null && m.sender_id === c.user_id,
      ).length;
      return {
        client_id: c.id,
        user_id: c.user_id,
        full_name: p?.full_name ?? null,
        email: p?.email ?? "",
        last_message: last,
        unread_for_admin: unread,
      };
    })
    .sort((a, b) => {
      const aTime = a.last_message?.created_at ?? "";
      const bTime = b.last_message?.created_at ?? "";
      return bTime.localeCompare(aTime);
    });
}

/** Conversation messages in chronological order. */
export async function getThreadMessages(clientId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })) as { data: Message[] | null };
  return data ?? [];
}

/**
 * For the current authenticated user, return the count of messages
 * sent *to them* (i.e. not by them) that haven't been read yet.
 */
export async function getUnreadCountForCurrentUser(): Promise<number> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()) as { data: { role: "admin" | "client" } | null };

  if (profile?.role === "admin") {
    // Unread messages from any client → admin
    const { data: clients } = (await supabase
      .from("clients")
      .select("id, user_id")) as {
      data: { id: string; user_id: string }[] | null;
    };
    const rows = clients ?? [];
    if (rows.length === 0) return 0;
    const userIds = rows.map((c) => c.user_id);
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .is("read_at", null)
      .in("sender_id", userIds);
    return count ?? 0;
  }

  // Client: unread messages addressed to *their* thread, not sent by them.
  const { data: client } = (await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()) as { data: { id: string } | null };
  if (!client) return 0;
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("client_id", client.id)
    .is("read_at", null)
    .neq("sender_id", user.id);
  return count ?? 0;
}

export async function getCurrentClientForMessaging(): Promise<{
  id: string;
  user_id: string;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = (await supabase
    .from("clients")
    .select("id, user_id")
    .eq("user_id", user.id)
    .maybeSingle()) as { data: { id: string; user_id: string } | null };
  return data;
}
