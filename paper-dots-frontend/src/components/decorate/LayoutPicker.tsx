"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setLayoutRatio,
  setLayoutType,
  type LayoutType,
} from "@/store/slices/decorateSlice";

/** Each entry doubles as the key under `editor.dot.layout.options`. */
const LAYOUT_OPTIONS: LayoutType[] = [
  "main-left",
  "main-right",
  "main-top",
  "main-bottom",
  "border",
];

export default function LayoutPicker() {
  const t = useTranslations("editor.dot.layout");
  const dispatch = useAppDispatch();
  const layout = useAppSelector((s) => s.decorate.layout);

  return (
    <div className="px-4 py-4 flex flex-col gap-5">
      {/* Stitch type */}
      <div>
        <label
          className="block text-[11px] uppercase mb-2 text-[#64748b] tracking-[0.08em]"
        >
          {t("stitch")}
        </label>
        <div className="relative">
          <select
            value={layout.type}
            onChange={(e) =>
              dispatch(setLayoutType(e.target.value as LayoutType))
            }
            className="w-full appearance-none px-3 py-2 pr-8 rounded-lg text-[13px] text-[#1a1a2e] outline-none transition-colors cursor-pointer bg-white border border-[#D2EAAA] focus:border-[#C5E89A]"
          >
            {LAYOUT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`options.${value}`)}
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
            {/* The slider means "how thick is the frame" in the Polaroid layout and "how is
                the space split" in the others, so the label swaps with the mode. */}
            {layout.type === "border" ? t("border") : t("ratio")}
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
