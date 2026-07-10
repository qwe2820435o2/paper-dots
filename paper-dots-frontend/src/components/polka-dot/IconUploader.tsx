"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIcon, clearIcon } from "@/store/slices/polkaDotSlice";

const MAX_ICON_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = src;
    });
}

export default function IconUploader() {
    const dispatch = useAppDispatch();
    const iconUrl = useAppSelector((s) => s.polkaDot.iconUrl);
    const [dragOver, setDragOver] = useState(false);

    const handleFiles = useCallback(
        async (files: FileList | null) => {
            const file = files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            if (file.size > MAX_ICON_BYTES) {
                toast.error("Icon must be under 2MB");
                return;
            }
            try {
                const dataUrl = await readFileAsDataUrl(file);
                const img = await loadImage(dataUrl);
                const aspect = img.naturalWidth / img.naturalHeight || 1;
                dispatch(setIcon({ url: dataUrl, aspect }));
            } catch {
                toast.error("Could not read that image");
            }
        },
        [dispatch],
    );

    const dragHandlers = {
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

    if (iconUrl) {
        return (
            <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: "white", boxShadow: "#D2EAAA 0px 0px 0px 1px" }}
            >
                <div
                    className="w-9 h-9 rounded-md shrink-0 flex items-center justify-center overflow-hidden"
                    style={{ background: "#F4FAE8" }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={iconUrl} alt="Uploaded icon" className="max-w-full max-h-full object-contain" />
                </div>
                <span className="flex-1 min-w-0 text-[12px] text-[#64748b]">Custom icon</span>
                <button
                    type="button"
                    onClick={() => dispatch(clearIcon())}
                    aria-label="Remove icon"
                    className="p-1.5 rounded-md text-[#9CA3AF] hover:bg-[#F4FAE8] hover:text-[#1a1a2e] transition-colors shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <label
            {...dragHandlers}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors border-[1.5px] border-dashed ${
                dragOver ? "border-[#C5E89A] bg-[#F4FAE8]" : "border-[#D2EAAA] bg-white hover:bg-[#F8FCF2]"
            }`}
        >
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <Upload className="w-4 h-4 shrink-0 text-[#9ED06C]" strokeWidth={1.8} />
            <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#1a1a2e]">Upload icon</p>
                <p className="text-[11px] text-[#9CA3AF]">SVG &middot; PNG &middot; JPG &middot; up to 2MB</p>
            </div>
        </label>
    );
}
