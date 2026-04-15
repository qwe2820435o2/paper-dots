"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setPhotoUrl, setSolidColor, setBackgroundMode, setDotShape, setDotSize, setDotVariance, setDotOpacity } from "@/store/slices/decorateSlice";

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const rf = r / 255, gf = g / 255, bf = b / 255;
    const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) / 6;
    else if (max === gf) h = ((bf - rf) / d + 2) / 6;
    else h = ((rf - gf) / d + 4) / 6;
    return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    if (s === 0) {
        const v = Math.round(l * 255);
        return [v, v, v];
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return [
        Math.round(hue2rgb(h + 1 / 3) * 255),
        Math.round(hue2rgb(h) * 255),
        Math.round(hue2rgb(h - 1 / 3) * 255),
    ];
}

function extractPhotoColor(url: string): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const size = 40;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) { resolve("#fafafa"); return; }
            ctx.drawImage(img, 0, 0, size, size);
            const data = ctx.getImageData(0, 0, size, size).data;
            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);
            const [h, s, l] = rgbToHsl(r, g, b);
            const newL = Math.max(l, 0.75);
            const newS = s * 0.45;
            const [fr, fg, fb] = hslToRgb(h, newS, newL);
            const hex = `#${fr.toString(16).padStart(2, "0")}${fg.toString(16).padStart(2, "0")}${fb.toString(16).padStart(2, "0")}`;
            resolve(hex);
        };
        img.onerror = () => resolve("#fafafa");
        img.src = url;
    });
}

interface Props {
    hasPhoto: boolean;
    variant?: "sidebar" | "canvas";
}

export default function PhotoUploader({
    hasPhoto,
    variant = "sidebar",
}: Props) {
    const dispatch = useAppDispatch();
    const [dragOver, setDragOver] = useState(false);

    const handleFiles = useCallback(
        (files: FileList | null) => {
            const file = files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            const url = URL.createObjectURL(file);
            extractPhotoColor(url).then((color) => {
                dispatch(setBackgroundMode("solid"));
                dispatch(setSolidColor(color));
                dispatch(setPhotoUrl(url));
                dispatch(setDotShape("snowflake"));
                dispatch(setDotSize(30));
                dispatch(setDotVariance(23));
                dispatch(setDotOpacity(66));
            });
        },
        [dispatch],
    );

    const commonDragHandlers = {
        onDragOver: (e: React.DragEvent<HTMLLabelElement>) => {
            e.preventDefault();
            setDragOver(true);
        },
        onDragLeave: () => setDragOver(false),
        onDrop: (e: React.DragEvent<HTMLLabelElement>) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
        },
    };

    if (variant === "canvas") {
        return (
            <label
                {...commonDragHandlers}
                className={`relative w-full rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-150 active:scale-[0.98] select-none px-6 py-10 overflow-hidden ${
                    dragOver
                        ? "border-[1.5px] border-solid border-[#C5E89A] bg-[#F4FAE8] shadow-[rgba(197,232,154,0.2)_0px_0px_32px_0px]"
                        : "border-[1.5px] border-dashed border-[#D2EAAA] bg-white hover:border-[#C5E89A] hover:bg-[#F8FCF2]"
                }`}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />

                {/* Decorative dots */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-[14%] left-[12%] w-2.5 h-2.5 rounded-full bg-[#C5E89A] opacity-60"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-[20%] right-[16%] w-1.5 h-1.5 rounded-full bg-[#F7F6D3]"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-[22%] left-[18%] w-2 h-2 rounded-full border-[1.5px] border-[#D2EAAA]"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-[16%] right-[14%] w-3 h-3 rounded-full bg-[#E8F5D2]"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-[45%] left-[8%] w-1.5 h-1.5 rounded-full bg-[#FDE7EE]"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-[60%] right-[8%] w-2 h-2 rounded-full bg-[#F7F6D3] opacity-80"
                />

                <div
                    className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                        dragOver ? "scale-110" : ""
                    }`}
                    style={{
                        background: dragOver ? "#E8F5D2" : "#F4FAE8",
                        boxShadow: dragOver
                            ? "rgba(197,232,154,0.4) 0px 8px 24px"
                            : "rgba(197,232,154,0.18) 0px 4px 16px",
                    }}
                >
                    <Upload
                        className="w-8 h-8 text-[#9ED06C]"
                        strokeWidth={1.8}
                    />
                </div>

                <div className="relative flex flex-col items-center gap-2">
                    <p
                        className="text-[18px] font-semibold text-[#1a1a2e] tracking-[-0.2px]"
                        style={{ fontFamily: "var(--font-quicksand), var(--font-nunito), sans-serif" }}
                    >
                        Upload photo
                    </p>
                    <p className="text-[13px] text-center text-[#64748b] leading-[1.5] max-w-[240px]">
                        Drop image here or click to browse
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                        {["PNG", "JPG", "WEBP"].map((fmt) => (
                            <span
                                key={fmt}
                                className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#F4FAE8] text-[#9ED06C] tracking-[0.06em]"
                            >
                                {fmt}
                            </span>
                        ))}
                    </div>
                </div>
            </label>
        );
    }

    return (
        <label
            {...commonDragHandlers}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 shrink-0 border-b border-[#D2EAAA] border-l-[3px] border-l-[#C5E89A] ${
                dragOver ? "bg-[#F4FAE8]" : "bg-transparent hover:bg-[#F8FCF2]"
            }`}
        >
            <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
            <Upload className="w-4 h-4 shrink-0 text-[#1a1a2e]" strokeWidth={1.8} />
            <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#1a1a2e]">
                    {hasPhoto ? "Upload photo" : "Upload photo"}
                </p>
                <p className="text-[11px] text-[#9CA3AF]">
                    PNG &middot; JPG &middot; WEBP
                </p>
            </div>
        </label>
    );
}
