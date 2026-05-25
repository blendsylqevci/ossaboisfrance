"use client";

import { useEffect } from "react";

export function HouseTitleDispatcher({ title }: { title: string }) {
  useEffect(() => {
    if (typeof window !== "undefined" && title) {
      const event = new CustomEvent("house-title-loaded", { detail: title });
      window.dispatchEvent(event);
    }
  }, [title]);

  return null;
}
