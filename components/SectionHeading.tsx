import type { ReactNode } from "react";

export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
  as: H = "h2",
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow && (
        <p className="eyebrow mb-3 flex items-center gap-2 text-neon">
          <span aria-hidden className="inline-block h-2 w-2 bg-neon" />
          {eyebrow}
        </p>
      )}
      <H id={id} className={H === "h1" ? "text-xl sm:text-2xl" : "text-base sm:text-xl"}>
        {title}
      </H>
      {children && <div className="mt-4 text-sm leading-relaxed text-muted">{children}</div>}
    </div>
  );
}
