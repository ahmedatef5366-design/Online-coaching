"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  isValidSectionKey,
  type SectionContentMap,
  type SectionKey,
} from "./sections";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function assertAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { data } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()) as { data: { role: "admin" | "client" } | null };

  if (data?.role !== "admin") {
    return { ok: false, error: "Forbidden — admin access required." };
  }
  return { ok: true };
}

/**
 * Persist a section's content_json. Upserts the row — on a fresh project
 * this means the first save creates the row even if the seed migration
 * hasn't been applied. RLS still gates the operation server-side.
 */
export async function saveSection<K extends SectionKey>(
  key: K,
  content: SectionContentMap[K],
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!isValidSectionKey(key)) {
    return { ok: false, error: `Unknown section: ${String(key)}` };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("site_content")
    .upsert(
      {
        section_key: key,
        content_json: content as unknown as Record<string, unknown>,
      },
      { onConflict: "section_key" },
    );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/site-content");
  revalidatePath(`/admin/site-content/${key}`);
  return { ok: true };
}

/** Toggle a section's `is_published` flag. */
export async function setSectionPublished(
  key: SectionKey,
  isPublished: boolean,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!isValidSectionKey(key)) {
    return { ok: false, error: `Unknown section: ${String(key)}` };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("site_content")
    .upsert(
      { section_key: key, is_published: isPublished, content_json: {} },
      { onConflict: "section_key", ignoreDuplicates: false },
    )
    .select("section_key");

  if (error) {
    // Fall back to a plain UPDATE if upsert tried to overwrite content_json
    // for an existing row (which would lose the admin's edits). This
    // matters because we only want to flip the flag here.
    const { error: updErr } = await supabase
      .from("site_content")
      .update({ is_published: isPublished })
      .eq("section_key", key);
    if (updErr) return { ok: false, error: updErr.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/site-content");
  return { ok: true };
}
