"use client";

import { useCallback, useState, useTransition } from "react";
import { saveSection } from "@/lib/cms/actions";
import type { SectionContentMap, SectionKey } from "@/lib/cms/sections";
import type { SaveStatus } from "./save-bar";

export interface UseSectionFormResult<K extends SectionKey> {
  state: SectionContentMap[K];
  setState: (next: SectionContentMap[K]) => void;
  /** Update a single top-level field. */
  patch: <F extends keyof SectionContentMap[K]>(
    field: F,
    value: SectionContentMap[K][F],
  ) => void;
  /** Reset the form back to whatever was last saved (or initial if never saved). */
  reset: () => void;
  status: SaveStatus;
  error: string | null;
  submit: (e: React.FormEvent) => void;
  isPending: boolean;
  isDirty: boolean;
}

/**
 * Generic state-management hook for admin CMS forms. Handles dirty
 * tracking, optimistic save status, and revalidation through the
 * `saveSection` server action.
 */
export function useSectionForm<K extends SectionKey>(
  key: K,
  initial: SectionContentMap[K],
): UseSectionFormResult<K> {
  const [state, setStateInternal] = useState<SectionContentMap[K]>(initial);
  const [baseline, setBaseline] = useState<SectionContentMap[K]>(initial);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const setState = useCallback((next: SectionContentMap[K]) => {
    setStateInternal(next);
    setStatus("idle");
  }, []);

  const patch = useCallback(
    <F extends keyof SectionContentMap[K]>(
      field: F,
      value: SectionContentMap[K][F],
    ) => {
      setStateInternal((prev) => ({ ...prev, [field]: value }));
      setStatus("idle");
    },
    [],
  );

  const reset = useCallback(() => {
    setStateInternal(baseline);
    setStatus("idle");
    setError(null);
  }, [baseline]);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setStatus("saving");
      setError(null);
      startTransition(async () => {
        const res = await saveSection(key, state);
        if (res.ok) {
          setBaseline(state);
          setStatus("saved");
          setTimeout(() => {
            setStatus((cur) => (cur === "saved" ? "idle" : cur));
          }, 2200);
        } else {
          setStatus("error");
          setError(res.error ?? "Failed to save");
        }
      });
    },
    [key, state],
  );

  const isDirty = JSON.stringify(state) !== JSON.stringify(baseline);

  return {
    state,
    setState,
    patch,
    reset,
    status,
    error,
    submit,
    isPending,
    isDirty,
  };
}
