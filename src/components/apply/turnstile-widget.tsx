"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

/**
 * Thin wrapper around the Cloudflare Turnstile widget.
 *
 * We deliberately don't use an npm wrapper because the widget script is
 * loaded from Cloudflare and wrappers tend to drift behind the actual API.
 * Instead we:
 *   - load the script once via `next/script`
 *   - render a div with the site key
 *   - receive the token back through `onToken`
 *
 * Rendered as a noop when siteKey is empty (env not configured).
 */

interface TurnstileWindow extends Window {
  turnstile?: {
    render: (
      el: HTMLElement,
      options: {
        sitekey: string;
        callback?: (token: string) => void;
        "error-callback"?: () => void;
        "expired-callback"?: () => void;
        theme?: "auto" | "light" | "dark";
        action?: string;
      },
    ) => string;
    remove: (id: string) => void;
    reset: (id?: string) => void;
  };
}

interface Props {
  siteKey: string;
  onToken: (token: string) => void;
  theme?: "auto" | "light" | "dark";
}

export function TurnstileWidget({ siteKey, onToken, theme = "auto" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    const win = window as TurnstileWindow;

    function renderWhenReady() {
      if (!ref.current || !win.turnstile) return;
      widgetIdRef.current = win.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme,
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    }

    if (win.turnstile) {
      renderWhenReady();
    } else {
      const interval = setInterval(() => {
        if (win.turnstile) {
          clearInterval(interval);
          renderWhenReady();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (widgetIdRef.current && win.turnstile) {
        try {
          win.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget might already be torn down — safe to ignore.
        }
      }
    };
  }, [siteKey, onToken, theme]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div ref={ref} />
    </>
  );
}
