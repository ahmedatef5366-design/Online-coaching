"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setSectionPublished } from "@/lib/cms/actions";
import type { SectionKey } from "@/lib/cms/sections";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  sectionKey: SectionKey;
  initialPublished: boolean;
  locale: Locale;
}

export function SectionPublishToggle({
  sectionKey,
  initialPublished,
  locale,
}: Props) {
  const [published, setPublished] = useState(initialPublished);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: boolean) => {
    setError(null);
    const previous = published;
    setPublished(next); // optimistic
    startTransition(async () => {
      const res = await setSectionPublished(sectionKey, next);
      if (!res.ok) {
        setPublished(previous);
        setError(res.error ?? "Failed to update.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={published}
        onCheckedChange={handleChange}
        disabled={isPending}
        ariaLabel={locale === "ar" ? "تبديل النشر" : "Toggle published"}
      />
      <span className="text-xs text-muted-foreground">
        {published
          ? locale === "ar"
            ? "ظاهر"
            : "Visible"
          : locale === "ar"
            ? "مخفي"
            : "Hidden"}
      </span>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
