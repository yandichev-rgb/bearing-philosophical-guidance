import { buildSystemPrompt, type ProfileSlug } from "./philosopher-profiles.server";

export type ReadingAnswers = {
  situation: string;
  tried: string;
  stakes: string;
};

export type GeneratedReading = {
  philosopherSlug: ProfileSlug;
  headline: string;
  noticed: string;
  assumption: string;
  principle: string;
  exercise: string;
  question: string;
  note: string;
};

const DISCLAIMER =
  "This reading interprets your situation through one philosopher's ideas. It is for reflection, not clinical, legal, medical, or financial advice.";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "noticed", "assumption", "principle", "exercise", "question"],
  properties: {
    headline: {
      type: "string",
      description: "One short statement about the reader's own situation, addressed to them.",
    },
    noticed: {
      type: "string",
      description: "What stands out: a direct observation about what the reader described.",
    },
    assumption: {
      type: "string",
      description:
        "The question: one clear personal question to the reader that exposes the central tension.",
    },
    principle: { type: "string", description: "The principle: the relevant idea in plain language, and why it applies here." },
    exercise: { type: "string", description: "The practice: one specific action or exercise to try." },
    question: { type: "string", description: "Sit with this: one short question worth continuing to consider." },
  },
} as const;

/** Generates a structured reading through the Lovable AI Gateway. Server only. */
export async function generateReadingWithAI(
  slug: ProfileSlug,
  answers: ReadingAnswers,
): Promise<GeneratedReading> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Reading service is not configured.");

  const userContent = [
    `Situation: ${answers.situation}`,
    `What they have tried: ${answers.tried || "Not stated."}`,
    `What feels at stake: ${answers.stakes || "Not stated."}`,
  ].join("\n\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: buildSystemPrompt(slug) },
        { role: "user", content: userContent },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "reading", strict: true, schema: SCHEMA },
      },
    }),
  });

  if (response.status === 429) throw new Error("The Lyceum is busy. Try again in a moment.");
  if (!response.ok) {
    console.error("AI gateway error", response.status, await response.text());
    throw new Error("The reading could not be prepared right now.");
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("The reading came back empty.");

  const parsed = JSON.parse(content) as Omit<GeneratedReading, "philosopherSlug" | "note">;

  return {
    philosopherSlug: slug,
    headline: parsed.headline || "Your situation already points to something you can practice.",
    noticed: parsed.noticed,
    assumption: parsed.assumption,
    principle: parsed.principle,
    exercise: parsed.exercise,
    question: parsed.question,
    note: DISCLAIMER,
  };
}
