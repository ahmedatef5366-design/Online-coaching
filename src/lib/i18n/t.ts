import { getMessages, type Messages } from "./messages";
import type { Locale } from "./config";

/**
 * Translation values for `{name}` placeholders in a translated string.
 * Numbers are coerced to strings.
 */
export type TranslationValues = Record<string, string | number>;

function lookup(messages: Messages, key: string): string {
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

/**
 * Build a translation function bound to a locale, for use in server
 * components and other server-side code. Mirrors the client `useI18n().t`.
 */
export function getT(
  locale: Locale,
): (key: string, values?: TranslationValues) => string {
  const messages = getMessages(locale);
  return (key, values) => interpolate(lookup(messages, key), values);
}
