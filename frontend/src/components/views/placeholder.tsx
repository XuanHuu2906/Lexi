export interface PlaceholderProps {
  title: string;
  subtitle?: string;
  phase: string;
  maxWidth?: number;
}

/** Temporary view scaffold — replaced by the real view in later phases. */
export function Placeholder({
  title,
  subtitle,
  phase,
  maxWidth = 1080,
}: PlaceholderProps) {
  return (
    <div className="animate-lx-rise mx-auto" style={{ maxWidth }}>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-0.5 font-semibold text-ink-500">{subtitle}</p>
      )}
      <div className="mt-6 rounded-3xl border border-dashed border-[var(--border-default)] bg-white p-12 text-center">
        <div className="font-extrabold text-ink-400">Coming in {phase}</div>
      </div>
    </div>
  );
}
