"use client";

import type { RefObject } from "react";
import type Konva from "konva";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";

interface Props {
    stageRef: RefObject<Konva.Stage | null>;
}

export default function MomentCardExportButton({ stageRef }: Props) {
    const photoUrl = useAppSelector((s) => s.momentCard.photoUrl);

    async function handleExport() {
        const stage = stageRef.current;
        if (!stage) return;
        const prevScale = stage.scaleX();
        stage.scale({ x: 1, y: 1 });
        const dataUrl = stage.toDataURL({
            x: 0,
            y: 0,
            width: stage.width(),
            height: stage.height(),
            pixelRatio: 2,
            mimeType: "image/png",
        });
        stage.scale({ x: prevScale, y: prevScale });

        const filename = `moment-card-${Date.now()}.png`;
        const isMobile = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;

        if (isMobile && typeof navigator.canShare === "function") {
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
