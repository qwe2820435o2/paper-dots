"use client";

import { useState } from "react";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setExportWidth, setExportHeight, setExportFormat, type ExportFormat } from "@/store/slices/geometricSlice";
import { buildIconGridSvgString, rasterizeIconGridSvg } from "@/lib/geometricGrid";
import { isTouchPrimaryDevice } from "@/lib/device";
import ToggleChip from "./ToggleChip";

const MIN_EXPORT_SIZE = 100;
const MAX_EXPORT_SIZE = 4000;

const FORMATS: ExportFormat[] = ["svg", "png", "jpeg"];

function clampSize(value: number): number {
    if (Number.isNaN(value)) return MIN_EXPORT_SIZE;
    return Math.max(MIN_EXPORT_SIZE, Math.min(MAX_EXPORT_SIZE, Math.round(value)));
}

function triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ExportPanel() {
    const dispatch = useAppDispatch();
    const config = useAppSelector((s) => s.geometric);
    // width/height/format live in Redux (not local state) so the desktop and mobile copies of
    // this panel — both mounted at once, see GeometricPatternsApp — always agree on the same
    // values instead of silently diverging when the viewport crosses the md breakpoint.
    const { exportWidth: width, exportHeight: height, exportFormat: format } = config;
    const [exporting, setExporting] = useState(false);

    async function handleExport() {
        setExporting(true);
        try {
            const stamp = Date.now();

            if (format === "svg") {
                const svg = buildIconGridSvgString(config, width, height);
                triggerDownload(new Blob([svg], { type: "image/svg+xml" }), `geometric-${stamp}.svg`);
                toast.success("Saved to your downloads");
                return;
            }

            const mimeType = format === "png" ? "image/png" : "image/jpeg";
            const blob = await rasterizeIconGridSvg(config, width, height, mimeType, 0.92);
            const filename = `geometric-${stamp}.${format === "png" ? "png" : "jpg"}`;
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

            triggerDownload(blob, filename);
            toast.success("Saved to your downloads");
        } catch {
            toast.error("Export failed, please try again");
        } finally {
            setExporting(false);
        }
    }

    async function copySvgCode() {
        const svg = buildIconGridSvgString(config, width, height);
        try {
            await navigator.clipboard.writeText(svg);
            toast.success("SVG code copied");
        } catch {
            toast.error("Could not copy to clipboard");
        }
    }

    return (
        <div className="px-4 py-4 flex flex-col gap-5">
            <div className="flex flex-col gap-3">
                <label className="text-[11px] uppercase text-muted-foreground tracking-[0.08em]">Size (px)</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={MIN_EXPORT_SIZE}
                        max={MAX_EXPORT_SIZE}
                        value={width}
                        onChange={(e) => {
                            const n = Number(e.target.value);
                            if (!Number.isNaN(n)) dispatch(setExportWidth(n));
                        }}
                        onBlur={(e) => dispatch(setExportWidth(clampSize(Number(e.target.value))))}
                        className="w-full px-3 py-2 rounded-lg text-[14px] text-foreground text-center outline-none transition-colors bg-card border border-border focus:border-primary"
                    />
                    <span className="text-[12px] text-gray-400 shrink-0">×</span>
                    <input
                        type="number"
                        min={MIN_EXPORT_SIZE}
                        max={MAX_EXPORT_SIZE}
                        value={height}
                        onChange={(e) => {
                            const n = Number(e.target.value);
                            if (!Number.isNaN(n)) dispatch(setExportHeight(n));
                        }}
                        onBlur={(e) => dispatch(setExportHeight(clampSize(Number(e.target.value))))}
                        className="w-full px-3 py-2 rounded-lg text-[14px] text-foreground text-center outline-none transition-colors bg-card border border-border focus:border-primary"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase text-muted-foreground tracking-[0.08em]">Format</label>
                <div className="grid grid-cols-3 gap-1.5">
                    {FORMATS.map((f) => (
                        <ToggleChip
                            key={f}
                            selected={format === f}
                            onClick={() => dispatch(setExportFormat(f))}
                            className="min-h-[36px] py-1.5 rounded-lg text-[11px] font-medium uppercase"
                            selectedClassName="text-primary bg-secondary ring-1 ring-primary"
                            unselectedClassName="text-muted-foreground bg-muted ring-1 ring-border"
                        >
                            {f}
                        </ToggleChip>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 text-[14px] font-medium py-2.5 rounded-full transition-all bg-primary text-primary-foreground"
                style={{
                    cursor: exporting ? "not-allowed" : "pointer",
                    opacity: exporting ? 0.6 : 1,
                }}
            >
                <Download className="w-4 h-4" strokeWidth={2} />
                Download {format.toUpperCase()}
            </button>

            <div className="flex flex-col gap-2 pt-1 border-t border-border">
                <label className="text-[11px] uppercase text-muted-foreground tracking-[0.08em] pt-3">SVG</label>
                <button
                    type="button"
                    onClick={copySvgCode}
                    className="w-full flex items-center justify-center gap-2 text-[13px] font-medium py-2.5 rounded-full transition-colors text-muted-foreground bg-muted hover:bg-secondary"
                >
                    <Copy className="w-4 h-4" strokeWidth={2} />
                    Copy SVG Code
                </button>
            </div>
        </div>
    );
}
