"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import {
  Upload,
  LayoutGrid,
  Palette,
  CircleDot,
  Download,
} from "lucide-react";
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
        className="w-full aspect-square rounded-xl bg-[#FFF0F5]"
        style={{
          boxShadow: "rgba(243, 158, 182, 0.25) 0px 0px 0px 1px",
        }}
      />
    ),
  },
);

type Panel = "upload" | "layout" | "paper" | "dots" | "export" | null;

const TOOLS: { id: Panel; icon: typeof Upload; label: string }[] = [
  { id: "upload", icon: Upload, label: "Upload" },
  { id: "layout", icon: LayoutGrid, label: "Layout" },
  { id: "paper", icon: Palette, label: "Paper" },
  { id: "dots", icon: CircleDot, label: "Dots" },
  { id: "export", icon: Download, label: "Export" },
];

export default function DecorateApp() {
  const photoUrl = useAppSelector((s) => s.decorate.photoUrl);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [activePanel, setActivePanel] = useState<Panel>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function togglePanel(panel: Panel) {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }

  return (
    <div className="h-[calc(100vh-56px)] overflow-hidden flex bg-[#FFF7FA]">
      {/* Left: icon toolbar */}
      <div
        className="shrink-0 w-14 flex flex-col items-center py-3 gap-1 bg-white"
        style={{ borderRight: "1px solid #F5D5E0" }}
      >
        {TOOLS.map(({ id, icon: Icon, label }) => {
          const isActive = activePanel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => togglePanel(id)}
              title={label}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: isActive ? "#FFE4EF" : "transparent",
                color: isActive ? "#F39EB6" : "#9CA3AF",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#FFF0F5";
                  e.currentTarget.style.color = "#F39EB6";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9CA3AF";
                }
              }}
            >
              <Icon size={20} strokeWidth={1.6} />
            </button>
          );
        })}
      </div>

      {/* Expandable panel */}
      {activePanel && (
        <div
          className="shrink-0 w-72 flex flex-col bg-white overflow-hidden"
          style={{ borderRight: "1px solid #F5D5E0" }}
        >
          {/* Panel header */}
          <div
            className="shrink-0 px-4 py-3 text-[13px] font-medium text-[#1a1a2e]"
            style={{ borderBottom: "1px solid #F5D5E0" }}
          >
            {TOOLS.find((t) => t.id === activePanel)?.label}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {activePanel === "upload" && (
              <div className="p-4">
                <PhotoUploader
                  variant="canvas"
                  hasPhoto={!!photoUrl}
                />
              </div>
            )}
            {activePanel === "layout" && <LayoutPicker />}
            {activePanel === "paper" && <PaperPicker />}
            {activePanel === "dots" && <DotControls />}
            {activePanel === "export" && (
              <div className="p-4">
                <ExportButton stageRef={stageRef} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas area */}
      <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center p-6 overflow-hidden">
        {photoUrl ? (
          <DecorateCanvas ref={stageRef} />
        ) : (
          <div className="w-full max-w-[calc(100vh-80px)]">
            <PhotoUploader variant="canvas" hasPhoto={false} />
          </div>
        )}
      </div>
    </div>
  );
}
