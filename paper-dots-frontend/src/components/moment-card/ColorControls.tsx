"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBgColor } from "@/store/slices/momentCardSlice";
import { extractDominantColorVivid } from "@/lib/extractDominantColor";

const HEX_RE = /^#?[0-9a-fA-F]{6}$/;

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("image load failed"));
        img.src = url;
    });
}

export default function ColorControls() {
    const dispatch = useAppDispatch();
    const bgColor = useAppSelector((s) => s.momentCard.bgColor);
    const photoUrl = useAppSelector((s) => s.momentCard.photoUrl);
    const [hexInput, setHexInput] = useState(bgColor);
    const [isExtracting, setIsExtracting] = useState(false);

    function commitHex(value: string) {
        const v = value.startsWith("#") ? value : `#${value}`;
        if (HEX_RE.test(v)) {
            dispatch(setBgColor(v.toLowerCase()));
        }
    }

    async function reExtract() {
        if (!photoUrl) return;
        setIsExtracting(true);
        try {
            const img = await loadImage(photoUrl);
            const next = extractDominantColorVivid(img);
            dispatch(setBgColor(next));
            setHexInput(next);
        } finally {
            setIsExtracting(false);
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                    Background color
                </span>
                <div className="flex items-center gap-3">
                    <span
                        className="w-10 h-10 rounded-lg border border-[#D2EAAA] shrink-0"
                        style={{ background: bgColor }}
                    />
                    <input
                        value={hexInput}
                        onChange={(e) => setHexInput(e.target.value)}
                        onBlur={(e) => commitHex(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") commitHex((e.target as HTMLInputElement).value);
                        }}
                        placeholder="#C5E89A"
                        className="flex-1 px-3 py-2 rounded-lg border border-[#D2EAAA] bg-white text-[14px] font-mono text-[#1a1a2e] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#C5E89A] focus:ring-2 focus:ring-[#E8F5D2]"
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={reExtract}
                disabled={!photoUrl || isExtracting}
                className="flex items-center justify-center gap-2 text-[13px] font-medium py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    background: "#F4FAE8",
                    color: "#1a1a2e",
                    border: "1px solid #D2EAAA",
                }}
            >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                {isExtracting ? "Extracting…" : "Re-extract from current frame"}
            </button>

            <p className="text-[11px] text-[#9CA3AF] leading-[1.5]">
                Drag the bottom photo to reposition it. The background color updates automatically when you release.
            </p>
        </div>
    );
}
