"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { ImagePlus, Maximize, LayoutGrid, Type, BadgeCheck, Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import BeforeAfterUploader from "@/components/before-after/Uploader";
import ImagesPanel from "@/components/before-after/ImagesPanel";
import SizePanel from "@/components/before-after/SizePanel";
import ExportButton from "@/components/before-after/ExportButton";
import GifExportButton from "@/components/before-after/GifExportButton";
import VideoExportButton from "@/components/before-after/VideoExportButton";
import LayoutPicker from "@/components/before-after/LayoutPicker";
import TextLabelPanel from "@/components/before-after/TextLabelPanel";
import LogoPanel from "@/components/before-after/LogoPanel";

const BeforeAfterCanvas = dynamic(() => import("@/components/before-after/Canvas"), {
    ssr: false,
    loading: () => <div className="w-full aspect-square rounded-2xl bg-white" />,
});

type Panel = "images" | "size" | "layout" | "text" | "logo" | "export" | null;

/** `id` doubles as the key under `editor.beforeAfter.tabs`. */
const TOOLS: { id: Panel; icon: typeof ImagePlus }[] = [
    { id: "images", icon: ImagePlus },
    { id: "size", icon: Maximize },
    { id: "layout", icon: LayoutGrid },
    { id: "text", icon: Type },
    { id: "logo", icon: BadgeCheck },
    { id: "export", icon: Download },
];

export default function BeforeAfterApp() {
    const t = useTranslations("editor.beforeAfter");
    const tCommon = useTranslations("editor.common");
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);
    const layoutType = useAppSelector((s) => s.beforeAfter.layoutType);
    const ready = !!beforeUrl && !!afterUrl;
    const stageRef = useRef<Konva.Stage | null>(null);
    const [activePanel, setActivePanel] = useState<Panel>(null);
    // GIF/video encoding screenshots the live stage frame by frame, so anything that resizes it
    // or swaps its render branch mid-run — changing tab (which can switch layout) or firing a
    // PNG/JPG export — would corrupt the output. Freeze the editor until it ends.
    const [exporting, setExporting] = useState(false);

    useLockBodyScroll();

    useEffect(() => {
        if (ready) setActivePanel((p) => p ?? "layout");
    }, [ready]);

    function togglePanel(panel: Panel) {
        if (exporting) return;
        setActivePanel((prev) => (prev === panel ? null : panel));
    }

    const activeLabel = activePanel ? t(`tabs.${activePanel}`) : null;

    const panelContent = (
        <>
            {activePanel === "images" && <ImagesPanel />}
            {activePanel === "size" && <SizePanel />}
            {activePanel === "layout" && <LayoutPicker />}
            {activePanel === "text" && <TextLabelPanel />}
            {activePanel === "logo" && <LogoPanel />}
            {activePanel === "export" && (
                <div className="p-4 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <ExportButton stageRef={stageRef} format="png" disabled={exporting} />
                        <ExportButton stageRef={stageRef} format="jpg" disabled={exporting} />
                    </div>
                    {layoutType === "slider" && (
                        <div className="flex gap-2">
                            <GifExportButton stageRef={stageRef} busy={exporting} onBusyChange={setExporting} />
                            <VideoExportButton stageRef={stageRef} busy={exporting} onBusyChange={setExporting} />
                        </div>
                    )}
                </div>
            )}
        </>
    );

    const canvasArea = ready ? (
        <BeforeAfterCanvas ref={stageRef} />
    ) : (
        <div className="w-full max-w-[520px]">
            <BeforeAfterUploader />
        </div>
    );

    return (
        <div className="h-[calc(100dvh-56px)] overflow-hidden bg-[#F8FCF2] flex flex-col md:flex-row">
            {/* Desktop: left icon toolbar */}
            {ready && (
                <div
                    className="hidden md:flex shrink-0 w-16 flex-col items-center py-3 gap-1 bg-white"
                    style={{ borderRight: "1px solid #D2EAAA" }}
                >
                    {TOOLS.map(({ id, icon: Icon }) => {
                        const isActive = activePanel === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => togglePanel(id)}
                                disabled={exporting}
                                className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
                                    exporting
                                        ? "text-[#9CA3AF] opacity-40 cursor-not-allowed"
                                        : isActive
                                          ? "bg-[#E8F5D2] text-[#C5E89A]"
                                          : "text-[#9CA3AF] hover:bg-[#F4FAE8] hover:text-[#C5E89A]"
                                }`}
                            >
                                <Icon size={18} strokeWidth={1.6} />
                                <span className="text-[10px] leading-none font-semibold">{t(`tabs.${id}`)}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Desktop: expandable side panel */}
            {ready && activePanel && (
                <div
                    className="hidden md:flex shrink-0 w-72 flex-col bg-white overflow-hidden"
                    style={{ borderRight: "1px solid #D2EAAA" }}
                >
                    <div
                        className="shrink-0 px-4 py-3 text-[13px] font-medium text-[#1a1a2e]"
                        style={{ borderBottom: "1px solid #D2EAAA" }}
                    >
                        {activeLabel}
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">{panelContent}</div>
                </div>
            )}

            {/* Canvas area (shared) */}
            <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center p-3 md:p-6 overflow-hidden">
                {canvasArea}
            </div>

            {/* Desktop spacer: mirrors the left toolbar + panel so the preview centers under the page (menu) center */}
            {ready && (
                <div className={`hidden md:block shrink-0 ${activePanel ? "w-[352px]" : "w-16"}`} aria-hidden />
            )}

            {/* Mobile: bottom drawer (above toolbar) */}
            {ready && activePanel && (
                <div
                    className="md:hidden shrink-0 bg-white flex flex-col max-h-[45dvh]"
                    style={{ borderTop: "1px solid #D2EAAA" }}
                >
                    <div
                        className="shrink-0 flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: "1px solid #D2EAAA" }}
                    >
                        <span className="text-[13px] font-medium text-[#1a1a2e]">{activeLabel}</span>
                        {/* Closing the drawer would unmount the very button driving the export. */}
                        <button
                            type="button"
                            onClick={() => setActivePanel(null)}
                            disabled={exporting}
                            className={`p-1 -mr-1 text-[#9CA3AF] active:text-[#1a1a2e] ${
                                exporting ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                            aria-label={tCommon("close")}
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">{panelContent}</div>
                </div>
            )}

            {/* Mobile: bottom icon toolbar */}
            {ready && (
                <div
                    className="md:hidden shrink-0 flex flex-row items-stretch justify-around bg-white px-1 pt-1"
                    style={{
                        borderTop: "1px solid #D2EAAA",
                        paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))",
                    }}
                >
                    {TOOLS.map(({ id, icon: Icon }) => {
                        const isActive = activePanel === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => togglePanel(id)}
                                disabled={exporting}
                                className={`flex-1 min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
                                    exporting
                                        ? "text-[#9CA3AF] opacity-40 cursor-not-allowed"
                                        : isActive
                                          ? "bg-[#E8F5D2] text-[#C5E89A]"
                                          : "text-[#9CA3AF] active:bg-[#F4FAE8] active:text-[#C5E89A]"
                                }`}
                            >
                                <Icon size={20} strokeWidth={1.6} />
                                <span className="text-[10px] leading-none font-semibold">{t(`tabs.${id}`)}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
