"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult<T = void> {
  ok: boolean;
  error?: string;
  data?: T;
}

export async function sendMessage(
  clientId: string,
  body: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Message body is required." };
  if (trimmed.length > 4000) {
    return { ok: false, error: "Message is too long (max 4000 characters)." };
  }

  const { data, error } = (await supabase
    .from("messages")
    .insert({ client_id: clientId, sender_id: user.id, body: trimmed })
    .select("id")
    .maybeSingle()) as {
    data: { id: string } | null;
    error: { message: string } | null;
  };
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not send message." };
  }

  revalidatePath(`/admin/clients/${clientId}/messages`);
  revalidatePath(`/admin/messages`);
  revalidatePath(`/client/messages`);
  return { ok: true, data: { id: data.id } };
}

/**
 * Mark every unread message in a thread as read **except** ones sent by
 * the calling user. RLS prevents the caller from updating their own rows
 * here (sender_id <> auth.uid()), so this is safe to call indiscriminately
 * from either side of the conversation.
 */
export async function markThreadRead(clientId: string): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .is("read_at", null)
    .neq("sender_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/clients/${clientId}/messages`);
  revalidatePath(`/admin/messages`);
  revalidatePath(`/client/messages`);
  return { ok: true };
}
