"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type Konva from "konva";
import { useAppSelector } from "@/store/hooks";
import PhotoUploader from "@/components/decorate/PhotoUploader";
import PaperPicker from "@/components/decorate/PaperPicker";
import DotControls from "@/components/decorate/DotControls";
import ExportButton from "@/components/decorate/ExportButton";

const DecorateCanvas = dynamic(
    () => import("@/components/decorate/DecorateCanvas"),
    { ssr: false, loading: () => <div className="w-full aspect-square sketch-border bg-white" /> },
);

export default function DecorateApp() {
    const photoUrl = useAppSelector((s) => s.decorate.photoUrl);
    const stageRef = useRef<Konva.Stage | null>(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div className="h-[calc(100vh-3rem)] overflow-hidden flex">
            {/* Left: canvas */}
            <div className="flex-1 min-w-0 flex items-center justify-center p-4 overflow-hidden">
                <div className="w-full max-w-[calc(100vh-5rem)]">
                    <DecorateCanvas ref={stageRef} />
                </div>
            </div>

            {/* Right: controls */}
            <aside className="w-72 shrink-0 flex flex-col border-l border-foreground/10">
                <PhotoUploader hasPhoto={Boolean(photoUrl)} />
                <div className="flex-1 overflow-y-auto min-h-0">
                    <PaperPicker />
                    <DotControls />
                </div>
                <div className="shrink-0 p-3 border-t border-foreground/10">
                    <ExportButton stageRef={stageRef} />
                </div>
            </aside>
        </div>
    );
}
