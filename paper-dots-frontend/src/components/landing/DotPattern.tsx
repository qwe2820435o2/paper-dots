interface DotPatternProps {
  className?: string;
  color?: string;
  dotSize?: number;
  spacing?: number;
}

export default function DotPattern({
  className = "",
  color = "#B8DB80",
  dotSize = 3,
  spacing = 16,
}: DotPatternProps) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`dot-${color.replace("#", "")}`}
          x="0"
          y="0"
          width={spacing}
          height={spacing}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={spacing / 2} cy={spacing / 2} r={dotSize / 2} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#dot-${color.replace("#", "")})`} />
    </svg>
  );
}
