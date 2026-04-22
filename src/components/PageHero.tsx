import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-gradient-hero">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        {eyebrow && (
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary animate-fade-in">
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-up">
          {title.split("|").map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} className="text-gradient">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg animate-fade-up">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8 animate-fade-up">{children}</div>}
      </div>
    </section>
  );
}
