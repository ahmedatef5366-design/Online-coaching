import { createClient } from "@/lib/supabase/server";
import {
  SECTIONS,
  SECTION_DEFAULTS,
  type SectionContentMap,
  type SectionDescriptor,
  type SectionKey,
  withDefaults,
} from "./sections";

export interface LoadedSection<K extends SectionKey = SectionKey> {
  descriptor: SectionDescriptor;
  key: K;
  content: SectionContentMap[K];
  isPublished: boolean;
  updatedAt: string | null;
  /** True when there was no row at all in the DB and we're falling back to
   *  defaults. Editors show a "first save" hint when this is true. */
  isDefault: boolean;
}

interface SiteContentRow {
  section_key: string;
  content_json: unknown;
  is_published: boolean;
  updated_at: string;
}

/** Read every section row known to the registry. Missing rows are filled in
 *  with defaults so the public page and admin list always have a full set. */
export async function loadAllSections(): Promise<LoadedSection[]> {
  const supabase = createClient();
  const { data } = (await supabase
    .from("site_content")
    .select("section_key, content_json, is_published, updated_at")) as {
    data: SiteContentRow[] | null;
  };

  const byKey = new Map<string, SiteContentRow>();
  (data ?? []).forEach((row) => byKey.set(row.section_key, row));

  return SECTIONS.map((descriptor) => {
    const row = byKey.get(descriptor.key);
    if (!row) {
      return {
        descriptor,
        key: descriptor.key,
        content: SECTION_DEFAULTS[descriptor.key],
        isPublished: true,
        updatedAt: null,
        isDefault: true,
      } satisfies LoadedSection;
    }
    return {
      descriptor,
      key: descriptor.key,
      content: withDefaults(descriptor.key, row.content_json),
      isPublished: row.is_published,
      updatedAt: row.updated_at,
      isDefault: false,
    } satisfies LoadedSection;
  });
}

export async function loadSection<K extends SectionKey>(
  key: K,
): Promise<LoadedSection<K>> {
  const all = await loadAllSections();
  const found = all.find((s) => s.key === key);
  if (!found) {
    // Should never happen — every key in SECTIONS yields a LoadedSection.
    throw new Error(`Unknown section key: ${key}`);
  }
  return found as LoadedSection<K>;
}
