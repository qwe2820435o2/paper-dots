declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

/** Fires a GA event if gtag loaded (see the script tags in the root layout). Guide CTAs use
 *  this so guide→editor click-through is measurable — otherwise a traffic change on a guide
 *  URL can't be told apart from a ranking effect vs. a funnel effect. */
export function trackEvent(name: string, params?: Record<string, unknown>) {
    if (typeof window !== "undefined") {
        window.gtag?.("event", name, params);
    }
}
