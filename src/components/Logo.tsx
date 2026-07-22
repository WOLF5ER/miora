import BrandIcon from "./BrandIcon";

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <BrandIcon size={size} />
      <span className="font-serif text-[19px] leading-none text-ink">Miora</span>
    </span>
  );
}
