import { buildSystemPrompt, type ProfileSlug } from "./philosopher-profiles.server";

export type ReadingAnswers = {
  situation: string;
  tried: string;
  stakes: string;
  kind?: string;
  duration?: string;
};

export const READING_MODEL = "google/gemini-2.5-flash";

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

export type ReadingResult = {
  reading: GeneratedReading;
  usage: { promptTokens: number; completionTokens: number };
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
): Promise<ReadingResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Reading service is not configured.");

  const userContent = [
    `Situation: ${answers.situation}`,
    `What they have tried: ${answers.tried || "Not stated."}`,
    `What feels at stake: ${answers.stakes || "Not stated."}`,
    `What kind of matter this is: ${answers.kind || "Not stated."}`,
    `How long it has been present: ${answers.duration || "Not stated."}`,
    `Use these signals to choose the emphasis. Treat a repeating pattern as a formed habit, a relationship as something between two people, a decision as a judgment to test, and a fear as something to confront. If the reader named a good outcome, use it as the measure the reading tests against.`,
  ].join("\n\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: READING_MODEL,
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
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("The reading came back empty.");

  const parsed = JSON.parse(content) as Omit<GeneratedReading, "philosopherSlug" | "note">;

  return {
    usage: {
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0,
    },
    reading: {
      philosopherSlug: slug,
      headline: parsed.headline || "Your situation already points to something you can practice.",
      noticed: parsed.noticed,
      assumption: parsed.assumption,
      principle: parsed.principle,
      exercise: parsed.exercise,
      question: parsed.question,
      note: DISCLAIMER,
    },
  };
}

export type FollowUpResult = {
  answer: string;
  usage: { promptTokens: number; completionTokens: number };
};

const FOLLOW_UP_RULES = `
The reader has already received a full reading and is now asking one further question about it.

Rules for this reply:
- Answer only what they asked. Do not restate the reading and do not repeat its five sections.
- Two or three short paragraphs at most. Plain prose, no headings, no lists, no markdown.
- Speak directly to the reader as "you". Never write in the philosopher's first person and never write "Aristotle would say" or similar framing.
- Stay inside the same philosophical method. If the question falls outside what that method can address, say so plainly and give what the method can offer.
- Where it helps, adjust or replace the practice with one concrete revised step.
- Do not use em dashes. No flattery, no motivational language, no promises about outcomes.
- No medical, legal, financial, or clinical advice.
`;

/** Answers one follow up question about an existing reading. Server only. */
export async function generateFollowUpWithAI(input: {
  slug: ProfileSlug;
  answers: ReadingAnswers;
  reading: {
    headline: string;
    noticed: string;
    assumption: string;
    principle: string;
    exercise: string;
    question: string;
  };
  history: { question: string; answer: string }[];
  question: string;
}): Promise<FollowUpResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Reading service is not configured.");

  const context = [
    `The situation they brought: ${input.answers.situation}`,
    `What they had tried: ${input.answers.tried || "Not stated."}`,
    `What felt at stake: ${input.answers.stakes || "Not stated."}`,
    `The reading they received:`,
    `Headline: ${input.reading.headline}`,
    `What stands out: ${input.reading.noticed}`,
    `The question: ${input.reading.assumption}`,
    `The principle: ${input.reading.principle}`,
    `The practice: ${input.reading.exercise}`,
    `Sit with this: ${input.reading.question}`,
  ].join("\n");

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: `${buildSystemPrompt(input.slug)}\n${FOLLOW_UP_RULES}` },
    { role: "user", content: context },
  ];
  for (const turn of input.history) {
    messages.push({ role: "user", content: turn.question });
    messages.push({ role: "assistant", content: turn.answer });
  }
  messages.push({ role: "user", content: input.question });

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: READING_MODEL, messages }),
  });

  if (response.status === 429) throw new Error("The Lyceum is busy. Try again in a moment.");
  if (!response.ok) {
    console.error("AI gateway error", response.status, await response.text());
    throw new Error("Your question could not be answered right now.");
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const answer = payload.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("The reply came back empty.");

  return {
    answer,
    usage: {
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0,
    },
  };
}
