"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function hsvToHex(h: number, s: number, v: number): string {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }
    const hex = (n: number) =>
        Math.round((n + m) * 255).toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d + 6) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h = Math.round(h * 60);
    }
    return { h, s: max === 0 ? 0 : d / max, v: max };
}

interface Props {
    color: string;
    onChange: (hex: string) => void;
}

export default function ColorPicker({ color, onChange }: Props) {
    const gradientRef = useRef<HTMLDivElement>(null);
    const [hue, setHue] = useState(180);
    const [pos, setPos] = useState({ x: 0.15, y: 0.2 });

    useEffect(() => {
        if (/^#[0-9a-f]{6}$/i.test(color)) {
            const { h, s, v } = hexToHsv(color);
            // Only restore position for custom colors with meaningful saturation/value.
            // Preset colors (near-black, near-white) keep the bright default position.
            if (s > 0.1 && v > 0.2) {
                setHue(h);
                setPos({ x: s, y: 1 - v });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const emit = useCallback(
        (h: number, x: number, y: number) => {
            onChange(hsvToHex(h, x, 1 - y));
        },
        [onChange],
    );

    const readGradientPos = useCallback(
        (clientX: number, clientY: number, newHue?: number) => {
            const el = gradientRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
            setPos({ x, y });
            emit(newHue ?? hue, x, y);
        },
        [hue, emit],
    );

    const handleGradientDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            readGradientPos(e.clientX, e.clientY);
        },
        [readGradientPos],
    );

    const handleGradientMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (e.buttons !== 1) return;
            readGradientPos(e.clientX, e.clientY);
        },
        [readGradientPos],
    );

    const handleHue = useCallback(
        (h: number) => {
            setHue(h);
            emit(h, pos.x, pos.y);
        },
        [pos, emit],
    );

    const pureHue = `hsl(${hue},100%,50%)`;
    const preview = hsvToHex(hue, pos.x, 1 - pos.y);

    return (
        <div className="flex flex-col gap-3">
            {/* 2D gradient */}
            <div
                ref={gradientRef}
                className="relative w-full rounded-[8px] overflow-hidden"
                style={{ height: 140, cursor: "crosshair" }}
                onPointerDown={handleGradientDown}
                onPointerMove={handleGradientMove}
            >
                <div className="absolute inset-0" style={{ background: pureHue }} />
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to right, #fff, transparent)" }}
                />
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent, #000)" }}
                />
                <div
                    className="absolute w-[14px] h-[14px] rounded-full pointer-events-none"
                    style={{
                        left: `${pos.x * 100}%`,
                        top: `${pos.y * 100}%`,
                        transform: "translate(-50%, -50%)",
                        border: "2px solid #fff",
                        boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
                    }}
                />
            </div>

            {/* Preview + hue slider */}
            <div className="flex items-center gap-3">
                <div
                    className="shrink-0 w-7 h-7 rounded-full"
                    style={{
                        backgroundColor: preview,
                        boxShadow: "rgba(255,255,255,0.15) 0px 0px 0px 1px",
                    }}
                />
                <div
                    className="relative flex-1 h-[14px] rounded-full overflow-hidden"
                    style={{
                        background:
                            "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)",
                    }}
                >
                    <input
                        type="range"
                        min={0}
                        max={360}
                        step={1}
                        value={hue}
                        onChange={(e) => handleHue(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                        className="absolute top-1/2 w-[14px] h-[14px] rounded-full pointer-events-none"
                        style={{
                            left: `${(hue / 360) * 100}%`,
                            transform: "translate(-50%, -50%)",
                            backgroundColor: pureHue,
                            border: "2px solid #fff",
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
