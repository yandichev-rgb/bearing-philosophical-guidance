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
  tension: string;
  method: string;
  grounding: string;
  challenge: string;
  limits: string;
  question: string;
  exercise: string;
  returnPrompt: string;
  /** Legacy columns kept in step with the new fields so saved history still renders. */
  assumption: string;
  principle: string;
  note: string;
};

export type ReadingResult = {
  reading: GeneratedReading;
  usage: { promptTokens: number; completionTokens: number };
};

const DISCLAIMER =
  "This reading applies one philosopher's method to what you described. It is one lens, not a complete answer, and it is for reflection rather than clinical, legal, medical, or financial advice.";

const FIELDS = [
  "headline",
  "noticed",
  "tension",
  "method",
  "grounding",
  "challenge",
  "limits",
  "question",
  "exercise",
  "returnPrompt",
] as const;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: FIELDS,
  properties: {
    headline: {
      type: "string",
      description: "One short statement about the reader's own situation, addressed to them.",
    },
    noticed: {
      type: "string",
      description: "What stands out: a direct observation about what the reader described.",
    },
    tension: {
      type: "string",
      description: "The tension underneath: the conflict between two things they want or rely on.",
    },
    method: {
      type: "string",
      description:
        "The philosopher's method: how this method proceeds here and what it treats as the real problem.",
    },
    grounding: {
      type: "string",
      description:
        "Textual grounding: the work and section the ideas come from, marking paraphrase as paraphrase.",
    },
    challenge: {
      type: "string",
      description: "The challenge: a test of the reader's own framing of the situation.",
    },
    limits: {
      type: "string",
      description: "What this lens may miss: honest limits of this approach on this situation.",
    },
    question: {
      type: "string",
      description: "One better question than the one they arrived with.",
    },
    exercise: {
      type: "string",
      description: "One real-world experiment: a specific observable action with a timeframe.",
    },
    returnPrompt: {
      type: "string",
      description: "Return prompt: when to come back and exactly what to report.",
    },
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

  const parsed = JSON.parse(content) as Record<(typeof FIELDS)[number], string>;

  return {
    usage: {
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0,
    },
    reading: {
      philosopherSlug: slug,
      headline: parsed.headline || "Your situation already points to something you can test.",
      noticed: parsed.noticed,
      tension: parsed.tension,
      method: parsed.method,
      grounding: parsed.grounding,
      challenge: parsed.challenge,
      limits: parsed.limits,
      question: parsed.question,
      exercise: parsed.exercise,
      returnPrompt: parsed.returnPrompt,
      // Legacy columns, written so older views and follow up context keep working.
      assumption: parsed.tension,
      principle: parsed.method,
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
- Answer only what they asked. Do not restate the reading and do not repeat its sections.
- Two or three short paragraphs at most. Plain prose, no headings, no lists, no markdown.
- Speak directly to the reader as "you". Never write in the philosopher's first person and never write "Aristotle would say" or similar framing.
- Stay inside the same philosophical method. If the question falls outside what that method can address, say so plainly and give what the method can offer.
- Where it helps, adjust or replace the experiment with one concrete revised step.
- Cite a work and section only when you are sure of it, and mark paraphrase as paraphrase. Never invent a quotation.
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
    tension?: string | null;
    method?: string | null;
    challenge?: string | null;
    limits?: string | null;
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
    `The tension underneath: ${input.reading.tension || input.reading.assumption}`,
    `The method applied: ${input.reading.method || input.reading.principle}`,
    `The challenge put to them: ${input.reading.challenge || "Not recorded."}`,
    `What the lens may miss: ${input.reading.limits || "Not recorded."}`,
    `The experiment: ${input.reading.exercise}`,

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
