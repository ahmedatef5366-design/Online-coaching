import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";
import type { Locale } from "./config";

export type Messages = typeof en;

const map: Record<Locale, Messages> = { en, ar: ar as Messages };

export function getMessages(locale: Locale): Messages {
  return map[locale] ?? en;
}
