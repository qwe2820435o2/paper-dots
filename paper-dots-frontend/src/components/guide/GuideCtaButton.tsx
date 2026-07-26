"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface GuideCtaButtonProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    /** Which CTA this is (e.g. "hero", "final-cta") — the only thing that makes the
     *  guide_cta_click event useful once there's more than one button on the page. */
    trackId: string;
}

/** The mockup's hard-shadow button — press animation lives in guide.css under
 *  `.guide-btn:active`. This is the only client component in the guide tree: everything
 *  else stays server-rendered, and this one exists purely to fire the click event. */
export default function GuideCtaButton({ href, children, className, trackId }: GuideCtaButtonProps) {
    return (
        <Link
            href={href}
            className={cn("guide-btn", className)}
            onClick={() => trackEvent("guide_cta_click", { cta_id: trackId, destination: href })}
        >
            {children}
        </Link>
    );
}
