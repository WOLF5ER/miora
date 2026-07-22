export default function StatTile({
  label,
  value,
  delta,
  children,
}: {
  label: string;
  value: string;
  delta?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="text-[12px] text-ink-faint">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-serif text-[22px] text-ink">{value}</span>
        {delta ? (
          <span className="text-[11.5px]" style={{ color: "var(--accent)" }}>
            {delta}
          </span>
        ) : null}
      </div>
      {children ? <div className="mt-2.5">{children}</div> : null}
    </div>
  );
}
