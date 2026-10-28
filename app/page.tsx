import { Catalogue } from "@/components/Catalogue";
import { HarvestChart } from "@/components/HarvestChart";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { StatStrip } from "@/components/StatStrip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatStrip />
      <div className="container-farm pt-16">
        <HarvestChart />
      </div>
      <Catalogue />
      <HowItWorks />
    </>
  );
}
