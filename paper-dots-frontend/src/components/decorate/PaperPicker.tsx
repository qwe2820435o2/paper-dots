"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Upload } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { PAPERS } from "@/lib/papers";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setBackgroundMode,
    setSolidColor,
    setStripeColor1,
    setStripeColor2,
    setStripeWidth,
    setBgPhotoUrl,
    setTemplateId,
    type BackgroundMode,
} from "@/store/slices/decorateSlice";
import ColorPicker from "./ColorPicker";

const MODES: { id: BackgroundMode; label: string }[] = [
    { id: "solid", label: "Solid" },
    { id: "stripe", label: "Stripe" },
    { id: "photo", label: "Photo" },
    { id: "template", label: "Template" },
];

const LABEL_STYLE = {
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    color: "#a6a6a6",
    letterSpacing: "0.08em",
} as const;

const VALUE_STYLE = {
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    color: "#a6a6a6",
} as const;

export default function PaperPicker() {
    const dispatch = useAppDispatch();
    const background = useAppSelector((s) => s.decorate.background);
    const [isOpen, setIsOpen] = useState(true);
    const [picker1Open, setPicker1Open] = useState(false);
    const [picker2Open, setPicker2Open] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleBgPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        dispatch(setBgPhotoUrl(url));
    }

    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {/* Header */}
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors"
            >
                <span
                    className="text-[13px] font-medium text-white"
                    style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                    Paper
                </span>
                {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" style={{ color: "#a6a6a6" }} />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: "#a6a6a6" }} />
                )}
            </button>

            {isOpen && (
                <div className="px-4 pb-4 flex flex-col gap-4">
                    {/* Mode selector */}
                    <div className="grid grid-cols-4 gap-1">
                        {MODES.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => dispatch(setBackgroundMode(m.id))}
                                className="py-1.5 text-[11px] rounded-[6px] transition-colors"
                                style={{
                                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                                    background:
                                        background.mode === m.id
                                            ? "rgba(255,255,255,0.12)"
                                            : "rgba(255,255,255,0.04)",
                                    color:
                                        background.mode === m.id ? "#ffffff" : "#a6a6a6",
                                }}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Solid mode */}
                    {background.mode === "solid" && (
                        <ColorPicker
                            color={background.solidColor}
                            onChange={(hex) => dispatch(setSolidColor(hex))}
                        />
                    )}

                    {/* Stripe mode */}
                    {background.mode === "stripe" && (
                        <div className="flex flex-col gap-3">
                            {/* Color 1 */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] uppercase" style={LABEL_STYLE}>
                                        Color 1
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPicker1Open((v) => !v);
                                            setPicker2Open(false);
                                        }}
                                        className="w-5 h-5 rounded-full border border-white/20 transition-shadow hover:border-white/40"
                                        style={{
                                            background: background.stripeColor1Set
                                                ? background.stripeColor1
                                                : "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                                        }}
                                        aria-label="Pick color 1"
                                    />
                                </div>
                                {picker1Open && (
                                    <ColorPicker
                                        color={background.stripeColor1}
                                        onChange={(hex) => dispatch(setStripeColor1(hex))}
                                    />
                                )}
                            </div>

                            {/* Color 2 */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] uppercase" style={LABEL_STYLE}>
                                        Color 2
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPicker2Open((v) => !v);
                                            setPicker1Open(false);
                                        }}
                                        className="w-5 h-5 rounded-full border border-white/20 transition-shadow hover:border-white/40"
                                        style={{
                                            background: background.stripeColor2Set
                                                ? background.stripeColor2
                                                : "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                                        }}
                                        aria-label="Pick color 2"
                                    />
                                </div>
                                {picker2Open && (
                                    <ColorPicker
                                        color={background.stripeColor2}
                                        onChange={(hex) => dispatch(setStripeColor2(hex))}
                                    />
                                )}
                            </div>

                            {/* Stripe width */}
                            <div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <label className="text-[11px] uppercase" style={LABEL_STYLE}>
                                        Width
                                    </label>
                                    <span className="text-[12px] tabular-nums" style={VALUE_STYLE}>
                                        {background.stripeWidth}
                                    </span>
                                </div>
                                <Slider
                                    min={1}
                                    max={100}
                                    step={1}
                                    value={[background.stripeWidth]}
                                    onValueChange={(v) => dispatch(setStripeWidth(v[0]))}
                                />
                            </div>
                        </div>
                    )}

                    {/* Photo mode */}
                    {background.mode === "photo" && (
                        <div className="flex flex-col gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleBgPhotoUpload}
                            />
                            {background.bgPhotoUrl ? (
                                <div className="relative rounded-[8px] overflow-hidden aspect-square">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={background.bgPhotoUrl}
                                        alt="background"
                                        className="w-full h-full object-cover"
                                    />
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
                                    className="w-full aspect-square flex flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed transition-colors hover:border-white/30"
                                    style={{ borderColor: "rgba(255,255,255,0.15)" }}
                                >
                                    <Upload className="w-5 h-5" style={{ color: "#a6a6a6" }} />
                                    <span
                                        className="text-[11px]"
                                        style={{
                                            fontFamily: "var(--font-inter), system-ui, sans-serif",
                                            color: "#a6a6a6",
                                        }}
                                    >
                                        Upload photo
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Template mode */}
                    {background.mode === "template" && (
                        <div className="grid grid-cols-3 gap-2">
                            {PAPERS.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => dispatch(setTemplateId(p.id))}
                                    className="aspect-square flex items-end justify-center pb-1 text-[10px] transition-all rounded-[6px] overflow-hidden"
                                    style={
                                        background.templateId === p.id
                                            ? {
                                                  backgroundImage: p.src
                                                      ? `url(${p.src})`
                                                      : undefined,
                                                  backgroundSize: "cover",
                                                  backgroundColor: "#fafafa",
                                                  boxShadow:
                                                      "rgba(0, 153, 255, 0.7) 0px 0px 0px 2px",
                                              }
                                            : {
                                                  backgroundImage: p.src
                                                      ? `url(${p.src})`
                                                      : undefined,
                                                  backgroundSize: "cover",
                                                  backgroundColor: "#fafafa",
                                                  boxShadow:
                                                      "rgba(255, 255, 255, 0.12) 0px 0px 0px 1px",
                                              }
                                    }
                                    aria-pressed={background.templateId === p.id}
                                >
                                    <span
                                        className="px-1 rounded-sm text-[10px]"
                                        style={{
                                            fontFamily:
                                                "var(--font-inter), system-ui, sans-serif",
                                            background: "rgba(0,0,0,0.6)",
                                            color: "#ffffff",
                                        }}
                                    >
                                        {p.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
