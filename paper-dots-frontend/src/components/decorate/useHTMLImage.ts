"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

/** Load an HTMLImageElement from a URL (object URL or http).
 *
 *  A decode failure resolves to `null` and surfaces a toast — without one the editor just sits
 *  on a blank canvas with no explanation of what went wrong. The toast is keyed by `src` so the
 *  same failing image mounted in two places (the polka-dot preview and its export panel both
 *  load `config.iconUrl`) collapses into a single message rather than stacking. */
export function useHTMLImage(src: string | null): HTMLImageElement | null {
    const t = useTranslations("editor.toast");
    const [img, setImg] = useState<HTMLImageElement | null>(null);

    // Held in a ref so the load effect stays keyed on `src` alone: taking `t` as a dependency
    // would re-fetch and re-decode the image on any render that hands back a new function.
    const tRef = useRef(t);
    tRef.current = t;

    useEffect(() => {
        if (!src) {
            setImg(null);
            return;
        }
        const next = new window.Image();
        next.crossOrigin = "anonymous";
        next.src = src;
        let cancelled = false;
        next.onload = () => {
            if (!cancelled) setImg(next);
        };
        next.onerror = () => {
            if (cancelled) return;
            // Drop whatever was showing: it belongs to the previous `src`, and leaving it up
            // would read as "the new image loaded" when it did not.
            setImg(null);
            toast.error(tRef.current("imageLoadFailed"), { id: `image-load-failed:${src}` });
        };
        return () => {
            cancelled = true;
        };
    }, [src]);

    return img;
}
