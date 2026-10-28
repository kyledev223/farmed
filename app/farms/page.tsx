import type { Metadata } from "next";
import { MyFarmsView } from "@/components/MyFarmsView";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = { title: "My Farms" };

export default function FarmsPage() {
  return (
    <div className="container-farm py-14">
      <SectionHeading as="h1" eyebrow="Your barn" title="My Farms">
        Every farm you own, what it yields, and how much SOL it has dragged out of the trenches for you.
      </SectionHeading>
      <MyFarmsView />
    </div>
  );
}
