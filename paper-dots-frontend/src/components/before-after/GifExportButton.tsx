"use client";

import { useState, type RefObject } from "react";
import type Konva from "konva";
import type GIF from "gif.js";
import { Film } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSliderPosition } from "@/store/slices/beforeAfterSlice";
import { isTouchPrimaryDevice } from "@/lib/device";

interface Props {
    stageRef: RefObject<Konva.Stage | null>;
    /** Owned by `BeforeAfterApp` rather than kept local: the sweep screenshots the live stage
     *  frame by frame, so a layout switch, an align-mode toggle, or a PNG export landing
     *  mid-run would resize the stage under it and hand `gif.js` frames that no longer match
     *  the first one — which locks the output canvas size. The parent needs the flag to lock
     *  the rest of the editor for the duration. */
    busy: boolean;
    onBusyChange: (busy: boolean) => void;
}

/** Longer edge of a captured GIF frame, in px. Kept well below the PNG export's resolution —
 *  GIFs are quantized to a 256-color palette and shared at chat/feed sizes, so spending
 *  encode time (and file size) on a 1080px frame buys nothing. */
const GIF_MAX_EDGE = 480;
/** Percent step between captured frames of the divider sweep. */
const FRAME_STEP = 5;
/** ms each frame is shown for in the rendered GIF. */
const FRAME_DELAY = 50;

/** How long encoding may go without advancing before it is treated as dead, in ms.
 *
 *  `gif.js` has no `error` event: it hands each frame to a web worker and waits for a message
 *  back, so a worker script that 404s, is blocked, or throws simply never replies and
 *  `finished` never fires. That used to strand `busy` at `true`; now that an export freezes the
 *  whole editor, a silent hang would lock the user out of the tool entirely until they reload.
 *  A stall timer catches both failure shapes — a worker that never starts and one that dies
 *  partway — where a single overall deadline would have to be long enough for the slowest
 *  phone to finish a full sweep and would therefore catch neither quickly. */
const ENCODE_STALL_TIMEOUT = 20000;

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

/** Runs the encode, rejecting instead of hanging if it stops making progress (see
 *  `ENCODE_STALL_TIMEOUT`). `render()` also throws synchronously on a worker the browser
 *  refuses to construct, which the executor turns into a rejection for free. */
function renderGif(gif: GIF, onProgress: (percent: number) => void): Promise<Blob> {
    return new Promise((resolve, reject) => {
        let stallTimer: ReturnType<typeof setTimeout>;
        const armStallTimer = () => {
            clearTimeout(stallTimer);
            stallTimer = setTimeout(() => {
                gif.abort();
                reject(new Error("GIF encoding stalled"));
            }, ENCODE_STALL_TIMEOUT);
        };

        gif.on("progress", (percent) => {
            armStallTimer();
            onProgress(percent);
        });
        gif.on("finished", (blob) => {
            clearTimeout(stallTimer);
            resolve(blob);
        });

        armStallTimer();
        gif.render();
    });
}

/** Sweeps the divider 0% → 100% → 0% and re-encodes what's on screen into a looping GIF.
 *  Only meaningful for the "slider" layout — the caller is responsible for only rendering this
 *  button there. */
export default function GifExportButton({ stageRef, busy, onBusyChange }: Props) {
    const t = useTranslations("editor");
    const tBeforeAfter = useTranslations("editor.beforeAfter");
    const dispatch = useAppDispatch();
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);
    const sliderPosition = useAppSelector((s) => s.beforeAfter.sliderPosition);
    const ready = !!beforeUrl && !!afterUrl;
    const [progress, setProgress] = useState(0);

    async function handleExport() {
        const stage = stageRef.current;
        if (!stage || busy) return;

        const originalPosition = sliderPosition;
        onBusyChange(true);
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

            const blob = await renderGif(gif, (percent) => setProgress(50 + Math.round(percent * 50)));

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
            onBusyChange(false);
            setProgress(0);
        }
    }

    const label = busy ? tBeforeAfter("encodingGif", { percent: progress }) : tBeforeAfter("downloadGif");

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={!ready || busy}
            className="flex-1 min-w-0 flex items-center justify-center gap-2 whitespace-nowrap text-[14px] font-medium py-2.5 px-4 rounded-full border transition-colors border-[#9ED06C] text-[#4C7A2E] hover:bg-[#F4FAE8] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
        >
            <Film className="w-4 h-4" strokeWidth={2} />
            {label}
        </button>
    );
}
