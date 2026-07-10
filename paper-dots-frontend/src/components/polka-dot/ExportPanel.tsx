"use client";

import { useState } from "react";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { drawPolkaDotCanvas, buildPolkaDotSvgString, buildPolkaDotCssSnippet } from "@/lib/polkaDotGrid";

const MIN_EXPORT_SIZE = 100;
const MAX_EXPORT_SIZE = 2000;

type ImageFormat = "png" | "jpeg";

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
    const config = useAppSelector((s) => s.polkaDot);
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(800);
    const [format, setFormat] = useState<ImageFormat>("png");
    const [exporting, setExporting] = useState(false);

    async function handleExport() {
        setExporting(true);
        try {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            drawPolkaDotCanvas(ctx, config, width, height);

            const mimeType = format === "png" ? "image/png" : "image/jpeg";
            const dataUrl = canvas.toDataURL(mimeType, 0.92);
            const blob = await (await fetch(dataUrl)).blob();
            const filename = `polka-dot-${Date.now()}.${format === "png" ? "png" : "jpg"}`;
            const file = new File([blob], filename, { type: mimeType });

            if (
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
        } finally {
            setExporting(false);
        }
    }

    function downloadSvg() {
        const svg = buildPolkaDotSvgString(config, width, height);
        const blob = new Blob([svg], { type: "image/svg+xml" });
        triggerDownload(blob, `polka-dot-${Date.now()}.svg`);
        toast.success("Saved to your downloads");
    }

    async function copySvgCode() {
        const svg = buildPolkaDotSvgString(config, width, height);
        try {
            await navigator.clipboard.writeText(svg);
            toast.success("SVG code copied");
        } catch {
            toast.error("Could not copy to clipboard");
        }
    }

    const cssSnippet = buildPolkaDotCssSnippet(config);

    async function copyCssCode() {
        try {
            await navigator.clipboard.writeText(cssSnippet);
            toast.success("CSS code copied");
        } catch {
            toast.error("Could not copy to clipboard");
        }
    }

    return (
        <div className="px-4 py-4 flex flex-col gap-5">
            <div className="flex flex-col gap-3">
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Size (px)</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={MIN_EXPORT_SIZE}
                        max={MAX_EXPORT_SIZE}
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        onBlur={(e) => setWidth(clampSize(Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-lg text-[14px] text-[#1a1a2e] text-center outline-none transition-colors bg-white border border-[#D2EAAA] focus:border-[#C5E89A]"
                    />
                    <span className="text-[12px] text-[#9CA3AF] shrink-0">×</span>
                    <input
                        type="number"
                        min={MIN_EXPORT_SIZE}
                        max={MAX_EXPORT_SIZE}
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        onBlur={(e) => setHeight(clampSize(Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-lg text-[14px] text-[#1a1a2e] text-center outline-none transition-colors bg-white border border-[#D2EAAA] focus:border-[#C5E89A]"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Format</label>
                <div className="grid grid-cols-2 gap-1.5">
                    {(["png", "jpeg"] as ImageFormat[]).map((f) => {
                        const selected = format === f;
                        return (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFormat(f)}
                                aria-pressed={selected}
                                className="min-h-[36px] py-1.5 rounded-lg text-[11px] font-medium uppercase transition-colors"
                                style={{
                                    color: selected ? "#C5E89A" : "#64748b",
                                    background: selected ? "#E8F5D2" : "#F4FAE8",
                                    boxShadow: selected
                                        ? "#C5E89A 0px 0px 0px 1.5px"
                                        : "#D2EAAA 0px 0px 0px 1px",
                                }}
                            >
                                {f}
                            </button>
                        );
                    })}
                </div>
            </div>

            <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 text-[14px] font-medium py-2.5 rounded-full transition-all"
                style={{
                    background: "#C5E89A",
                    color: "#ffffff",
                    cursor: exporting ? "not-allowed" : "pointer",
                    opacity: exporting ? 0.6 : 1,
                }}
            >
                <Download className="w-4 h-4" strokeWidth={2} />
                Download {format.toUpperCase()}
            </button>

            <div className="flex flex-col gap-2 pt-1" style={{ borderTop: "1px solid #D2EAAA" }}>
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em] pt-3">SVG</label>
                <button
                    type="button"
                    onClick={downloadSvg}
                    className="w-full flex items-center justify-center gap-2 text-[13px] font-medium py-2.5 rounded-full transition-colors text-[#C5E89A] bg-[#E8F5D2] hover:bg-[#d5edba]"
                >
                    <Download className="w-4 h-4" strokeWidth={2} />
                    Download SVG
                </button>
                <button
                    type="button"
                    onClick={copySvgCode}
                    className="w-full flex items-center justify-center gap-2 text-[13px] font-medium py-2.5 rounded-full transition-colors text-[#64748b] bg-[#F4FAE8] hover:bg-[#E8F5D2]"
                >
                    <Copy className="w-4 h-4" strokeWidth={2} />
                    Copy SVG Code
                </button>
            </div>

            <div className="flex flex-col gap-2 pt-1" style={{ borderTop: "1px solid #D2EAAA" }}>
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em] pt-3">CSS</label>
                <pre className="w-full max-h-40 overflow-auto rounded-lg px-3 py-2 text-[11px] leading-[1.6] whitespace-pre-wrap break-all bg-[#F4FAE8] text-[#1a1a2e]">
                    {cssSnippet}
                </pre>
                <button
                    type="button"
                    onClick={copyCssCode}
                    className="w-full flex items-center justify-center gap-2 text-[13px] font-medium py-2.5 rounded-full transition-colors text-[#64748b] bg-[#F4FAE8] hover:bg-[#E8F5D2]"
                >
                    <Copy className="w-4 h-4" strokeWidth={2} />
                    Copy CSS Code
                </button>
            </div>
        </div>
    );
}
