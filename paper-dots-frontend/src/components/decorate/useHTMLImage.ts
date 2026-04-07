"use client";

import { useEffect, useState } from "react";

/** Load an HTMLImageElement from a URL (object URL or http). */
export function useHTMLImage(src: string | null): HTMLImageElement | null {
    const [img, setImg] = useState<HTMLImageElement | null>(null);

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
        return () => {
            cancelled = true;
        };
    }, [src]);

    return img;
}
