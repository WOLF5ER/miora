export default function PortfolioTile({
  hue,
  caption,
  aspect = "aspect-square",
  imageUrl,
}: {
  hue: number;
  caption?: string;
  aspect?: string;
  imageUrl?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${aspect}`}
      style={
        imageUrl
          ? undefined
          : {
              background: `linear-gradient(155deg, hsl(${hue} 32% 88%), hsl(${hue + 18} 26% 74%) 55%, hsl(${hue - 12} 30% 60%))`,
            }
      }
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={caption ?? ""} className="h-full w-full object-cover" />
      ) : (
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at 30% 20%, hsl(${hue} 40% 96%), transparent 60%)`,
          }}
        />
      )}
      {caption ? (
        <span className="absolute bottom-2 left-2 right-2 truncate text-[10.5px] font-medium text-white/90 drop-shadow-sm">
          {caption}
        </span>
      ) : null}
    </div>
  );
}
