"use client";

import type { RefObject } from "react";
import type Konva from "konva";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { STAGE_W, STAGE_H, PAGE_INSET_X, PAGE_INSET_Y, CARD_RADIUS } from "@/components/moment-card/MomentCardCanvas";
import { isTouchPrimaryDevice } from "@/lib/device";

interface Props {
    stageRef: RefObject<Konva.Stage | null>;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function applyRoundedCorners(dataUrl: string, w: number, h: number, r: number): Promise<string> {
    const img = await loadImage(dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
}

export default function MomentCardExportButton({ stageRef }: Props) {
    const photoUrl = useAppSelector((s) => s.momentCard.photoUrl);

    async function handleExport() {
        const stage = stageRef.current;
        if (!stage) return;
        const prevScale = stage.scaleX();
        stage.scale({ x: 1, y: 1 });
        const pixelRatio = 2;
        const cardW = STAGE_W - PAGE_INSET_X * 2;
        const cardH = STAGE_H - PAGE_INSET_Y * 2;
        const rawDataUrl = stage.toDataURL({
            x: PAGE_INSET_X,
            y: PAGE_INSET_Y,
            width: cardW,
            height: cardH,
            pixelRatio,
            mimeType: "image/png",
        });
        stage.scale({ x: prevScale, y: prevScale });

        const dataUrl = await applyRoundedCorners(
            rawDataUrl,
            cardW * pixelRatio,
            cardH * pixelRatio,
            CARD_RADIUS * pixelRatio,
        );

        const filename = `moment-card-${Date.now()}.png`;

        if (isTouchPrimaryDevice() && typeof navigator.canShare === "function") {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], filename, { type: "image/png" });
            if (navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({ files: [file] });
                    return;
                } catch (err) {
                    if ((err as DOMException)?.name === "AbortError") return;
                }
            }
        }

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Saved to your downloads");
    }

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={!photoUrl}
            className="w-full flex items-center justify-center gap-2 text-[14px] font-medium py-2.5 rounded-full transition-all"
            style={{
                background: photoUrl ? "#C5E89A" : "rgba(197,232,154,0.3)",
                color: "#ffffff",
                cursor: photoUrl ? "pointer" : "not-allowed",
                opacity: photoUrl ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
                if (photoUrl) (e.currentTarget as HTMLButtonElement).style.background = "#9ED06C";
            }}
            onMouseLeave={(e) => {
                if (photoUrl) (e.currentTarget as HTMLButtonElement).style.background = "#C5E89A";
            }}
        >
            <Download className="w-4 h-4" strokeWidth={2} />
            Download PNG
        </button>
    );
}
