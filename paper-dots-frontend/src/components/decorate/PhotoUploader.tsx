"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setPhotoUrl } from "@/store/slices/decorateSlice";
import { cn } from "@/lib/utils";

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
                className={cn(
                    "w-full aspect-square rounded-[12px] cursor-pointer transition-colors flex flex-col items-center justify-center gap-4",
                    dragOver ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                )}
                style={{
                    background: dragOver ? undefined : "#090909",
                    boxShadow: dragOver
                        ? "rgba(0, 153, 255, 0.7) 0px 0px 0px 2px inset"
                        : "rgba(255,255,255,0.08) 0px 0px 0px 1px inset",
                }}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <Upload
                    className="w-10 h-10 text-white"
                    strokeWidth={1.4}
                />
                <div className="flex flex-col items-center gap-1">
                    <p
                        className="text-[16px] font-medium text-white"
                        style={{
                            fontFamily:
                                "var(--font-inter), system-ui, sans-serif",
                        }}
                    >
                        Upload photo
                    </p>
                    <p
                        className="text-[12px]"
                        style={{
                            fontFamily:
                                "var(--font-inter), system-ui, sans-serif",
                            color: "#a6a6a6",
                        }}
                    >
                        Drop image here or click to browse · PNG · JPG · WEBP
                    </p>
                </div>
            </label>
        );
    }

    return (
        <label
            {...commonDragHandlers}
            className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors shrink-0",
                dragOver ? "bg-white/[0.06]" : "hover:bg-white/[0.04]",
            )}
            style={{
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                boxShadow: dragOver
                    ? "rgba(0, 153, 255, 0.25) 0px 0px 0px 1px inset"
                    : "none",
            }}
        >
            <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
            <Upload
                className="w-4 h-4 shrink-0 text-white"
                strokeWidth={1.8}
            />
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
