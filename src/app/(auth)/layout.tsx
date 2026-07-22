import Link from "next/link";
import BrandIcon from "@/components/BrandIcon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <BrandIcon size={28} />
        <span className="font-serif text-[22px] text-ink">Miora</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
