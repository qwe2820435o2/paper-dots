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
                dispatch(setDotSize(50));
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
                className="rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] select-none px-4 py-3"
                style={{
                    border: dragOver
                        ? "1.5px solid #F39EB6"
                        : "1.5px dashed #F5D5E0",
                    background: dragOver
                        ? "#FFF0F5"
                        : "white",
                    boxShadow: dragOver
                        ? "rgba(243, 158, 182, 0.15) 0px 0px 20px 0px"
                        : "none",
                }}
                onMouseEnter={(e) => {
                    if (!dragOver) {
                        (e.currentTarget as HTMLElement).style.borderColor = "#F39EB6";
                        (e.currentTarget as HTMLElement).style.background = "#FFF7FA";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!dragOver) {
                        (e.currentTarget as HTMLElement).style.borderColor = "#F5D5E0";
                        (e.currentTarget as HTMLElement).style.background = "white";
                    }
                }}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />

                <div
                    className="w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all duration-150"
                    style={{ background: dragOver ? "#FFE4EF" : "#FFF0F5" }}
                >
                    <Upload className="w-4 h-4 text-[#1a1a2e]" strokeWidth={1.5} />
                </div>

                <div className="flex flex-col items-center gap-1.5">
                    <p className="text-[13px] font-medium text-[#1a1a2e]">
                        {hasPhoto ? "Replace photo" : "Upload photo"}
                    </p>
                    <p className="text-[11px] text-center text-[#9CA3AF]">
                        Drop image here or click to browse
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                        {["PNG", "JPG", "WEBP"].map((fmt) => (
                            <span
                                key={fmt}
                                className="px-2 py-0.5 rounded-full text-[10px] bg-[#FFF0F5] text-[#9CA3AF] tracking-[0.04em]"
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
            className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 shrink-0"
            style={{
                borderBottom: "1px solid #F5D5E0",
                borderLeft: "3px solid #F39EB6",
                background: dragOver ? "#FFF0F5" : "transparent",
            }}
            onMouseEnter={(e) => {
                if (!dragOver) {
                    (e.currentTarget as HTMLElement).style.background = "#FFF7FA";
                }
            }}
            onMouseLeave={(e) => {
                if (!dragOver) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }
            }}
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
                    {hasPhoto ? "Replace photo" : "Upload photo"}
                </p>
                <p className="text-[11px] text-[#9CA3AF]">
                    PNG &middot; JPG &middot; WEBP
                </p>
            </div>
        </label>
    );
}
