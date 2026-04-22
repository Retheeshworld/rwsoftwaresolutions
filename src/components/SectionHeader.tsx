interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

export function SectionHeader({ eyebrow, title, subtitle, center = true }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${center ? "mx-auto max-w-3xl text-center" : ""}`}>
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {title.split("|").map((part, i) =>
          i % 2 === 1 ? (
            <span key={i} className="text-gradient">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </h2>
      {subtitle && <p className="mt-4 text-base text-muted-foreground sm:text-lg">{subtitle}</p>}
    </div>
  );
}
