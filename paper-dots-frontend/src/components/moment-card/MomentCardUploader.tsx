"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setPhoto } from "@/store/slices/momentCardSlice";
import { extractDominantColorVivid } from "@/lib/extractDominantColor";

function loadImageEl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("image load failed"));
        img.src = url;
    });
}

interface Props {
    hasPhoto: boolean;
    variant?: "sidebar" | "canvas";
}

export default function MomentCardUploader({ hasPhoto, variant = "sidebar" }: Props) {
    const dispatch = useAppDispatch();
    const [dragOver, setDragOver] = useState(false);

    const handleFiles = useCallback(
        async (files: FileList | null) => {
            const file = files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            const url = URL.createObjectURL(file);
            const img = await loadImageEl(url);
            const color = extractDominantColorVivid(img);
            dispatch(setPhoto({
                url,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                bgColor: color,
            }));
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
                className={`relative w-full aspect-[4/5] rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-150 active:scale-[0.98] select-none px-6 py-10 overflow-hidden ${
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
                    <Upload className="w-8 h-8 text-[#9ED06C]" strokeWidth={1.8} />
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
                    {hasPhoto ? "Replace photo" : "Upload photo"}
                </p>
                <p className="text-[11px] text-[#9CA3AF]">PNG · JPG · WEBP</p>
            </div>
        </label>
    );
}
