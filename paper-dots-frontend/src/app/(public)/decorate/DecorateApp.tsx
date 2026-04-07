"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import type Konva from "konva";
import { useAppSelector } from "@/store/hooks";
import PhotoUploader from "@/components/decorate/PhotoUploader";
import PaperPicker from "@/components/decorate/PaperPicker";
import DotControls from "@/components/decorate/DotControls";
import ExportButton from "@/components/decorate/ExportButton";

// react-konva touches `window`, so the canvas can only render on the client.
const DecorateCanvas = dynamic(
    () => import("@/components/decorate/DecorateCanvas"),
    { ssr: false, loading: () => <div className="w-full max-w-[720px] aspect-square mx-auto sketch-border bg-white" /> },
);

export default function DecorateApp() {
    const photoUrl = useAppSelector((s) => s.decorate.photoUrl);
    const stageRef = useRef<Konva.Stage | null>(null);

    return (
        <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground">
                        Decorate
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-2">
                        Upload a photo, pick a paper, scatter some dots.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
                    <div>
                        <DecorateCanvas ref={stageRef} />
                    </div>
                    <aside className="flex flex-col gap-6">
                        <PhotoUploader hasPhoto={Boolean(photoUrl)} />
                        <PaperPicker />
                        <DotControls />
                        <ExportButton stageRef={stageRef} />
                    </aside>
                </div>
            </div>
        </main>
    );
}
