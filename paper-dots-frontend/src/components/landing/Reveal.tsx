"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
    children: React.ReactNode;
    className?: string;
}

/** Mockup's scroll-into-view fade + rise (`.reveal` / `.reveal.in` in guide.css), driven by
 *  a single-element IntersectionObserver ported from home-desktop.html's inline script. */
export default function Reveal({ children, className }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    io.unobserve(el);
                }
            },
            { threshold: 0.1 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} className={cn("reveal", inView && "in", className)}>
            {children}
        </div>
    );
}
