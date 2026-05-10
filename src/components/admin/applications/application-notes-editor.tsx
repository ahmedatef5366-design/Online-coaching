"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateApplicationNotes } from "@/lib/applications/actions";
import type { Locale } from "@/lib/i18n/config";

interface Props {
  applicationId: string;
  initialNotes: string;
  locale: Locale;
}

export function ApplicationNotesEditor({
  applicationId,
  initialNotes,
  locale,
}: Props) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [notes, setNotes] = useState(initialNotes);
  const [savedNotes, setSavedNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  const dirty = notes !== savedNotes;

  function save() {
    startTransition(async () => {
      const res = await updateApplicationNotes(applicationId, notes);
      if (res.ok) {
        toast.success(t("Notes saved", "تم حفظ الملاحظات"));
        setSavedNotes(notes);
      } else {
        toast.error(res.error ?? t("Failed", "فشل"));
      }
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        placeholder={t(
          "Private notes — only admins see these.",
          "ملاحظات خاصة — الأدمن فقط يشوفها.",
        )}
      />
      <div className="flex items-center justify-end">
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={!dirty || isPending}
        >
          {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          {t("Save notes", "حفظ الملاحظات")}
        </Button>
      </div>
    </div>
  );
}
