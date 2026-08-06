/** Small flat pattern thumbnails for the tool grid cards, ported from the mockup's
 *  `unit()`/`patSVG()`/`quoteThumb()` script functions into plain server-rendered JSX — no
 *  client-side DOM patching needed since every card's config is static. */

interface PatternThumbConfig {
    kind: "pattern";
    shape: "heart" | "circle" | "tri";
    size: number;
    gap: number;
    tilt: number;
    bg: string;
    dot: string;
    opacity?: number;
}

interface QuoteThumbConfig {
    kind: "quote";
    photo: string;
    block: string;
    text: string;
}

export type ToolThumbConfig = PatternThumbConfig | QuoteThumbConfig;

const HEART_PATH = "M12 21.3S3.6 15.9 3.6 10.3A4.7 4.7 0 0 1 12 7.2a4.7 4.7 0 0 1 8.4 3.1c0 5.6-8.4 11-8.4 11Z";

function ShapeUnit({ cx, cy, config }: { cx: number; cy: number; config: PatternThumbConfig }) {
    const { shape, size, dot, opacity = 1 } = config;
    if (shape === "circle") {
        return <circle cx={cx} cy={cy} r={size / 2} fill={dot} opacity={opacity} />;
    }
    if (shape === "heart") {
        const k = size / 22;
        return (
            <path
                d={HEART_PATH}
                fill={dot}
                opacity={opacity}
                transform={`translate(${cx} ${cy}) scale(${k}) translate(-12 -12)`}
            />
        );
    }
    const h = size * 0.9;
    return (
        <path
            d={`M${cx} ${cy - h / 2} L${cx + size / 2} ${cy + h / 2} L${cx - size / 2} ${cy + h / 2}Z`}
            fill={dot}
            opacity={opacity}
        />
    );
}

export default function HomeToolThumb({ id, config }: { id: string; config: ToolThumbConfig }) {
    if (config.kind === "quote") {
        return (
            <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid slice"
                viewBox="0 0 200 130"
                aria-hidden
            >
                <rect width="200" height="130" fill={config.photo} />
                <rect x="16" y="74" width="168" height="44" rx="8" fill={config.block} />
                <rect x="28" y="88" width="104" height="7" rx="3.5" fill={config.text} />
                <rect x="28" y="102" width="72" height="7" rx="3.5" fill={config.text} opacity={0.7} />
            </svg>
        );
    }

    const t = config.gap;
    const patternId = `tool-thumb-${id}`;

    return (
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <defs>
                <pattern
                    id={patternId}
                    width={t}
                    height={t}
                    patternUnits="userSpaceOnUse"
                    patternTransform={`rotate(${config.tilt})`}
                >
                    <ShapeUnit cx={t * 0.25} cy={t * 0.25} config={config} />
                    <ShapeUnit cx={t * 0.75} cy={t * 0.75} config={config} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={config.bg} />
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
    );
}
