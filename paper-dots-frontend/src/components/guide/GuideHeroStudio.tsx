import { buildPolkaDotSvgString, type PolkaDotConfig } from "@/lib/polkaDotGrid";
import { cn } from "@/lib/utils";

const PREVIEW_CONFIG: PolkaDotConfig = {
    arrangement: "square",
    dotSize: 18,
    spacing: 64,
    dotColor: "#15200d",
    backgroundColor: "#c5e89a",
    opacity: 100,
    rotation: 0,
    skewX: 0,
    skewY: 0,
    zoom: 1,
    iconUrl: null,
    iconAspect: 1,
};

const PREVIEW_SIZE = 640;

const DOT_UNITS = ["●", "◼", "★", "♥", "✿", "🍋", "Aa", "⬆"];

const THEME_SWATCHES = [
    { color: "#c5e89a", active: true },
    { color: "#e7e3d8", active: false },
    { color: "#ffd9c2", active: false },
    { color: "#ffffff", active: false },
    { color: "#15200d", active: false },
];

/** Decorative, non-interactive stand-in for the mockup's live pattern generator (see
 *  docs/guide-pages.md risk #3). The dot grid is real — built server-side with the same pure
 *  SVG function the editor's PNG export uses — but the sliders/chips/swatches below it are
 *  static art, not wired to state. That is deliberate: reading the editor's live Redux state
 *  here would let this marketing page reflect whatever a visitor last left in the actual
 *  /create/polka-dot editor, which has nothing to do with what this page is showing. */
export default function GuideHeroStudio() {
    const svg = buildPolkaDotSvgString(PREVIEW_CONFIG, PREVIEW_SIZE, PREVIEW_SIZE);
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    return (
        <div
            aria-hidden
            className="overflow-hidden rounded-guide border border-guide-edge bg-guide-card shadow-guide-lg"
        >
            <div className="flex items-center gap-2.5 border-b border-guide-edge bg-guide-lime-3 px-4.5 py-3">
                <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-guide-ink/[0.16]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-guide-ink/[0.16]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-guide-ink/[0.16]" />
                </div>
                <span className="guide-mono text-xs tracking-wide text-guide-ink-2">untitled-pattern.svg</span>
                <span className="guide-mono ml-auto flex items-center gap-1.5 text-[11px] text-guide-mute">
                    <span className="h-[7px] w-[7px] animate-[guide-live-blink_2.4s_infinite] rounded-full bg-[#5fc25f]" />
                    live preview
                </span>
            </div>

            <div
                className="h-[322px] bg-cover bg-center"
                style={{ backgroundImage: `url("${svgDataUrl}")` }}
            />

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-guide-edge p-5">
                <StudioSlider label="Dot size" value="18" percent={37} />
                <StudioSlider label="Spacing" value="64" percent={40} />
                <StudioSlider label="Tilt" value="0°" percent={50} />
                <StudioSlider label="Opacity" value="100%" percent={100} />

                <div className="col-span-2">
                    <div className="guide-mono mb-2 text-[11px] uppercase tracking-[0.12em] text-guide-mute">
                        Dot unit
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {DOT_UNITS.map((glyph, i) => (
                            <span
                                key={glyph}
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-[11px] border text-base font-bold text-guide-ink",
                                    i === 0 ? "border-guide-edge-strong bg-guide-lime" : "border-guide-edge bg-white",
                                )}
                            >
                                {glyph}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="guide-mono mb-2 text-[11px] uppercase tracking-[0.12em] text-guide-mute">
                        Theme
                    </div>
                    <div className="flex gap-1.5">
                        {THEME_SWATCHES.map((theme) => (
                            <span
                                key={theme.color}
                                style={{ background: theme.color }}
                                className={cn(
                                    "h-9 w-9 rounded-[11px] border",
                                    theme.active
                                        ? "border-guide-ink shadow-[0_0_0_3px_var(--color-guide-lime-3)]"
                                        : "border-guide-edge",
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StudioSlider({ label, value, percent }: { label: string; value: string; percent: number }) {
    return (
        <div>
            <div className="guide-mono mb-1.5 flex justify-between text-[11px] uppercase tracking-[0.12em] text-guide-mute">
                <span>{label}</span>
                <span className="text-guide-ink">{value}</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-guide-lime-2">
                <span
                    className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-guide-ink bg-guide-lime"
                    style={{ left: `${percent}%` }}
                />
            </div>
        </div>
    );
}
