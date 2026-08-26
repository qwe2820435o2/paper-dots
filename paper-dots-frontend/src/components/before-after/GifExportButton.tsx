"use client";

import { useState, type RefObject } from "react";
import type Konva from "konva";
import { Film } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSliderPosition } from "@/store/slices/beforeAfterSlice";
import { isTouchPrimaryDevice } from "@/lib/device";

interface Props {
    stageRef: RefObject<Konva.Stage | null>;
}

/** Longer edge of a captured GIF frame, in px. Kept well below the PNG export's resolution —
 *  GIFs are quantized to a 256-color palette and shared at chat/feed sizes, so spending
 *  encode time (and file size) on a 1080px frame buys nothing. */
const GIF_MAX_EDGE = 480;
/** Percent step between captured frames of the divider sweep. */
const FRAME_STEP = 5;
/** ms each frame is shown for in the rendered GIF. */
const FRAME_DELAY = 50;

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load captured frame"));
        img.src = src;
    });
}

function waitForRedraw(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/** Sweeps the divider 0% → 100% → 0% and re-encodes what's on screen into a looping GIF.
 *  Only meaningful for the "slider" layout — the caller is responsible for only rendering this
 *  button there. */
export default function GifExportButton({ stageRef }: Props) {
    const t = useTranslations("editor");
    const tBeforeAfter = useTranslations("editor.beforeAfter");
    const dispatch = useAppDispatch();
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);
    const sliderPosition = useAppSelector((s) => s.beforeAfter.sliderPosition);
    const ready = !!beforeUrl && !!afterUrl;
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);

    async function handleExport() {
        const stage = stageRef.current;
        if (!stage || busy) return;

        const originalPosition = sliderPosition;
        setBusy(true);
        setProgress(0);

        try {
            const { default: GIF } = await import("gif.js");
            const gif = new GIF({ workers: 2, quality: 10, workerScript: "/gif.worker.js" });

            const forward: number[] = [];
            for (let p = 0; p <= 100; p += FRAME_STEP) forward.push(p);
            if (forward[forward.length - 1] !== 100) forward.push(100);
            const sequence = [...forward, ...[...forward].reverse().slice(1)];

            const longEdge = Math.max(stage.width(), stage.height());
            const pixelRatio = Math.min(1, GIF_MAX_EDGE / longEdge);

            for (let i = 0; i < sequence.length; i++) {
                dispatch(setSliderPosition(sequence[i]));
                await waitForRedraw();
                const dataUrl = stage.toDataURL({ pixelRatio, mimeType: "image/png" });
                const img = await loadImage(dataUrl);
                gif.addFrame(img, { delay: FRAME_DELAY });
                setProgress(Math.round(((i + 1) / sequence.length) * 50));
            }

            dispatch(setSliderPosition(originalPosition));

            const blob = await new Promise<Blob>((resolve) => {
                gif.on("progress", (pct) => setProgress(50 + Math.round(pct * 50)));
                gif.on("finished", (result) => resolve(result));
                gif.render();
            });

            const filename = `dottypic-${Date.now()}.gif`;
            const file = new File([blob], filename, { type: "image/gif" });

            if (
                isTouchPrimaryDevice() &&
                typeof navigator !== "undefined" &&
                typeof navigator.canShare === "function" &&
                navigator.canShare({ files: [file] })
            ) {
                try {
                    await navigator.share({ files: [file] });
                    return;
                } catch (err) {
                    if ((err as DOMException)?.name === "AbortError") return;
                }
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.rel = "noopener";
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            toast.success(t("toast.saved"));
        } catch {
            dispatch(setSliderPosition(originalPosition));
            toast.error(t("toast.exportFailed"));
        } finally {
            setBusy(false);
            setProgress(0);
        }
    }

    const label = busy ? tBeforeAfter("encodingGif", { percent: progress }) : tBeforeAfter("downloadGif");

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={!ready || busy}
            className="flex-1 flex items-center justify-center gap-2 text-[14px] font-medium py-2.5 rounded-full transition-all border"
            style={{
                background: "#ffffff",
                borderColor: "#D2EAAA",
                color: ready && !busy ? "#1a1a2e" : "#9CA3AF",
                cursor: ready && !busy ? "pointer" : "not-allowed",
                opacity: ready ? 1 : 0.5,
            }}
        >
            <Film className="w-4 h-4" strokeWidth={2} />
            {label}
        </button>
    );
}
