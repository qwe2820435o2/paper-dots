"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Upload } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setBackgroundMode,
    setSolidColor,
    setStripeColor1,
    setStripeColor2,
    setStripeWidth,
    setBgPhotoUrl,
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

const MODES: { id: BackgroundMode; label: string }[] = [
    { id: "solid", label: "Solid" },
    { id: "stripe", label: "Stripe" },
    { id: "photo", label: "Photo" },
    { id: "checkerboard", label: "Checker" },
    { id: "noise", label: "Noise" },
    { id: "gradient", label: "Gradient" },
    { id: "grid", label: "Grid" },
    { id: "dot-grid", label: "Dot Grid" },
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
                <label className="text-[11px] uppercase" style={LABEL_STYLE}>{label}</label>
                <button
                    type="button"
                    onClick={onToggle}
                    className="w-5 h-5 rounded-full border border-white/20 transition-shadow hover:border-white/40"
                    style={{ background: isSet ? color : RAINBOW }}
                />
            </div>
            {open && <ColorPicker color={color} onChange={onChange} />}
        </div>
    );
}

export default function PaperPicker() {
    const dispatch = useAppDispatch();
    const background = useAppSelector((s) => s.decorate.background);
    const [isOpen, setIsOpen] = useState(true);
    const [openPicker, setOpenPicker] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function togglePicker(name: string) {
        setOpenPicker((v) => (v === name ? null : name));
    }

    function handleBgPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        dispatch(setBgPhotoUrl(URL.createObjectURL(file)));
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
                    {/* Mode selector — 4 columns, wraps to 2 rows */}
                    <div className="grid grid-cols-4 gap-1">
                        {MODES.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                    dispatch(setBackgroundMode(m.id));
                                    setOpenPicker(null);
                                }}
                                className="py-1.5 text-[11px] rounded-[6px] transition-colors"
                                style={{
                                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                                    background:
                                        background.mode === m.id
                                            ? "rgba(255,255,255,0.12)"
                                            : "rgba(255,255,255,0.04)",
                                    color: background.mode === m.id ? "#ffffff" : "#a6a6a6",
                                }}
                            >
                                {m.label}
                            </button>
                        ))}
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
                                label="Color 1"
                                isSet={background.stripeColor1Set}
                                color={background.stripeColor1}
                                open={openPicker === "stripe1"}
                                onToggle={() => togglePicker("stripe1")}
                                onChange={(hex) => dispatch(setStripeColor1(hex))}
                            />
                            <ColorRow
                                label="Color 2"
                                isSet={background.stripeColor2Set}
                                color={background.stripeColor2}
                                open={openPicker === "stripe2"}
                                onToggle={() => togglePicker("stripe2")}
                                onChange={(hex) => dispatch(setStripeColor2(hex))}
                            />
                            <div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <label className="text-[11px] uppercase" style={LABEL_STYLE}>Width</label>
                                    <span className="text-[12px] tabular-nums" style={VALUE_STYLE}>{background.stripeWidth}</span>
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
                                <div className="relative rounded-[8px] overflow-hidden aspect-square">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={background.bgPhotoUrl} alt="background" className="w-full h-full object-cover" />
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
                                    <span className="text-[11px]" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", color: "#a6a6a6" }}>
                                        Upload photo
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Checkerboard */}
                    {background.mode === "checkerboard" && (
                        <div className="flex flex-col gap-3">
                            <ColorRow
                                label="Color 1"
                                isSet={background.checkerboardColor1Set}
                                color={background.checkerboardColor1}
                                open={openPicker === "checker1"}
                                onToggle={() => togglePicker("checker1")}
                                onChange={(hex) => dispatch(setCheckerboardColor1(hex))}
                            />
                            <ColorRow
                                label="Color 2"
                                isSet={background.checkerboardColor2Set}
                                color={background.checkerboardColor2}
                                open={openPicker === "checker2"}
                                onToggle={() => togglePicker("checker2")}
                                onChange={(hex) => dispatch(setCheckerboardColor2(hex))}
                            />
                            <div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <label className="text-[11px] uppercase" style={LABEL_STYLE}>Size</label>
                                    <span className="text-[12px] tabular-nums" style={VALUE_STYLE}>{background.checkerboardSize}</span>
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
                                    <label className="text-[11px] uppercase" style={LABEL_STYLE}>Grain</label>
                                    <span className="text-[12px] tabular-nums" style={VALUE_STYLE}>{background.noiseOpacity}</span>
                                </div>
                                <Slider min={0} max={100} step={1} value={[background.noiseOpacity]} onValueChange={(v) => dispatch(setNoiseOpacity(v[0]))} />
                            </div>
                        </div>
                    )}

                    {/* Gradient */}
                    {background.mode === "gradient" && (
                        <div className="flex flex-col gap-3">
                            <ColorRow
                                label="Color 1"
                                isSet={background.gradientColor1Set}
                                color={background.gradientColor1}
                                open={openPicker === "grad1"}
                                onToggle={() => togglePicker("grad1")}
                                onChange={(hex) => dispatch(setGradientColor1(hex))}
                            />
                            <ColorRow
                                label="Color 2"
                                isSet={background.gradientColor2Set}
                                color={background.gradientColor2}
                                open={openPicker === "grad2"}
                                onToggle={() => togglePicker("grad2")}
                                onChange={(hex) => dispatch(setGradientColor2(hex))}
                            />
                            <div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <label className="text-[11px] uppercase" style={LABEL_STYLE}>Angle</label>
                                    <span className="text-[12px] tabular-nums" style={VALUE_STYLE}>{background.gradientAngle}°</span>
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
                                label="Line Color"
                                isSet={background.gridColorSet}
                                color={background.gridColor}
                                open={openPicker === "grid"}
                                onToggle={() => togglePicker("grid")}
                                onChange={(hex) => dispatch(setGridColor(hex))}
                            />
                            <div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <label className="text-[11px] uppercase" style={LABEL_STYLE}>Size</label>
                                    <span className="text-[12px] tabular-nums" style={VALUE_STYLE}>{background.gridSize}</span>
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
                                label="Dot Color"
                                isSet={background.dotGridColorSet}
                                color={background.dotGridColor}
                                open={openPicker === "dotgrid"}
                                onToggle={() => togglePicker("dotgrid")}
                                onChange={(hex) => dispatch(setDotGridColor(hex))}
                            />
                            <div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <label className="text-[11px] uppercase" style={LABEL_STYLE}>Spacing</label>
                                    <span className="text-[12px] tabular-nums" style={VALUE_STYLE}>{background.dotGridSpacing}</span>
                                </div>
                                <Slider min={20} max={100} step={2} value={[background.dotGridSpacing]} onValueChange={(v) => dispatch(setDotGridSpacing(v[0]))} />
                            </div>
                            <div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <label className="text-[11px] uppercase" style={LABEL_STYLE}>Size</label>
                                    <span className="text-[12px] tabular-nums" style={VALUE_STYLE}>{background.dotGridRadius}</span>
                                </div>
                                <Slider min={1} max={20} step={1} value={[background.dotGridRadius]} onValueChange={(v) => dispatch(setDotGridRadius(v[0]))} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
