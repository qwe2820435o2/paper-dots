"use client";

import { ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setLayoutRatio,
  setLayoutType,
  type LayoutType,
} from "@/store/slices/decorateSlice";

const LAYOUT_OPTIONS: { value: LayoutType; label: string }[] = [
  { value: "main-left", label: "Main on Left" },
  { value: "main-right", label: "Main on Right" },
  { value: "main-top", label: "Main on Top" },
  { value: "main-bottom", label: "Main on Bottom" },
  { value: "border", label: "Polaroid Border" },
];

function ratioLabel(type: LayoutType): string {
  if (type === "border") return "Border";
  return "Ratio";
}

export default function LayoutPicker() {
  const dispatch = useAppDispatch();
  const layout = useAppSelector((s) => s.decorate.layout);

  return (
    <div className="px-4 py-4 flex flex-col gap-5">
      {/* Stitch type */}
      <div>
        <label
          className="block text-[11px] uppercase mb-2 text-[#64748b] tracking-[0.08em]"
        >
          Stitch
        </label>
        <div className="relative">
          <select
            value={layout.type}
            onChange={(e) =>
              dispatch(setLayoutType(e.target.value as LayoutType))
            }
            className="w-full appearance-none px-3 py-2 pr-8 rounded-lg text-[13px] text-[#1a1a2e] outline-none transition-colors cursor-pointer bg-white border border-[#D2EAAA] focus:border-[#C5E89A]"
          >
            {LAYOUT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748b]"
          />
        </div>
      </div>

      {/* Ratio */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">
            {ratioLabel(layout.type)}
          </label>
          <span className="text-[12px] tabular-nums text-[#64748b]">
            {layout.ratio}
          </span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[layout.ratio]}
          onValueChange={(v) => dispatch(setLayoutRatio(v[0]))}
        />
      </div>
    </div>
  );
}
