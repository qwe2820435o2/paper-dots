"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setPhotoUrl } from "@/store/slices/decorateSlice";
import { cn } from "@/lib/utils";

interface Props {
    hasPhoto: boolean;
}

export default function PhotoUploader({ hasPhoto }: Props) {
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

    return (
        <label
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
            }}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-foreground/10 transition-colors shrink-0",
                dragOver ? "bg-foreground/5" : "hover:bg-foreground/5",
            )}
        >
            <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
            <Upload className="w-4 h-4 shrink-0 text-foreground" strokeWidth={1.8} />
            <div className="min-w-0">
                <p className="font-serif text-sm text-foreground">
                    {hasPhoto ? "Replace photo" : "Upload photo"}
                </p>
                <p className="text-[10px] text-muted-foreground">PNG · JPG · WEBP</p>
            </div>
        </label>
    );
}
