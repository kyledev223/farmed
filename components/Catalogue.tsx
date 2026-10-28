import Link from "next/link";
import { CATALOGUE } from "@/lib/mock";
import { FarmCard } from "./FarmCard";
import { SectionHeading } from "./SectionHeading";

export function Catalogue() {
  return (
    <section aria-labelledby="catalogue" className="container-farm py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading id="catalogue" eyebrow="Catalogue" title="Pick your poison. Actually, you can't.">
          12 farms across 4 series and 3 sizes. Every mint is random, and rarer livestock harvest harder.
        </SectionHeading>
        <Link href="/stats" className="mb-8 font-pixel text-[10px] uppercase text-muted underline decoration-dashed underline-offset-4 hover:text-neon">
          Full odds table →
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {CATALOGUE.map((f) => (
          <li key={f.id}>
            <FarmCard spec={f} />
          </li>
        ))}
      </ul>
    </section>
  );
}
