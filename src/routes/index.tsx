import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { clearPendingSlug, readPendingSlug } from "@/lib/reading-credit-token";

import { BearingNav } from "@/components/BearingNav";
import { Hero } from "@/components/Hero";
import { ConcernStrip } from "@/components/ConcernStrip";
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
  validateSearch: (search: Record<string, unknown>): { reading?: string | undefined } => ({
    reading: typeof search["reading"] === "string" ? search["reading"] : undefined,
  }),
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
  const { reading: readingParam } = Route.useSearch();
  const [inquiryOpen, setInquiryOpen] = useState(readingParam === "continue");
  const [inquirySlug, setInquirySlug] = useState("aristotle");
  const [inquiryKind, setInquiryKind] = useState("");
  const [selected, setSelected] = useState<Philosopher | null>(null);

  const start = (slug = "aristotle", kind = "") => {
    setInquirySlug(slug);
    setInquiryKind(kind);
    setInquiryOpen(true);
  };


  return (
    <div className="paper grain min-h-screen">
      <BearingNav onStart={() => start()} />
      <main className="relative">
        <Hero onStart={() => start()} onStartWithKind={(kind) => start("aristotle", kind)} />
        <ConcernStrip onPick={(kind) => start("aristotle", kind)} />
        <WhyPhilosophy />
        <Lyceum onSelect={setSelected} />
        <HowItWorks />
        <SampleReading />
        <Membership onStart={() => start()} />
      </main>
      <SiteFooter />

      <PhilosopherModal
        philosopher={selected}
        onClose={() => setSelected(null)}
        onStart={() => start(selected?.slug ?? "aristotle")}
      />
      <InquiryModal
        open={inquiryOpen}
        philosopherSlug={inquirySlug}
        initialKind={inquiryKind}
        onClose={() => setInquiryOpen(false)}
      />
    </div>
  );
}


