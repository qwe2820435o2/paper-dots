"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Shapes, Grid3x3, Palette, Download, X, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { shuffle } from "@/store/slices/geometricSlice";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import GeometricPreview from "@/components/geometric/GeometricPreview";
import IconSetControls from "@/components/geometric/IconSetControls";
import LayoutControls from "@/components/geometric/LayoutControls";
import ColorControls from "@/components/geometric/ColorControls";
import ExportPanel from "@/components/geometric/ExportPanel";

type Panel = "shapes" | "layout" | "colors" | "export" | null;

/** `id` doubles as the key under `editor.geometric.tabs`. */
const TOOLS: { id: Panel; icon: typeof Shapes }[] = [
    { id: "shapes", icon: Shapes },
    { id: "layout", icon: Grid3x3 },
    { id: "colors", icon: Palette },
    { id: "export", icon: Download },
];

function ToolButton({
    icon: Icon,
    label,
    isActive,
    onClick,
    variant,
}: {
    icon: typeof Shapes;
    label: string;
    isActive: boolean;
    onClick: () => void;
    variant: "desktop" | "mobile";
}) {
    const activeClasses = "bg-secondary text-primary";
    const inactiveClasses =
        variant === "desktop"
            ? "text-gray-400 hover:bg-muted hover:text-primary"
            : "text-gray-400 active:bg-muted active:text-primary";
    const layoutClasses =
        variant === "desktop"
            ? "w-14 h-12"
            : "flex-1 min-h-[52px]";

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isActive}
            className={`${layoutClasses} rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? activeClasses : inactiveClasses
            }`}
        >
            <Icon size={variant === "desktop" ? 18 : 20} strokeWidth={1.6} />
            <span className="text-[10px] leading-none font-semibold">{label}</span>
        </button>
    );
}

export default function GeometricPatternsApp() {
    const t = useTranslations("editor");
    const dispatch = useAppDispatch();
    const { rows, columns } = useAppSelector((s) => s.geometric);
    const [activePanel, setActivePanel] = useState<Panel>("shapes");
    const [spinning, setSpinning] = useState(false);

    useLockBodyScroll();

    // Space reshuffles the grid layout, but only when focus isn't on something that already
    // handles Space itself (buttons, switches, tabs, links, form fields) — otherwise pressing
    // Space to activate any button on the page would get hijacked into an unrelated shuffle.
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.code !== "Space") return;
            const target = e.target as HTMLElement | null;
            if (
                target?.closest(
                    'button, [role="button"], [role="switch"], [role="tab"], a[href], input, textarea, select, [contenteditable="true"]',
                )
            )
                return;
            e.preventDefault();
            dispatch(shuffle());
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [dispatch]);

    function togglePanel(panel: Panel) {
        setActivePanel((prev) => (prev === panel ? null : panel));
    }

    const activeLabel = activePanel ? t(`geometric.tabs.${activePanel}`) : null;

    const panelContent = (
        <>
            {activePanel === "shapes" && <IconSetControls />}
            {activePanel === "layout" && <LayoutControls />}
            {activePanel === "colors" && <ColorControls />}
            {activePanel === "export" && <ExportPanel />}
        </>
    );

    return (
        <div className="h-[calc(100dvh-56px)] overflow-hidden bg-sidebar flex flex-col md:flex-row">
            {/* Desktop: left icon toolbar */}
            <div className="hidden md:flex shrink-0 w-16 flex-col items-center py-3 gap-1 bg-card border-r border-border">
                {TOOLS.map(({ id, icon }) => (
                    <ToolButton
                        key={id}
                        icon={icon}
                        label={t(`geometric.tabs.${id}`)}
                        isActive={activePanel === id}
                        onClick={() => togglePanel(id)}
                        variant="desktop"
                    />
                ))}
            </div>

            {/* Desktop: expandable side panel */}
            {activePanel && (
                <div className="hidden md:flex shrink-0 w-72 flex-col bg-card overflow-hidden border-r border-border">
                    <div className="shrink-0 px-4 py-3 text-[13px] font-medium text-foreground border-b border-border">
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
                        aria-label={t("geometric.shufflePattern")}
                        title={t("geometric.shufflePattern")}
                        className="absolute left-1/2 -bottom-5 -translate-x-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-foreground text-background transition-colors hover:bg-foreground/90"
                        style={{ boxShadow: "rgba(15, 23, 42, 0.25) 0px 6px 16px" }}
                    >
                        <RefreshCw className={`w-4 h-4 ${spinning ? "animate-spin-once" : ""}`} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Desktop spacer: mirrors the left toolbar (w-16 = 64px) + panel (w-72 = 288px) = 352px,
                so the preview centers under the page (menu) center whether or not a panel is open. */}
            <div className={`hidden md:block shrink-0 ${activePanel ? "w-[352px]" : "w-16"}`} aria-hidden />

            {/* Mobile: bottom drawer */}
            {activePanel && (
                <div className="md:hidden shrink-0 bg-card flex flex-col max-h-[45dvh] border-t border-border">
                    <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="text-[13px] font-medium text-foreground">{activeLabel}</span>
                        <button
                            type="button"
                            onClick={() => setActivePanel(null)}
                            className="p-1 -mr-1 text-gray-400 active:text-foreground"
                            aria-label={t("common.close")}
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">{panelContent}</div>
                </div>
            )}

            {/* Mobile: bottom icon toolbar */}
            <div
                className="md:hidden shrink-0 flex flex-row items-stretch justify-around bg-card px-1 pt-1 border-t border-border"
                style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
            >
                {TOOLS.map(({ id, icon }) => (
                    <ToolButton
                        key={id}
                        icon={icon}
                        label={t(`geometric.tabs.${id}`)}
                        isActive={activePanel === id}
                        onClick={() => togglePanel(id)}
                        variant="mobile"
                    />
                ))}
            </div>
        </div>
    );
}
