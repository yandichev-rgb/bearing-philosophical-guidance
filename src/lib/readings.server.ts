import { buildSystemPrompt, type ProfileSlug } from "./philosopher-profiles.server";

export type Clarification = { question: string; answer: string };

export type ReadingAnswers = {
  situation: string;
  tried: string;
  stakes: string;
  kind?: string;
  duration?: string;
  clarifications?: Clarification[];
};

export const READING_MODEL = "google/gemini-2.5-flash";

export type GeneratedReading = {
  philosopherSlug: ProfileSlug;
  headline: string;
  noticed: string;
  method: string;
  grounding: string;
  limits: string;
  question: string;
  exercise: string;
  returnPrompt: string;
  /** The single sentence the whole reading argues for. Stored in the legacy tension column. */
  tension: string;
  /** Legacy columns kept in step so saved history still renders and follow ups keep context. */
  challenge: string;
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
  "thesis",
  "headline",
  "noticed",
  "method",
  "grounding",
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
    thesis: {
      type: "string",
      description:
        "The reading's entire interpretation in one sentence. Internal check, not shown as a section.",
    },
    headline: {
      type: "string",
      description: "One short statement of that interpretation, addressed to the reader.",
    },
    noticed: {
      type: "string",
      description:
        "The bearing: one clearly marked interpretive hypothesis about what is actually going on, beyond the reader's own framing.",
    },
    method: {
      type: "string",
      description:
        "The philosophical lens: one or two named concepts explained in plain language, with the primary work and section, shown producing the interpretation.",
    },
    grounding: {
      type: "string",
      description: "Sources: work and section in citation form, marking paraphrase as paraphrase.",
    },
    limits: {
      type: "string",
      description:
        "The specific assumption this reading could have wrong, and what would show it to be wrong.",
    },
    question: {
      type: "string",
      description:
        "The better question, arising from this interpretation and specific to this situation.",
    },
    exercise: {
      type: "string",
      description:
        "The experiment: one small concrete action that tests the interpretation and could come out either way.",
    },
    returnPrompt: {
      type: "string",
      description:
        "When you return: the evidence to watch for and bring back, and what would confirm or unsettle the interpretation.",
    },
  },
} as const;

type ParsedReading = Record<(typeof FIELDS)[number], string>;

function buildUserContent(answers: ReadingAnswers): string {
  const parts = [
    `Situation: ${answers.situation}`,
    `What they have tried: ${answers.tried || "Not stated."}`,
    `What feels at stake: ${answers.stakes || "Not stated."}`,
    `What kind of matter this is: ${answers.kind || "Not stated."}`,
    `How long it has been present: ${answers.duration || "Not stated."}`,
  ];
  if (answers.clarifications?.length) {
    parts.push(
      [
        "Answers to the diagnostic questions you asked before writing:",
        ...answers.clarifications.map(
          (item) => `Q: ${item.question}\nA: ${item.answer || "Not answered."}`,
        ),
        "These answers are the sharpest material you have. Build the interpretation from them.",
      ].join("\n"),
    );
  }
  parts.push(
    `Use these signals to choose the emphasis. Treat a repeating pattern as a formed habit, a relationship as something between two people, a decision as a judgment to test, and a fear as something to confront. If the reader named a good outcome, use it as the measure the reading tests against.`,
  );
  return parts.join("\n\n");
}

async function requestReading(
  apiKey: string,
  slug: ProfileSlug,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
): Promise<{ parsed: ParsedReading; promptTokens: number; completionTokens: number }> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: READING_MODEL,
      messages: [{ role: "system", content: buildSystemPrompt(slug) }, ...messages],
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

  return {
    parsed: JSON.parse(content) as ParsedReading,
    promptTokens: payload.usage?.prompt_tokens ?? 0,
    completionTokens: payload.usage?.completion_tokens ?? 0,
  };
}

/** A thesis that is missing, long, or multi claim means the reading has no single spine. */
function thesisHolds(thesis: string): boolean {
  const trimmed = (thesis || "").trim();
  if (trimmed.length < 20) return false;
  const sentences = trimmed.split(/[.!?]+\s/).filter((part) => part.trim().length > 0);
  return sentences.length <= 1 && trimmed.split(/\s+/).length <= 45;
}

