import { cn } from "@/lib/utils";

/** Renders in place of a missing guide image. The sheet is allowed to leave image cells
 *  empty, so this — not a broken <img> — is what ships when copy lands before the asset
 *  does. */
export default function GuideMediaPlaceholder({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn(
                "guide-placeholder flex h-full w-full items-center justify-center rounded-guide border border-guide-edge",
                className
            )}
        />
    );
}
