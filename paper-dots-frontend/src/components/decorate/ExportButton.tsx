"use client";

import type { RefObject } from "react";
import type Konva from "konva";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import type { LayoutType } from "@/store/slices/decorateSlice";

interface Props {
    stageRef: RefObject<Konva.Stage | null>;
}

interface CropBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

function computeExportCrop(type: LayoutType, p: number, W: number, H: number): CropBox {
    switch (type) {
        case "main-left": {
            const half = W / 2;
            if (p <= 50) return { x: 0, y: 0, width: half + (p / 50) * half, height: H };
            const offset = ((p - 50) / 50) * half;
            return { x: offset, y: 0, width: W - offset, height: H };
        }
        case "main-right": {
            const half = W / 2;
            if (p <= 50) {
                const offset = (1 - p / 50) * half;
                return { x: offset, y: 0, width: W - offset, height: H };
            }
            return { x: 0, y: 0, width: half + ((100 - p) / 50) * half, height: H };
        }
        case "main-top": {
            const half = H / 2;
            if (p <= 50) return { x: 0, y: 0, width: W, height: half + (p / 50) * half };
            const offset = ((p - 50) / 50) * half;
            return { x: 0, y: offset, width: W, height: H - offset };
        }
        case "main-bottom": {
            const half = H / 2;
            if (p <= 50) {
                const offset = (1 - p / 50) * half;
                return { x: 0, y: offset, width: W, height: H - offset };
            }
            return { x: 0, y: 0, width: W, height: half + ((100 - p) / 50) * half };
        }
        case "border":
            return { x: 0, y: 0, width: W, height: H };
    }
}

export default function ExportButton({ stageRef }: Props) {
    const photoUrl = useAppSelector((s) => s.decorate.photoUrl);
    const layout = useAppSelector((s) => s.decorate.layout);

    function handleExport() {
        const stage = stageRef.current;
        if (!stage) return;
        const prevScale = stage.scaleX();
        stage.scale({ x: 1, y: 1 });
        const crop = computeExportCrop(layout.type, layout.ratio, stage.width(), stage.height());
        const dataUrl = stage.toDataURL({ ...crop, pixelRatio: 2, mimeType: "image/png" });
        stage.scale({ x: prevScale, y: prevScale });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `paper-dots-${Date.now()}.png`;
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
                background: photoUrl ? "#F39EB6" : "rgba(243,158,182,0.3)",
                color: "#ffffff",
                cursor: photoUrl ? "pointer" : "not-allowed",
                opacity: photoUrl ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
                if (photoUrl) (e.currentTarget as HTMLButtonElement).style.background = "#E8809E";
            }}
            onMouseLeave={(e) => {
                if (photoUrl) (e.currentTarget as HTMLButtonElement).style.background = "#F39EB6";
            }}
        >
            <Download className="w-4 h-4" strokeWidth={2} />
            Download PNG
        </button>
    );
}
