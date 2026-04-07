import { Film } from "lucide-react";

interface SketchLoaderProps {
  message: string;
  compact?: boolean;
}

export default function SketchLoader({ message, compact }: SketchLoaderProps) {
  return (
    <div
      className={`sketch-border bg-background flex flex-col items-center ${
        compact ? "gap-2 px-6 py-4" : "gap-3 px-8 py-6"
      }`}
      style={{ animation: "fadeIn 0.3s ease forwards" }}
    >
      <div style={{ animation: "filmSpin 3s linear infinite" }}>
        <Film className={compact ? "w-6 h-6" : "w-8 h-8"} />
      </div>
      <p
        className={`font-serif font-medium text-foreground ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {message}
      </p>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-foreground"
            style={{
              animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
