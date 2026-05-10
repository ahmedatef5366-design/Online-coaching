"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-card text-foreground rounded-md shadow-lg",
          title: "font-semibold text-sm",
          description: "text-xs text-muted-foreground",
        },
      }}
    />
  );
}
