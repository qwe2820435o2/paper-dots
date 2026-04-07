"use client";

import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setTemplate } from "@/store/slices/editSlice";
import { getTemplatesForSlotCount, TemplateDef } from "@/lib/templates";
import { useDetectSlots } from "@/lib/useDetectSlots";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

function bgLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

interface TemplateCardProps {
  template: TemplateDef;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template: t, isSelected, onSelect }: TemplateCardProps) {
  const slotState = useDetectSlots(t);
  const placeholders =
    (t.placeholders && t.placeholders.length > 0)
      ? t.placeholders
      : slotState.status === "ready"
      ? slotState.placeholders
      : [];

  const isLight = bgLuminance(t.previewBg) > 0.5;
  const slotStroke = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)';
  const slotFill = isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.18)';

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-14 flex flex-col items-center gap-2 rounded-xl p-2 transition-all duration-200 outline-none",
        "hover:bg-white/5",
      )}
    >
      <div
        className={cn(
          "w-full overflow-hidden relative",
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
        style={{
          background: t.previewBg,
          aspectRatio: `${t.canvasWidth} / ${t.canvasHeight}`,
        }}
      >
        {t.backgroundImage && (
          <Image
            src={t.backgroundImage}
            alt={t.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        )}
        <svg
          viewBox={`0 0 ${t.canvasWidth} ${t.canvasHeight}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {placeholders.map((ph) => {
            const cx = ph.x + ph.width / 2;
            const cy = ph.y + ph.height / 2;
            const rot = ph.rotation ?? 0;
            const transform = rot ? `rotate(${rot}, ${cx}, ${cy})` : undefined;
            return (
              <rect
                key={ph.id}
                x={ph.x}
                y={ph.y}
                width={ph.width}
                height={ph.height}
                rx={ph.borderRadius ?? 0}
                fill={slotFill}
                stroke={slotStroke}
                strokeWidth={Math.max(t.canvasWidth * 0.005, 2)}
                transform={transform}
              />
            );
          })}
        </svg>

        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/30 rounded-lg">
            <div className="bg-primary rounded-full p-1">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
      <span
        className={cn(
          "text-[11px] font-medium leading-tight text-center",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}
      >
        {t.name}
      </span>
    </button>
  );
}

export function TemplateGrid() {
  const dispatch = useDispatch();
  const selectedTemplateId = useSelector(
    (state: RootState) => state.edit.selectedTemplateId
  );
  const totalShots = useSelector(
    (state: RootState) => state.booth.totalShots
  );
  const templates = getTemplatesForSlotCount(totalShots);

  return (
    <div className="grid grid-rows-2 grid-flow-col gap-x-3 gap-y-1 overflow-x-auto scrollbar-none pb-1">
      {templates.map((t) => (
        <TemplateCard
          key={t.id}
          template={t}
          isSelected={selectedTemplateId === t.id}
          onSelect={() => dispatch(setTemplate(t.id))}
        />
      ))}
    </div>
  );
}
