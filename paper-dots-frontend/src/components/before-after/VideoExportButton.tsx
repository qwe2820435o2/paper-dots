"use client";

import type { RefObject } from "react";
import type Konva from "konva";
import { Video } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSliderPosition } from "@/store/slices/beforeAfterSlice";
import { isTouchPrimaryDevice } from "@/lib/device";

interface Props {
    stageRef: RefObject<Konva.Stage | null>;
    /** Owned by `BeforeAfterApp`, same as `GifExportButton` — the sweep screenshots the live
     *  stage frame by frame onto a recording canvas, so anything that resizes the stage or swaps
     *  its render branch mid-run would corrupt the capture. */
    busy: boolean;
    onBusyChange: (busy: boolean) => void;
}

const VIDEO_DURATION_MS = 1800;
const VIDEO_FPS = 24;

function waitForRedraw(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/** Sweeps the divider 0% → 100% → 0% while recording the live stage into a WebM clip via
 *  `MediaRecorder`. Only meaningful for the "slider" layout — the caller is responsible for only
 *  rendering this button there. Unlike the GIF export, there is no worker to stall on: the
 *  capture just draws each redrawn frame onto a canvas and lets `MediaRecorder` pull it off a
 *  `captureStream()`. */
export default function VideoExportButton({ stageRef, busy, onBusyChange }: Props) {
    const t = useTranslations("editor");
    const tBeforeAfter = useTranslations("editor.beforeAfter");
    const dispatch = useAppDispatch();
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);
    const sliderPosition = useAppSelector((s) => s.beforeAfter.sliderPosition);
    const ready = !!beforeUrl && !!afterUrl;

    async function handleExport() {
        const stage = stageRef.current;
        if (!stage || busy) return;
        if (typeof MediaRecorder === "undefined") {
            toast.error(t("toast.exportFailed"));
            return;
        }

        const originalPosition = sliderPosition;
        onBusyChange(true);

        try {
            const recCanvas = document.createElement("canvas");
            recCanvas.width = stage.width();
            recCanvas.height = stage.height();
            const ctx = recCanvas.getContext("2d");
            if (!ctx) throw new Error("2D context unavailable");

            const stream = recCanvas.captureStream(VIDEO_FPS);
            const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
                ? "video/webm;codecs=vp9"
                : "video/webm";
            const recorder = new MediaRecorder(stream, { mimeType });
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size) chunks.push(e.data);
            };
            const stopped = new Promise<Blob>((resolve) => {
                recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
            });

            recorder.start();

            const start = performance.now();
            await new Promise<void>((resolve) => {
                const tick = async (now: number) => {
                    const progress = Math.min(1, (now - start) / VIDEO_DURATION_MS);
                    // 0 -> 100 -> 0 over the full duration.
                    const slide = 50 - 50 * Math.cos(progress * Math.PI * 2);
                    dispatch(setSliderPosition(slide));
                    await waitForRedraw();
                    ctx.drawImage(stage.toCanvas(), 0, 0, recCanvas.width, recCanvas.height);
                    if (progress < 1) requestAnimationFrame(tick);
                    else resolve();
                };
                requestAnimationFrame(tick);
            });

            recorder.stop();
            const blob = await stopped;
            dispatch(setSliderPosition(originalPosition));

            const filename = `dottypic-${Date.now()}.webm`;
            const file = new File([blob], filename, { type: mimeType });

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
            onBusyChange(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={!ready || busy}
            className="flex-1 min-w-0 flex items-center justify-center gap-2 whitespace-nowrap text-[14px] font-medium py-2.5 px-4 rounded-full border transition-colors border-[#9ED06C] text-[#4C7A2E] hover:bg-[#F4FAE8] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
        >
            <Video className="w-4 h-4" strokeWidth={2} />
            {busy ? tBeforeAfter("recordingVideo") : tBeforeAfter("downloadVideo")}
        </button>
    );
}
