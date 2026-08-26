"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyDecorateBgPhoto } from "@/lib/decoratePhotoUpload";
import {
  setBackgroundMode,
  setSolidColor,
  setStripeColor1,
  setStripeColor2,
  setStripeWidth,
  setCheckerboardColor1,
  setCheckerboardColor2,
  setCheckerboardSize,
  setNoiseOpacity,
  setGradientColor1,
  setGradientColor2,
  setGradientAngle,
  setGridColor,
  setGridSize,
  setDotGridColor,
  setDotGridSpacing,
  setDotGridRadius,
  type BackgroundMode,
} from "@/store/slices/decorateSlice";
import ColorPicker from "./ColorPicker";

/** Each entry doubles as the key under `editor.dot.paper.modes`. */
const MODES: BackgroundMode[] = [
  "solid",
  "stripe",
  "photo",
  "checkerboard",
  "noise",
  "gradient",
  "grid",
  "dot-grid",
];

const RAINBOW = "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)";

interface ColorRowProps {
  label: string;
  isSet: boolean;
  color: string;
  open: boolean;
  onToggle: () => void;
  onChange: (hex: string) => void;
}

function ColorRow({ label, isSet, color, open, onToggle, onChange }: ColorRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">{label}</label>
        <button
          type="button"
          onClick={onToggle}
          aria-label={label}
          className="relative w-9 h-9 -mr-1.5 flex items-center justify-center rounded-lg transition-colors active:bg-[#F4FAE8]"
        >
          <span
            className="block w-6 h-6 rounded-full border border-[#D2EAAA]"
            style={{ background: isSet ? color : RAINBOW }}
          />
        </button>
      </div>
      {open && <ColorPicker color={color} onChange={onChange} />}
    </div>
  );
}

