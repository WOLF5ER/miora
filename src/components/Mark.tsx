export default function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 6 C 34 14, 34 26, 24 42 C 14 26, 14 14, 24 6 Z" stroke="var(--accent)" strokeWidth="1.4" />
      <path d="M8 24 C 16 16, 32 16, 40 24 C 32 20, 16 20, 8 24 Z" stroke="var(--accent)" strokeWidth="1.4" />
    </svg>
  );
}
