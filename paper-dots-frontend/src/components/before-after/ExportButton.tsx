"use client";

import type { RefObject } from "react";
import type Konva from "konva";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { isTouchPrimaryDevice } from "@/lib/device";

interface Props {
    stageRef: RefObject<Konva.Stage | null>;
}

export default function ExportButton({ stageRef }: Props) {
    const t = useTranslations("editor");
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);
    const ready = !!beforeUrl && !!afterUrl;

    async function handleExport() {
        const stage = stageRef.current;
        if (!stage) return;
        const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });

        const blob = await (await fetch(dataUrl)).blob();
        const filename = `dottypic-${Date.now()}.png`;
        const file = new File([blob], filename, { type: "image/png" });

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
    }

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={!ready}
            className="flex-1 flex items-center justify-center gap-2 text-[14px] font-medium py-2.5 rounded-full transition-all"
            style={{
                background: ready ? "#C5E89A" : "rgba(197,232,154,0.3)",
                color: "#ffffff",
                cursor: ready ? "pointer" : "not-allowed",
                opacity: ready ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
                if (ready) (e.currentTarget as HTMLButtonElement).style.background = "#9ED06C";
            }}
            onMouseLeave={(e) => {
                if (ready) (e.currentTarget as HTMLButtonElement).style.background = "#C5E89A";
            }}
        >
            <Download className="w-4 h-4" strokeWidth={2} />
            {t("common.downloadPng")}
        </button>
    );
}