export default function PaperPicker() {
  const t = useTranslations("editor");
  const dispatch = useAppDispatch();
  const background = useAppSelector((s) => s.decorate.background);
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function togglePicker(name: string) {
    setOpenPicker((v) => (v === name ? null : name));
  }

  function handleBgPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(applyDecorateBgPhoto(file));
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {/* Mode selector */}
      <div className="grid grid-cols-4 gap-1">
        {MODES.map((mode) => {
          const selected = background.mode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => {
                dispatch(setBackgroundMode(mode));
                setOpenPicker(null);
              }}
              className="min-h-[36px] py-1.5 text-[11px] rounded-lg transition-colors"
              style={{
                background: selected ? "#E8F5D2" : "#F4FAE8",
                color: selected ? "#C5E89A" : "#64748b",
                boxShadow: selected
                  ? "#C5E89A 0px 0px 0px 1.5px"
                  : "#D2EAAA 0px 0px 0px 1px",
              }}
            >
              {t(`dot.paper.modes.${mode}`)}
            </button>
          );
        })}
      </div>

      {/* Solid */}
      {background.mode === "solid" && (
        <ColorPicker
          color={background.solidColor}
          onChange={(hex) => dispatch(setSolidColor(hex))}
        />
      )}

      {/* Stripe */}
      {background.mode === "stripe" && (
        <div className="flex flex-col gap-3">
          <ColorRow
            label={t("dot.paper.color1")}
            isSet={background.stripeColor1Set}
            color={background.stripeColor1}
            open={openPicker === "stripe1"}
            onToggle={() => togglePicker("stripe1")}
            onChange={(hex) => dispatch(setStripeColor1(hex))}
          />
          <ColorRow
            label={t("dot.paper.color2")}
            isSet={background.stripeColor2Set}
            color={background.stripeColor2}
            open={openPicker === "stripe2"}
            onToggle={() => togglePicker("stripe2")}
            onChange={(hex) => dispatch(setStripeColor2(hex))}
          />
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">{t("dot.paper.width")}</label>
              <span className="text-[12px] tabular-nums text-[#64748b]">{background.stripeWidth}</span>
            </div>
            <Slider min={1} max={100} step={1} value={[background.stripeWidth]} onValueChange={(v) => dispatch(setStripeWidth(v[0]))} />
          </div>
        </div>
      )}

      {/* Photo */}
      {background.mode === "photo" && (
        <div className="flex flex-col gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgPhotoUpload} />
          {background.bgPhotoUrl ? (
            <div className="relative rounded-lg overflow-hidden aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={background.bgPhotoUrl} alt={t("dot.paper.backgroundAlt")} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#D2EAAA] transition-colors hover:border-[#C5E89A]"
            >
              <Upload className="w-5 h-5 text-[#64748b]" />
              <span className="text-[11px] text-[#64748b]">{t("common.uploadPhoto")}</span>
            </button>
          )}
        </div>
      )}

      {/* Checkerboard */}
      {background.mode === "checkerboard" && (
        <div className="flex flex-col gap-3">
          <ColorRow
            label={t("dot.paper.color1")}
            isSet={background.checkerboardColor1Set}
            color={background.checkerboardColor1}
            open={openPicker === "checker1"}
            onToggle={() => togglePicker("checker1")}
            onChange={(hex) => dispatch(setCheckerboardColor1(hex))}
          />
          <ColorRow
            label={t("dot.paper.color2")}
            isSet={background.checkerboardColor2Set}
            color={background.checkerboardColor2}
            open={openPicker === "checker2"}
            onToggle={() => togglePicker("checker2")}
            onChange={(hex) => dispatch(setCheckerboardColor2(hex))}
          />
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">{t("common.size")}</label>
              <span className="text-[12px] tabular-nums text-[#64748b]">{background.checkerboardSize}</span>
            </div>
            <Slider min={20} max={200} step={4} value={[background.checkerboardSize]} onValueChange={(v) => dispatch(setCheckerboardSize(v[0]))} />
          </div>
        </div>
      )}

      {/* Noise */}
      {background.mode === "noise" && (
        <div className="flex flex-col gap-3">
          <ColorPicker color={background.solidColor} onChange={(hex) => dispatch(setSolidColor(hex))} />
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">{t("dot.paper.grain")}</label>
              <span className="text-[12px] tabular-nums text-[#64748b]">{background.noiseOpacity}</span>
            </div>
            <Slider min={0} max={100} step={1} value={[background.noiseOpacity]} onValueChange={(v) => dispatch(setNoiseOpacity(v[0]))} />
          </div>
        </div>
      )}

      {/* Gradient */}
      {background.mode === "gradient" && (
        <div className="flex flex-col gap-3">
          <ColorRow
            label={t("dot.paper.color1")}
            isSet={background.gradientColor1Set}
            color={background.gradientColor1}
            open={openPicker === "grad1"}
            onToggle={() => togglePicker("grad1")}
            onChange={(hex) => dispatch(setGradientColor1(hex))}
          />
          <ColorRow
            label={t("dot.paper.color2")}
            isSet={background.gradientColor2Set}
            color={background.gradientColor2}
            open={openPicker === "grad2"}
            onToggle={() => togglePicker("grad2")}
            onChange={(hex) => dispatch(setGradientColor2(hex))}
          />
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">{t("dot.paper.angle")}</label>
              <span className="text-[12px] tabular-nums text-[#64748b]">{background.gradientAngle}&deg;</span>
            </div>
            <Slider min={0} max={360} step={1} value={[background.gradientAngle]} onValueChange={(v) => dispatch(setGradientAngle(v[0]))} />
          </div>
        </div>
      )}

      {/* Grid */}
      {background.mode === "grid" && (
        <div className="flex flex-col gap-3">
          <ColorPicker color={background.solidColor} onChange={(hex) => dispatch(setSolidColor(hex))} />
          <ColorRow
            label={t("dot.paper.lineColor")}
            isSet={background.gridColorSet}
            color={background.gridColor}
            open={openPicker === "grid"}
            onToggle={() => togglePicker("grid")}
            onChange={(hex) => dispatch(setGridColor(hex))}
          />
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">{t("common.size")}</label>
              <span className="text-[12px] tabular-nums text-[#64748b]">{background.gridSize}</span>
            </div>
            <Slider min={20} max={200} step={4} value={[background.gridSize]} onValueChange={(v) => dispatch(setGridSize(v[0]))} />
          </div>
        </div>
      )}

      {/* Dot Grid */}
      {background.mode === "dot-grid" && (
        <div className="flex flex-col gap-3">
          <ColorPicker color={background.solidColor} onChange={(hex) => dispatch(setSolidColor(hex))} />
          <ColorRow
            label={t("dot.paper.dotColor")}
            isSet={background.dotGridColorSet}
            color={background.dotGridColor}
            open={openPicker === "dotgrid"}
            onToggle={() => togglePicker("dotgrid")}
            onChange={(hex) => dispatch(setDotGridColor(hex))}
          />
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">{t("common.spacing")}</label>
              <span className="text-[12px] tabular-nums text-[#64748b]">{background.dotGridSpacing}</span>
            </div>
            <Slider min={20} max={100} step={2} value={[background.dotGridSpacing]} onValueChange={(v) => dispatch(setDotGridSpacing(v[0]))} />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">{t("common.size")}</label>
              <span className="text-[12px] tabular-nums text-[#64748b]">{background.dotGridRadius}</span>
            </div>
            <Slider min={1} max={20} step={1} value={[background.dotGridRadius]} onValueChange={(v) => dispatch(setDotGridRadius(v[0]))} />
          </div>
        </div>
      )}
    </div>
  );
}
