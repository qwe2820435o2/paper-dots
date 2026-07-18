"use client";

import { useEffect, useState } from "react";
import { Shapes, Grid3x3, Palette, Download, X, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { shuffle } from "@/store/slices/geometricSlice";
import GeometricPreview from "@/components/geometric/GeometricPreview";
import IconSetControls from "@/components/geometric/IconSetControls";
import GridControls from "@/components/geometric/GridControls";
import ColorControls from "@/components/geometric/ColorControls";
import ExportPanel from "@/components/geometric/ExportPanel";

type Panel = "shapes" | "grid" | "colors" | "export" | null;

const TOOLS: { id: Panel; icon: typeof Shapes; label: string }[] = [
    { id: "shapes", icon: Shapes, label: "Shapes" },
    { id: "grid", icon: Grid3x3, label: "Grid" },
    { id: "colors", icon: Palette, label: "Colors" },
    { id: "export", icon: Download, label: "Export" },
];

export default function GeometricPatternsApp() {
    const dispatch = useAppDispatch();
    const { rows, columns } = useAppSelector((s) => s.geometric);
    const [activePanel, setActivePanel] = useState<Panel>("shapes");
    const [spinning, setSpinning] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // Space reshuffles the grid layout (matches the Export panel's non-interactive areas);
    // guarded so typing a space into a number input doesn't also trigger a shuffle.
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.code !== "Space") return;
            const tag = (e.target as HTMLElement | null)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA") return;
            e.preventDefault();
            dispatch(shuffle());
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [dispatch]);

    function togglePanel(panel: Panel) {
        setActivePanel((prev) => (prev === panel ? null : panel));
    }

    const activeLabel = TOOLS.find((t) => t.id === activePanel)?.label;

    const panelContent = (
        <>
            {activePanel === "shapes" && <IconSetControls />}
            {activePanel === "grid" && <GridControls />}
            {activePanel === "colors" && <ColorControls />}
            {activePanel === "export" && <ExportPanel />}
        </>
    );

    return (
        <div className="h-[calc(100dvh-56px)] overflow-hidden bg-[#F8FCF2] flex flex-col md:flex-row">
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

            {/* Preview area: a bounded card floating on the background, with a shuffle button
                anchored to its bottom edge (mirrors the reference tool's layout). The card's
                aspect ratio matches columns:rows so every cell — and the shape inside it — is
                square, instead of a fixed square card stretching/gapping non-square cells. */}
            <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center p-4 md:p-8 overflow-hidden">
                <div
                    className="relative w-full"
                    style={{ maxWidth: `min(100%, calc((100dvh - 56px - 96px) * ${columns / rows}))` }}
                >
                    <div
                        className="w-full rounded-xl"
                        style={{ aspectRatio: `${columns} / ${rows}`, boxShadow: "rgba(15, 23, 42, 0.08) 0px 12px 32px" }}
                    >
                        <GeometricPreview />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            dispatch(shuffle());
                            setSpinning(true);
                        }}
                        onAnimationEnd={() => setSpinning(false)}
                        aria-label="Shuffle pattern (Space)"
                        title="Shuffle pattern (Space)"
                        className="absolute left-1/2 -bottom-5 -translate-x-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-[#1a1a2e] text-white transition-colors hover:bg-[#2a2a3e]"
                        style={{ boxShadow: "rgba(15, 23, 42, 0.25) 0px 6px 16px" }}
                    >
                        <RefreshCw className={`w-4 h-4 ${spinning ? "animate-spin-once" : ""}`} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Desktop spacer: mirrors the left toolbar + panel so the preview centers under the page (menu) center */}
            <div className={`hidden md:block shrink-0 ${activePanel ? "w-[352px]" : "w-16"}`} aria-hidden />

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
                        <span className="text-[13px] font-medium text-[#1a1a2e]">{activeLabel}</span>
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
