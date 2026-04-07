"use client";

import { Shuffle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setDotShape,
    setDotDensity,
    setDotSize,
    setDotColor,
    rerollSeed,
    type DotShape,
} from "@/store/slices/decorateSlice";
import { DOT_COLORS, DOT_SHAPES } from "@/lib/dotShapes";
import { cn } from "@/lib/utils";

export default function DotControls() {
    const dispatch = useAppDispatch();
    const dotConfig = useAppSelector((s) => s.decorate.dotConfig);

    return (
        <div className="sketch-border bg-white p-4 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg">Dots</h3>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => dispatch(rerollSeed())}
                >
                    <Shuffle className="w-4 h-4" />
                    Reroll
                </Button>
            </div>

            {/* Shape */}
            <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Shape</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {DOT_SHAPES.map((s) => (
                        <button
                            key={s.value}
                            type="button"
                            onClick={() => dispatch(setDotShape(s.value as DotShape))}
                            className={cn(
                                "h-9 border-2 text-sm font-serif transition-all",
                                dotConfig.shape === s.value
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-foreground/20 hover:border-foreground/60",
                            )}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Density */}
            <div>
                <div className="flex items-baseline justify-between">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Density
                    </label>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {Math.round(dotConfig.density * 100)}%
                    </span>
                </div>
                <Slider
                    className="mt-2"
                    min={10}
                    max={100}
                    step={1}
                    value={[Math.round(dotConfig.density * 100)]}
                    onValueChange={(v) => dispatch(setDotDensity(v[0] / 100))}
                />
            </div>

            {/* Size */}
            <div>
                <div className="flex items-baseline justify-between">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Size
                    </label>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {dotConfig.size}px
                    </span>
                </div>
                <Slider
                    className="mt-2"
                    min={4}
                    max={48}
                    step={1}
                    value={[dotConfig.size]}
                    onValueChange={(v) => dispatch(setDotSize(v[0]))}
                />
            </div>

            {/* Color */}
            <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Color</label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                    {DOT_COLORS.map((c) => (
                        <button
                            key={c.value}
                            type="button"
                            onClick={() => dispatch(setDotColor(c.value))}
                            aria-label={c.label}
                            className={cn(
                                "aspect-square rounded-full border-2 transition-all",
                                dotConfig.color === c.value
                                    ? "border-foreground scale-110 shadow-[2px_2px_0_#1a1a1a]"
                                    : "border-foreground/20 hover:border-foreground/60",
                            )}
                            style={{ backgroundColor: c.value }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
