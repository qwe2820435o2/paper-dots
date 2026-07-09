"use client";

import { useEffect, useState } from "react";
import { Grid3x3, X } from "lucide-react";
import PolkaDotPreview from "@/components/polka-dot/PolkaDotPreview";
import GridControls from "@/components/polka-dot/GridControls";

type Panel = "grid" | null;

const TOOLS: { id: Panel; icon: typeof Grid3x3; label: string }[] = [
    { id: "grid", icon: Grid3x3, label: "Grid" },
];

export default function PolkaDotApp() {
    const [activePanel, setActivePanel] = useState<Panel>("grid");

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    function togglePanel(panel: Panel) {
        setActivePanel((prev) => (prev === panel ? null : panel));
    }

    const activeLabel = TOOLS.find((t) => t.id === activePanel)?.label;

    const panelContent = <>{activePanel === "grid" && <GridControls />}</>;

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

            {/* Preview area */}
            <div className="flex-1 min-w-0 min-h-0 p-3 md:p-6 overflow-hidden">
                <PolkaDotPreview />
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
