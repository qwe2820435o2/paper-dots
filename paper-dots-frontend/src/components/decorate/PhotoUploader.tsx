"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setPhotoUrl } from "@/store/slices/decorateSlice";

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
            dispatch(setPhotoUrl(url));
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
                className="rounded-[10px] cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] select-none px-4 py-3"
                style={{
                    border: dragOver
                        ? "1.5px solid #0099ff"
                        : "1.5px dashed rgba(0, 153, 255, 0.35)",
                    background: dragOver
                        ? "rgba(0, 153, 255, 0.08)"
                        : "transparent",
                    boxShadow: dragOver
                        ? "rgba(0, 153, 255, 0.2) 0px 0px 20px 0px"
                        : "none",
                }}
                onMouseEnter={(e) => {
                    if (!dragOver) {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0, 153, 255, 0.7)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(0, 153, 255, 0.04)";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!dragOver) {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0, 153, 255, 0.35)";
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

                <div
                    className="w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all duration-150"
                    style={{ background: dragOver ? "rgba(0, 153, 255, 0.15)" : "rgba(0, 153, 255, 0.08)" }}
                >
                    <Upload className="w-4 h-4 text-white" strokeWidth={1.5} />
                </div>

                <div className="flex flex-col items-center gap-1.5">
                    <p
                        className="text-[13px] font-medium text-white"
                        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                    >
                        Upload photo
                    </p>
                    <p
                        className="text-[11px] text-center"
                        style={{
                            fontFamily: "var(--font-inter), system-ui, sans-serif",
                            color: "#a6a6a6",
                        }}
                    >
                        Drop image here or click to browse
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                        {["PNG", "JPG", "WEBP"].map((fmt) => (
                            <span
                                key={fmt}
                                className="px-2 py-0.5 rounded-full text-[10px]"
                                style={{
                                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                                    background: "rgba(255, 255, 255, 0.08)",
                                    color: "#a6a6a6",
                                    letterSpacing: "0.04em",
                                }}
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
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                borderLeft: "3px solid #0099ff",
                background: dragOver ? "rgba(0, 153, 255, 0.06)" : "transparent",
            }}
            onMouseEnter={(e) => {
                if (!dragOver) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0, 153, 255, 0.04)";
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
            <Upload className="w-4 h-4 shrink-0 text-white" strokeWidth={1.8} />
            <div className="min-w-0">
                <p
                    className="text-[14px] font-medium text-white"
                    style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                    {hasPhoto ? "Replace photo" : "Upload photo"}
                </p>
                <p
                    className="text-[11px]"
                    style={{
                        fontFamily: "var(--font-inter), system-ui, sans-serif",
                        color: "#a6a6a6",
                    }}
                >
                    PNG · JPG · WEBP
                </p>
            </div>
        </label>
    );
}
