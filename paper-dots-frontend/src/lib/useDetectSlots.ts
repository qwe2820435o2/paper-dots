"use client";

import { useState, useEffect } from "react";
import type { TemplateDef, PlaceholderDef } from "./templates";
import { detectSlots } from "./detectSlots";

export type SlotDetectionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; placeholders: PlaceholderDef[] }
  | { status: "error"; error: Error };

// Module-level cache: survives component unmounts for the session lifetime
const cache = new Map<string, PlaceholderDef[]>();

export function useDetectSlots(template: TemplateDef): SlotDetectionState {
  const imageUrl = template.backgroundImage;

  const [state, setState] = useState<SlotDetectionState>(() => {
    if (!imageUrl) return { status: "idle" };
    const cached = cache.get(imageUrl);
    if (cached) return { status: "ready", placeholders: cached };
    return { status: "loading" };
  });

  useEffect(() => {
    if (!imageUrl) {
      setState({ status: "idle" });
      return;
    }

    const cached = cache.get(imageUrl);
    if (cached) {
      setState({ status: "ready", placeholders: cached });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    detectSlots(imageUrl, template.canvasWidth, template.canvasHeight, template.slotCount)
      .then((placeholders) => {
        if (cancelled) return;
        cache.set(imageUrl, placeholders);
        setState({ status: "ready", placeholders });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ status: "error", error: err instanceof Error ? err : new Error(String(err)) });
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, template.canvasWidth, template.canvasHeight, template.slotCount]);

  return state;
}
