"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setPhotoUrl } from "@/store/slices/decorateSlice";
import { cn } from "@/lib/utils";

interface Props {
    hasPhoto: boolean;
}

export default function PhotoUploader({ hasPhoto }: Props) {
    const dispatch = useAppDispatch();
    const inputRef = useRef<HTMLInputElement | null>(null);
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
        <div
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
            onClick={() => inputRef.current?.click()}
            className={cn(
                "sketch-border bg-white p-6 cursor-pointer text-center transition-colors",
                dragOver ? "bg-foreground/5" : "hover:bg-foreground/5",
            )}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
            <Upload className="w-6 h-6 mx-auto mb-2 text-foreground" strokeWidth={1.8} />
            <p className="font-serif text-lg text-foreground">
                {hasPhoto ? "Replace photo" : "Drop a photo or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PNG · JPG · WEBP</p>
        </div>
    );
}
