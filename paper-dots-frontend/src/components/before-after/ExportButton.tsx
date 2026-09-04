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
    format: "png" | "jpg";
    /** Set while a GIF/video export is sweeping the divider — grabbing the stage then would
     *  capture a mid-sweep frame instead of what the user is looking at. */
    disabled?: boolean;
}

export default function ExportButton({ stageRef, format, disabled = false }: Props) {
    const t = useTranslations("editor");
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);
    const ready = !!beforeUrl && !!afterUrl && !disabled;

    async function handleExport() {
        const stage = stageRef.current;
        if (!stage || !ready) return;
        const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
        const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType, quality: format === "jpg" ? 0.92 : undefined });

        const blob = await (await fetch(dataUrl)).blob();
        const filename = `dottypic-${Date.now()}.${format}`;
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
    }

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={!ready}
            className="flex-1 min-w-0 flex items-center justify-center gap-2 whitespace-nowrap text-[14px] font-medium py-2.5 px-4 rounded-full shadow-[0_2px_8px_rgba(158,208,108,0.35)] transition-colors bg-[#9ED06C] text-white hover:bg-[#8AC257] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
            <Download className="w-4 h-4" strokeWidth={2} />
            {format === "jpg" ? t("common.downloadFormat", { format: "JPG" }) : t("common.downloadPng")}
        </button>
    );
}
