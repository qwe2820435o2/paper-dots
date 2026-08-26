"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setInitialPanel } from "@/store/slices/decorateSlice";
import { applyDecoratePhoto } from "@/lib/decoratePhotoUpload";
import { applyMomentCardPhoto } from "@/lib/momentCardPhotoUpload";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Which editor this button uploads into and lands on. Add a case here (route + store write)
 *  when a third tool needs the same "upload then land in the editor" CTA. */
const TARGETS = {
    dot: "/create/dot",
    "moment-card": "/create/moment-card",
} as const;

type UploadTarget = keyof typeof TARGETS;

interface UploadPhotoButtonProps {
    children: React.ReactNode;
    /** Fully replaces the button's visual class list — callers sit in different styling
     *  contexts (guide-scope's `.guide-btn`, Header's hand-rolled pill), so nothing is
     *  baked in here by default. */
    className?: string;
    trackId: string;
    /** Runs right before navigation — Header's mobile menu uses this to collapse itself. */
    onBeforeNavigate?: () => void;
    /** Which editor to load the photo into and navigate to. */
    target: UploadTarget;
}

/** A "Upload a photo" CTA that behaves like the target editor's own uploader: pick a file,
 *  load it into that editor's store, then navigate there with its default upload panel
 *  already open. Redux's Provider lives above every route in the locale layout, so the store
 *  state written here survives the client-side navigation into the editor. */
export default function UploadPhotoButton({ children, className, trackId, onBeforeNavigate, target }: UploadPhotoButtonProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [uploading, setUploading] = useState(false);

    async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !file.type.startsWith("image/")) return;

        const destination = TARGETS[target];
        setUploading(true);
        trackEvent("guide_cta_click", { cta_id: trackId, destination });

        if (target === "dot") {
            await dispatch(applyDecoratePhoto(file));
            dispatch(setInitialPanel("dots"));
        } else {
            // MomentCardApp already opens its "text" panel as soon as a photo lands, so no
            // pending-panel flag is needed here (unlike DecorateApp's default "layout" panel).
            await dispatch(applyMomentCardPhoto(file));
        }

        onBeforeNavigate?.();
        router.push(destination);
    }

    return (
        <label className={cn(className, uploading && "pointer-events-none opacity-70")}>
            {children}
            <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </label>
    );
}
