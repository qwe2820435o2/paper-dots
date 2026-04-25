"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { ImagePlus, Type, Palette, Download, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { darkenHex } from "@/lib/extractDominantColor";
import MomentCardUploader from "@/components/moment-card/MomentCardUploader";
import TextControls from "@/components/moment-card/TextControls";
import ColorControls from "@/components/moment-card/ColorControls";
import MomentCardExportButton from "@/components/moment-card/MomentCardExportButton";

const MomentCardCanvas = dynamic(
    () => import("@/components/moment-card/MomentCardCanvas"),
    {
        ssr: false,
        loading: () => (
            <div
                className="aspect-[4/5] h-full max-h-full rounded-xl bg-[#F4FAE8]"
                style={{
                    boxShadow: "rgba(197, 232, 154, 0.25) 0px 0px 0px 1px",
                }}
            />
        ),
    },
);

type Panel = "upload" | "text" | "color" | "export" | null;

const TOOLS: { id: Panel; icon: typeof ImagePlus; label: string }[] = [
    { id: "upload", icon: ImagePlus, label: "Upload" },
    { id: "text", icon: Type, label: "Text" },
    { id: "color", icon: Palette, label: "Color" },
    { id: "export", icon: Download, label: "Export" },
];

export default function MomentCardApp() {
    const photoUrl = useAppSelector((s) => s.momentCard.photoUrl);
    const bgColor = useAppSelector((s) => s.momentCard.bgColor);
    const stageRef = useRef<Konva.Stage | null>(null);
    const [activePanel, setActivePanel] = useState<Panel>(null);
    const pageBg = darkenHex(bgColor, 0.07);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        if (photoUrl) setActivePanel("text");
    }, [photoUrl]);

    function togglePanel(panel: Panel) {
        setActivePanel((prev) => (prev === panel ? null : panel));
    }

    const activeLabel = TOOLS.find((t) => t.id === activePanel)?.label;

    const panelContent = (
        <>
            {activePanel === "upload" && (
                <div className="p-4">
                    <MomentCardUploader hasPhoto={!!photoUrl} />
                </div>
            )}
            {activePanel === "text" && <TextControls />}
            {activePanel === "color" && <ColorControls />}
            {activePanel === "export" && (
                <div className="p-4">
                    <MomentCardExportButton stageRef={stageRef} />
                </div>
            )}
        </>
    );

    const canvasArea = photoUrl ? (
        <MomentCardCanvas ref={stageRef} />
    ) : (
        <div className="w-full max-w-[min(100vw-24px,calc((100dvh-80px)*4/5))]">
            <MomentCardUploader hasPhoto={false} variant="canvas" />
        </div>
    );

    return (
        <div
            className="h-[calc(100dvh-56px)] overflow-hidden flex flex-col md:flex-row"
            style={{ backgroundColor: pageBg }}
        >
            {/* Desktop: left icon toolbar */}
            <div
                className="hidden md:flex shrink-0 w-16 flex-col items-center py-3 gap-1 bg-white"
                style={{ borderRight: "1px solid #D2EAAA" }}
            >
                {TOOLS.map(({ id, icon: Icon, label }) => {
                    const isActive = activePanel === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => togglePanel(id)}
                            className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
                                isActive
                                    ? "bg-[#E8F5D2] text-[#C5E89A]"
                                    : "text-[#9CA3AF] hover:bg-[#F4FAE8] hover:text-[#C5E89A]"
                            }`}
                        >
                            <Icon size={18} strokeWidth={1.6} />
                            <span className="text-[10px] leading-none font-semibold">{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Desktop: expandable side panel */}
            {activePanel && (
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

            {/* Canvas area */}
            <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center p-3 md:p-6 overflow-hidden">
                {canvasArea}
            </div>

            {/* Mobile: bottom drawer */}
            {activePanel && (
                <div
                    className="md:hidden shrink-0 bg-white flex flex-col max-h-[45dvh]"
                    style={{ borderTop: "1px solid #D2EAAA" }}
                >
                    <div
                        className="shrink-0 flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: "1px solid #D2EAAA" }}
                    >
                        <span className="text-[13px] font-medium text-[#1a1a2e]">
                            {activeLabel}
                        </span>
                        <button
                            type="button"
                            onClick={() => setActivePanel(null)}
                            className="p-1 -mr-1 text-[#9CA3AF] active:text-[#1a1a2e]"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">{panelContent}</div>
                </div>
            )}

            {/* Mobile: bottom icon toolbar */}
            <div
                className="md:hidden shrink-0 flex flex-row items-stretch justify-around bg-white px-1 pt-1"
                style={{
                    borderTop: "1px solid #D2EAAA",
                    paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))",
                }}
            >
                {TOOLS.map(({ id, icon: Icon, label }) => {
                    const isActive = activePanel === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => togglePanel(id)}
                            className={`flex-1 min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
                                isActive
                                    ? "bg-[#E8F5D2] text-[#C5E89A]"
                                    : "text-[#9CA3AF] active:bg-[#F4FAE8] active:text-[#C5E89A]"
                            }`}
                        >
                            <Icon size={20} strokeWidth={1.6} />
                            <span className="text-[10px] leading-none font-semibold">{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
