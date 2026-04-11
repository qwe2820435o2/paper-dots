interface DecorativeBlobProps {
  className?: string;
  color?: string;
  size?: number;
}

export default function DecorativeBlob({
  className = "",
  color = "#FFE4EF",
  size = 300,
}: DecorativeBlobProps) {
  return (
    <div
      className={`pointer-events-none rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
      aria-hidden="true"
    />
  );
}
