"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { ImagePlus, LayoutGrid, Type, Move, Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { setAlignMode } from "@/store/slices/beforeAfterSlice";
import BeforeAfterUploader from "@/components/before-after/Uploader";
import ExportButton from "@/components/before-after/ExportButton";
import GifExportButton from "@/components/before-after/GifExportButton";
import LayoutPicker from "@/components/before-after/LayoutPicker";
import TextLabelPanel from "@/components/before-after/TextLabelPanel";
import AlignPanel from "@/components/before-after/AlignPanel";

const BeforeAfterCanvas = dynamic(() => import("@/components/before-after/Canvas"), {
    ssr: false,
    loading: () => <div className="w-full aspect-square rounded-2xl bg-white" />,
});

type Panel = "photos" | "layout" | "text" | "align" | "export" | null;

/** `id` doubles as the key under `editor.beforeAfter.tabs`. */
const TOOLS: { id: Panel; icon: typeof ImagePlus }[] = [
    { id: "photos", icon: ImagePlus },
    { id: "layout", icon: LayoutGrid },
    { id: "text", icon: Type },
    { id: "align", icon: Move },
    { id: "export", icon: Download },
];

export default function BeforeAfterApp() {
    const t = useTranslations("editor.beforeAfter");
    const tCommon = useTranslations("editor.common");
    const dispatch = useAppDispatch();
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);
    const layoutType = useAppSelector((s) => s.beforeAfter.layoutType);
    const ready = !!beforeUrl && !!afterUrl;
    const stageRef = useRef<Konva.Stage | null>(null);
    const [activePanel, setActivePanel] = useState<Panel>(null);
    // GIF encoding screenshots the live stage frame by frame, so anything that resizes it or
    // swaps its render branch mid-run — changing tab (which switches layout / toggles align
    // mode) or firing a PNG export — would corrupt the output. Freeze the editor until it ends.
    const [exporting, setExporting] = useState(false);

    useLockBodyScroll();

    useEffect(() => {
        if (ready) setActivePanel((p) => p ?? "layout");
    }, [ready]);

    // The "align" tab doubles as the on/off switch for Canvas's dedicated align-mode overlay —
    // opening it is "start aligning", closing it (or switching tabs) is "done".
    useEffect(() => {
        dispatch(setAlignMode(activePanel === "align"));
    }, [activePanel, dispatch]);

    function togglePanel(panel: Panel) {
        if (exporting) return;
        setActivePanel((prev) => (prev === panel ? null : panel));
    }

    const activeLabel = activePanel ? t(`tabs.${activePanel}`) : null;

    const panelContent = (
        <>
            {activePanel === "photos" && <BeforeAfterUploader compact />}
            {activePanel === "layout" && <LayoutPicker />}
            {activePanel === "text" && <TextLabelPanel />}
            {activePanel === "align" && <AlignPanel />}
            {activePanel === "export" && (
                <div className="p-4 flex gap-2">
                    <ExportButton stageRef={stageRef} disabled={exporting} />
                    {layoutType === "slider" && (
                        <GifExportButton stageRef={stageRef} busy={exporting} onBusyChange={setExporting} />
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
