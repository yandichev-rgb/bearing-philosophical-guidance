import { createFileRoute, Link } from "@tanstack/react-router";

import { PageFrame, Sheet } from "@/components/PageFrame";
import { Reveal } from "@/components/Reveal";

const title = "Privacy · Bearing";
const description =
  "How Bearing handles the questions you write, the readings you save, and the account details you share.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PageFrame folio="Fol. IV · Privacy">
      <div className="shell max-w-3xl py-16 lg:py-24">
        <Reveal>
          <p className="label text-oxblood">Privacy</p>
          <h1 className="display-lg mt-6 text-ink">What we keep, and what we do not.</h1>
        </Reveal>

        <Reveal delay={0.08} className="mt-12">
          <Sheet>
            <div className="space-y-8 leading-relaxed text-ink-soft">
              <p className="drop-initial">
                The questions you write are yours. They are stored so you can return to your
                readings, and they are visible only to your own account. We do not sell them and we
                do not use them for advertising.
              </p>
              <p>
                An account keeps your inquiries, your readings, and your membership status. You can
                delete any inquiry or reading, and you can delete your account, which removes the
                writing attached to it.
              </p>
              <p>
                Readings are generated on our servers. Keys and philosopher profiles stay there and
                are never exposed to your browser. Payment details are handled by our payment
                provider and never reach Bearing directly.
              </p>
              <p>
                Bearing is a place to think. It is for reflection, not clinical, legal, medical, or
                financial advice.
              </p>
            </div>
            <p className="label mt-10 border-t border-ink/20 pt-6">
              <Link to="/" className="link-underline">
                Back to Bearing
              </Link>
            </p>
          </Sheet>
        </Reveal>
      </div>
    </PageFrame>
  );
}