/** Generates a structured reading through the Lovable AI Gateway. Server only. */
export async function generateReadingWithAI(
  slug: ProfileSlug,
  answers: ReadingAnswers,
): Promise<ReadingResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Reading service is not configured.");

  const userContent = buildUserContent(answers);
  const first = await requestReading(apiKey, slug, [{ role: "user", content: userContent }]);

  let parsed = first.parsed;
  let promptTokens = first.promptTokens;
  let completionTokens = first.completionTokens;

  // One rebuild when the reading cannot be summarised in a single sentence.
  if (!thesisHolds(parsed.thesis)) {
    const retry = await requestReading(apiKey, slug, [
      { role: "user", content: userContent },
      { role: "assistant", content: JSON.stringify(parsed) },
      {
        role: "user",
        content:
          "That reading does not hold one thesis. Choose the single most defensible interpretation, write it as one sentence in thesis, and rewrite every other field so it argues only for that. Do not widen the reading to cover several possibilities.",
      },
    ]);
    parsed = retry.parsed;
    promptTokens += retry.promptTokens;
    completionTokens += retry.completionTokens;
  }

  return {
    usage: { promptTokens, completionTokens },
    reading: {
      philosopherSlug: slug,
      headline: parsed.headline || "Your situation already points to something you can test.",
      noticed: parsed.noticed,
      method: parsed.method,
      grounding: parsed.grounding,
      limits: parsed.limits,
      question: parsed.question,
      exercise: parsed.exercise,
      returnPrompt: parsed.returnPrompt,
      tension: parsed.thesis,
      // Legacy columns, written so older views and follow up context keep working.
      challenge: "",
      assumption: parsed.thesis,
      principle: parsed.method,
      note: DISCLAIMER,
    },
  };
}

const DIAGNOSTIC_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["needsClarification", "questions"],
  properties: {
    needsClarification: {
      type: "boolean",
      description: "True only when the submission is too broad to interpret responsibly.",
    },
    questions: {
      type: "array",
      description: "Two or three short diagnostic questions, or an empty array.",
      items: { type: "string" },
    },
  },
} as const;

const DIAGNOSTIC_RULES = `
You are deciding whether a submission carries enough particular detail to support one defensible interpretation.

Set needsClarification to true when the submission is broad or underspecified, for example "I feel lost", "I am unhappy", or "I do not know what to do with my life": no named situation, no concrete recent event, no identifiable person or choice.
Set it to false when there is a specific situation, decision, relationship, or repeated episode to work from, even if briefly described.

When true, write two or three questions that would most change the interpretation. Rules for them:
- Each must be adapted to the words the person actually used, not a generic intake form.
- Ask for particulars: a recent instance, who else is involved, what changed and when, what they would do if the obstacle vanished.
- One sentence each, plain language, no philosophical vocabulary, no therapeutic tone, no em dashes.
- Do not ask what they want from a reading, and do not ask them to rate anything.
When false, return an empty array.
`;

export type DiagnosticResult = {
  needsClarification: boolean;
  questions: string[];
  usage: { promptTokens: number; completionTokens: number };
};

/** Decides whether a submission is too broad to read, and what to ask instead. Server only. */
export async function generateDiagnosticQuestions(
  answers: ReadingAnswers,
): Promise<DiagnosticResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Reading service is not configured.");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: DIAGNOSTIC_RULES },
        {
          role: "user",
          content: [
            `Situation: ${answers.situation}`,
            `What they have tried: ${answers.tried || "Not stated."}`,
            `What feels at stake: ${answers.stakes || "Not stated."}`,
            `Kind: ${answers.kind || "Not stated."}`,
            `Duration: ${answers.duration || "Not stated."}`,
          ].join("\n"),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "diagnostic", strict: true, schema: DIAGNOSTIC_SCHEMA },
      },
    }),
  });

  if (!response.ok) {
    console.error("AI gateway error", response.status, await response.text());
    // A failed check must never block a reading.
    return { needsClarification: false, questions: [], usage: { promptTokens: 0, completionTokens: 0 } };
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const content = payload.choices?.[0]?.message?.content;
  const parsed = content
    ? (JSON.parse(content) as { needsClarification?: boolean; questions?: string[] })
    : {};
  const questions = (parsed.questions ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 3);

  return {
    needsClarification: Boolean(parsed.needsClarification) && questions.length >= 2,
    questions,
    usage: {
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0,
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
    `The one sentence interpretation it argued for: ${input.reading.tension || input.reading.assumption}`,
    `The bearing: ${input.reading.noticed}`,
    `The lens applied: ${input.reading.method || input.reading.principle}`,
    `The assumption it could have wrong: ${input.reading.limits || "Not recorded."}`,

    `The experiment: ${input.reading.exercise}`,
    `The better question they were left with: ${input.reading.question}`,

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
