"use client";

import type { RefObject } from "react";
import type Konva from "konva";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";

interface Props {
    stageRef: RefObject<Konva.Stage | null>;
}

export default function ExportButton({ stageRef }: Props) {
    const photoUrl = useAppSelector((s) => s.decorate.photoUrl);

    function handleExport() {
        const stage = stageRef.current;
        if (!stage) return;
        const prevScale = stage.scaleX();
        stage.scale({ x: 1, y: 1 });
        const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
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
                background: photoUrl ? "#4338CA" : "rgba(67,56,202,0.3)",
                color: "#ffffff",
                cursor: photoUrl ? "pointer" : "not-allowed",
                opacity: photoUrl ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
                if (photoUrl) (e.currentTarget as HTMLButtonElement).style.background = "#3730A3";
            }}
            onMouseLeave={(e) => {
                if (photoUrl) (e.currentTarget as HTMLButtonElement).style.background = "#4338CA";
            }}
        >
            <Download className="w-4 h-4" strokeWidth={2} />
            Download PNG
        </button>
    );
}
