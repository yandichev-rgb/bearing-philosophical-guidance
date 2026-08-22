import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { BearingNav } from "@/components/BearingNav";
import { Hero } from "@/components/Hero";
import { Meander } from "@/components/Meander";
import { WhyPhilosophy } from "@/components/WhyPhilosophy";
import { Lyceum } from "@/components/Lyceum";
import { PhilosopherModal } from "@/components/PhilosopherModal";
import { HowItWorks } from "@/components/HowItWorks";
import { SampleReading } from "@/components/SampleReading";
import { Membership } from "@/components/Membership";
import { InquiryModal } from "@/components/InquiryModal";
import { SiteFooter } from "@/components/SiteFooter";
import type { Philosopher } from "@/data/philosophers";

const title = "Bearing: Philosophy for real life";
const description =
  "Bring a real question. See it through the ideas of Aristotle, Socrates, the Stoics, and more.";
const ogImage = "https://id-preview--2152f947-ebb4-420b-b320-bed4b66c773e.lovable.app/og-bearing.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: ogImage },
    ],
  }),
  component: Home,
});

function Home() {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [selected, setSelected] = useState<Philosopher | null>(null);

  return (
    <div className="paper grain min-h-screen">
      <BearingNav onStart={() => setInquiryOpen(true)} />
      <main className="relative">
        <Hero onStart={() => setInquiryOpen(true)} />
        <Meander />
        <WhyPhilosophy />
        <Lyceum onSelect={setSelected} />
        <HowItWorks />
        <SampleReading />
        <Membership onStart={() => setInquiryOpen(true)} />
      </main>
      <SiteFooter />

      <PhilosopherModal
        philosopher={selected}
        onClose={() => setSelected(null)}
        onStart={() => setInquiryOpen(true)}
      />
      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
