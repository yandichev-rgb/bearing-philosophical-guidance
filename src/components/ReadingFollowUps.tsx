import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { askFollowUp, listFollowUps } from "@/lib/readings.functions";
import { FOLLOWUPS_PER_READING } from "@/config/membership";

type FollowUp = { id: string; question: string; answer: string; created_at: string };

/**
 * Further questions on a saved reading. Marginalia, not chat: each entry is the
 * question in display italics with the reply set beneath it in body serif.
 */
export function ReadingFollowUps({
  readingId,
  isMember,
}: {
  readingId: string;
  /** When false the prompt is shown closed, pointing to membership. */
  isMember: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const fetchFollowUps = useServerFn(listFollowUps);
  const ask = useServerFn(askFollowUp);

  const { data } = useQuery({
    queryKey: ["follow-ups", readingId],
    queryFn: () => fetchFollowUps({ data: { readingId } }),
    enabled: isMember,
  });

  const followUps = (data?.followUps ?? []) as FollowUp[];
  const remaining = FOLLOWUPS_PER_READING - followUps.length;

  const mutation = useMutation({
    mutationFn: (asked: string) => ask({ data: { readingId, question: asked } }),
    onSuccess: (result) => {
      if (result && "needsMembership" in result) {
        setError("Membership is needed to ask further questions.");
        return;
      }
      if (result && "limitReached" in result) {
        setError("You have used the further questions on this reading.");
        return;
      }
      setQuestion("");
      void queryClient.invalidateQueries({ queryKey: ["follow-ups", readingId] });
    },
    onError: (caught) => {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : "Your question could not be answered right now.",
      );
    },
  });

  const submit = () => {
    const asked = question.trim();
    if (asked.length < 3 || mutation.isPending) return;
    setError(null);
    mutation.mutate(asked);
  };

  return (
    <section className="mt-10 border-t border-ink/20 pt-8">
      <p className="label text-oxblood">Further questions</p>

      {followUps.length > 0 ? (
        <ol className="mt-6 space-y-8">
          {followUps.map((entry) => (
            <li key={entry.id} className="border-l-2 border-oxblood/60 pl-5">
              <p
                className="text-lg italic leading-snug text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {entry.question}
              </p>
              <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">
                {entry.answer.split(/\n{2,}/).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      {!isMember ? (
        <p className="mt-5 leading-relaxed text-ink-soft">
          Members may ask up to {FOLLOWUPS_PER_READING} further questions on a reading, answered
          through the same method.{" "}
          <Link to="/membership" className="link-underline">
            Join the Lyceum
          </Link>
        </p>
      ) : remaining <= 0 ? (
        <p className="mt-5 leading-relaxed text-ink-soft">
          You have used the further questions on this reading. Bring a fresh inquiry when the
          situation has moved.
        </p>
      ) : (
        <div className="mt-5">
          <p className="leading-relaxed text-ink-soft">
            Ask a further question about this reading. {remaining} of {FOLLOWUPS_PER_READING}{" "}
            remaining.
          </p>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="What if the practice is not possible this week?"
            className="mt-4 w-full resize-none border border-ink/25 bg-papyrus-light/60 p-4 leading-relaxed text-ink outline-none focus:border-oxblood"
          />
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <button
              type="button"
              className="btn-ink"
              onClick={submit}
              disabled={mutation.isPending || question.trim().length < 3}
            >
              {mutation.isPending ? "Considering" : "Ask"}
            </button>
            {mutation.isPending ? (
              <span className="label text-ink-soft" role="status">
                Working through your question.
              </span>
            ) : null}
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-5 text-sm text-oxblood" role="status">
          {error}
        </p>
      ) : null}
    </section>
  );
}
