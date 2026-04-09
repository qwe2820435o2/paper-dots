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
        className="w-full aspect-square rounded-xl bg-[#232336]"
        style={{
          boxShadow: "rgba(67, 56, 202, 0.15) 0px 0px 0px 1px",
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
    <div className="theme-dark h-[calc(100vh-56px)] overflow-hidden flex bg-[#1e1e2e]">
      {/* Left: icon toolbar */}
      <div
        className="shrink-0 w-14 flex flex-col items-center py-3 gap-1 bg-[#171725]"
        style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
      >
        {TOOLS.map(({ id, icon: Icon, label }) => {
          const isActive = activePanel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => togglePanel(id)}
              title={label}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: isActive
                  ? "rgba(67, 56, 202, 0.2)"
                  : "transparent",
                color: isActive ? "#a5b4fc" : "#9595a8",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "#e2e2e8";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9595a8";
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
          className="shrink-0 w-72 flex flex-col bg-[#232336] overflow-hidden"
          style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Panel header */}
          <div
            className="shrink-0 px-4 py-3 text-[13px] font-medium text-[#e2e2e8]"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
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
