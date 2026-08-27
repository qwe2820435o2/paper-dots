"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAppSelector } from "@/store/hooks";
import BeforeAfterUploader from "@/components/before-after/Uploader";
import GuideCtaButton from "./GuideCtaButton";
import { trackEvent } from "@/lib/analytics";

interface Props {
    /** Guide copy's own CTA text — reused as the label for the manual "continue" fallback
     *  link (see below), so no new translation key is needed. */
    ctaLabel: string;
    /** Extra classes for the fallback link only (e.g. "guide-btn-invert" on the final-cta's
     *  dark panel). The uploader itself carries no button styling to override. */
    className?: string;
}

/** Drops the editor's own two-slot dropzone (`BeforeAfterUploader`) straight onto the guide
 *  page: once both slots are filled, it navigates into `/create/before-after` itself, so the
 *  editor lands already "ready" instead of showing its own upload step a second time.
 *
 *  Only navigates on the before->after transition that happens *during this mount* — never
 *  because the store already held both photos when the component mounted (e.g. the browser
 *  back button from the editor). Otherwise back navigation would bounce straight forward
 *  again into the editor. In that already-ready case a manual "continue" link is shown
 *  instead so the user isn't stuck. */
export default function GuideBeforeAfterUploaderCta({ ctaLabel, className }: Props) {
    const router = useRouter();
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);
    const wasReadyOnMount = useRef(!!beforeUrl && !!afterUrl);

    useEffect(() => {
        if (wasReadyOnMount.current) return;
        if (beforeUrl && afterUrl) {
            trackEvent("guide_cta_click", { cta_id: "hero", destination: "/create/before-after" });
            router.push("/create/before-after");
        }
    }, [beforeUrl, afterUrl, router]);

    return (
        <div className="flex flex-col gap-3">
            <BeforeAfterUploader />
            {wasReadyOnMount.current && (
                <GuideCtaButton href="/create/before-after" trackId="hero-continue" className={className}>
                    {ctaLabel}
                </GuideCtaButton>
            )}
        </div>
    );
}
