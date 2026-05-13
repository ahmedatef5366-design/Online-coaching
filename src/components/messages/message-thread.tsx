"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markThreadRead } from "@/lib/messages/actions";
import type { Message } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n-provider";

interface Props {
  clientId: string;
  currentUserId: string;
  initialMessages: Message[];
  locale: Locale;
  /**
   * Display name of the *other* party — coach name on the client side,
   * client name on the admin side. Used in empty-state copy only.
   */
  otherPartyName?: string;
}

function formatTime(iso: string, locale: Locale): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function MessageThread({
  clientId,
  currentUserId,
  initialMessages,
  locale,
  otherPartyName,
}: Props) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the latest message whenever the list grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // On mount and when messages change: mark inbound messages as read.
  const runMarkRead = useCallback(() => {
    startTransition(async () => {
      await markThreadRead(clientId);
    });
  }, [clientId]);

  useEffect(() => {
    runMarkRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to realtime INSERTs in this thread.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
          );
          if (incoming.sender_id !== currentUserId) {
            runMarkRead();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, currentUserId, runMarkRead]);

  const handleSend = useCallback(() => {
    const trimmed = body.trim();
    if (!trimmed || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await sendMessage(clientId, trimmed);
      if (!result.ok) {
        setError(result.error ?? "Send failed.");
        return;
      }
      setBody("");
      // Realtime usually beats this, but optimistically append in case
      // the channel hasn't connected yet (e.g. first send right after mount).
      if (result.data) {
        setMessages((prev) =>
          prev.some((m) => m.id === result.data!.id)
            ? prev
            : [
                ...prev,
                {
                  id: result.data!.id,
                  client_id: clientId,
                  sender_id: currentUserId,
                  body: trimmed,
                  created_at: new Date().toISOString(),
                  read_at: null,
                },
              ],
        );
      }
    });
  }, [body, clientId, currentUserId, isPending]);

  return (
    <div className="flex h-[70vh] min-h-[420px] flex-col rounded-lg border border-border/60 bg-card/40">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {otherPartyName
              ? t("messages_thread.empty_with_name", { name: otherPartyName })
              : t("messages_thread.empty_generic")}
          </p>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => {
              const mine = m.sender_id === currentUserId;
              return (
                <li
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        mine
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(m.created_at, locale)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-end gap-2 border-t border-border/60 px-3 py-3"
      >
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t("messages_thread.placeholder")}
          rows={2}
          maxLength={4000}
          className="min-h-[44px] resize-none"
        />
        <Button
          type="submit"
          disabled={isPending || body.trim() === ""}
          aria-label={t("messages_thread.send_aria")}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">{t("messages_thread.send_aria")}</span>
        </Button>
      </form>
      {error ? (
        <p className="px-3 pb-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
