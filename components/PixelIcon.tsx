import Image from "next/image";

export type IconName = "wallet" | "pitchfork" | "flame" | "sol" | "clock" | "barn";

export function PixelIcon({
  name,
  size = 24,
  className = "",
  alt = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      src={`/icons/${name}.png`}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={`pixelated inline-block shrink-0 ${className}`}
    />
  );
}
