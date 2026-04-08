"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type Konva from "konva";
import { useAppSelector } from "@/store/hooks";
import PhotoUploader from "@/components/decorate/PhotoUploader";
import LayoutPicker from "@/components/decorate/LayoutPicker";
import PaperPicker from "@/components/decorate/PaperPicker";
import DotControls from "@/components/decorate/DotControls";
import ExportButton from "@/components/decorate/ExportButton";

const DecorateCanvas = dynamic(
    () => import("@/components/decorate/DecorateCanvas"),
    {
        ssr: false,
        loading: () => (
            <div
                className="w-full aspect-square rounded-[12px] bg-[#090909]"
                style={{ boxShadow: "rgba(0, 153, 255, 0.15) 0px 0px 0px 1px" }}
            />
        ),
    },
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
        <div className="h-[calc(100vh-56px)] overflow-hidden flex bg-black">
            {/* Left: canvas or upload drop zone */}
            <div className="flex-1 min-w-0 flex items-center justify-center p-6 overflow-hidden">
                <div className="w-full max-w-[calc(100vh-80px)]">
                    {photoUrl ? (
                        <DecorateCanvas ref={stageRef} />
                    ) : (
                        <PhotoUploader variant="canvas" hasPhoto={false} />
                    )}
                </div>
            </div>

            {/* Right: controls */}
            <aside
                className="w-72 shrink-0 flex flex-col bg-black"
                style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
            >
                {photoUrl && (
                    <PhotoUploader variant="sidebar" hasPhoto={true} />
                )}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <LayoutPicker />
                    <PaperPicker />
                    <DotControls />
                </div>
                <div
                    className="shrink-0 p-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
                    <ExportButton stageRef={stageRef} />
                </div>
            </aside>
        </div>
    );
}
