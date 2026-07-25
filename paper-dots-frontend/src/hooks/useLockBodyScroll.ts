"use client";

import { useEffect } from "react";

/** Locks page scroll for as long as the calling component is mounted. Restores whatever
 *  `overflow` value was already on `document.body` beforehand (not assumed to be empty) once
 *  it unmounts, so it doesn't clobber a value some other component had set. */
export function useLockBodyScroll(): void {
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, []);
}
