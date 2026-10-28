"use client";

import { useEffect, useState } from "react";

export function DocsNav({ sections }: { sections: { id: string; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -60% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  const link = (s: { id: string; title: string }, i: number, mobile: boolean) => {
    const on = active === s.id;
    return (
      <a
        href={`#${s.id}`}
        aria-current={on ? "location" : undefined}
        onClick={() => setActive(s.id)}
        className={
          mobile
            ? `block whitespace-nowrap border-2 px-3 py-2 text-xs ${on ? "border-neon text-neon" : "border-line text-muted"}`
            : `flex items-baseline gap-3 border-l-2 py-2 pl-4 text-sm transition-colors hover:text-ink ${
                on ? "border-neon text-neon" : "border-line text-muted"
              }`
        }
      >
        {!mobile && <span className="font-pixel text-[9px] text-line">{String(i + 1).padStart(2, "0")}</span>}
        {s.title}
      </a>
    );
  };

  return (
    <>
      {/* Mobile: sticky chip bar under the header; scrolls inside itself, not the page */}
      <nav aria-label="Docs sections" className="sticky top-16 z-30 -mx-4 border-b-2 border-line bg-bg/95 px-4 py-3 sm:-mx-6 sm:px-6 backdrop-blur-sm lg:hidden">
        <ul className="flex gap-2 overflow-x-auto">
          {sections.map((s, i) => (
            <li key={s.id}>{link(s, i, true)}</li>
          ))}
        </ul>
      </nav>

      {/* Desktop: sticky sidebar */}
      <nav aria-label="Docs sections" className="sticky top-24 hidden self-start lg:block">
        <p className="eyebrow mb-4">On this page</p>
        <ul>
          {sections.map((s, i) => (
            <li key={s.id}>{link(s, i, false)}</li>
          ))}
        </ul>
      </nav>
    </>
  );
}
