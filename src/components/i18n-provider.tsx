"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getMessages, type Messages } from "@/lib/i18n/messages";

/**
 * Values that can be interpolated into a translated string via `{name}`
 * placeholders. Numbers are coerced to strings. Strings render verbatim.
 */
export type TranslationValues = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  /**
   * Look up a translation by dot-notation key. Optional `values` object
   * fills `{name}` placeholders in the string (e.g. `"Hello {name}"`).
   * If the key is missing, returns the key itself so the gap is visible.
   */
  t: (key: string, values?: TranslationValues) => string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function lookup(messages: unknown, key: string): string {
  const parts = key.split(".");
  let cur: unknown = messages;
  for (const part of parts) {
    if (cur && typeof cur === "object" && part in (cur as object)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof cur === "string" ? cur : key;
}

function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => {
    const v = values[name];
    return v === undefined ? match : String(v);
  });
}

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo<I18nContextValue>(() => {
    const messages = getMessages(locale);
    return {
      locale,
      messages,
      t: (key: string, values?: TranslationValues) =>
        interpolate(lookup(messages, key), values),
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside an <I18nProvider>");
  }
  return ctx;
}
