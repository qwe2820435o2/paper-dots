"use client";

import type { RefObject } from "react";
import type Konva from "konva";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
        <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={handleExport}
            disabled={!photoUrl}
        >
            <Download className="w-4 h-4" />
            Download PNG
        </Button>
    );
}
