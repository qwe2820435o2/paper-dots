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
        const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
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
            className="w-full flex items-center justify-center gap-2 bg-white text-black text-[14px] font-medium py-2.5 rounded-[100px] transition-opacity"
            style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                opacity: photoUrl ? 1 : 0.35,
                cursor: photoUrl ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
                if (photoUrl) (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
                if (photoUrl) (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
        >
            <Download className="w-4 h-4" strokeWidth={2} />
            Download PNG
        </button>
    );
}
