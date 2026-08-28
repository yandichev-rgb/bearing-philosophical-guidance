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
export const DIAGNOSTIC_MODEL = "google/gemini-2.5-flash-lite";

export type GeneratedReading = {
  philosopherSlug: ProfileSlug;
  /** The reading's title: the case specific interpretation. */
  headline: string;
  /** The bearing. */
  noticed: string;
  lensName: string;
  conceptsUsed: string[];
  /** The lens explanation. */
  method: string;
  /** One source line, generated from the concepts actually used. */
  grounding: string;
  /** The assumption this reading could have wrong. */
  limits: string;
  /** The better question. */
  question: string;
  practiceTitle: string;
  practiceDuration: string;
  practiceSteps: string[];
  whatToObserve: string;
  returnPrompt: string;
  /** Legacy prose form of the practice, kept so follow ups and old views work. */
  exercise: string;
  /** The single sentence the whole reading argues for. Stored in the legacy tension column. */
  tension: string;
  /** Legacy columns kept in step so saved history still renders. */
  challenge: string;
  assumption: string;
  principle: string;
  note: string;
};

export type ReadingResult = {
  reading: GeneratedReading;
  usage: { promptTokens: number; completionTokens: number };
};

/** Thrown when no complete, personalised reading could be produced. */
export class ReadingGenerationError extends Error {
  constructor(public readonly reason: string) {
    super("READING_GENERATION_FAILED");
    this.name = "ReadingGenerationError";
  }
}

const DISCLAIMER =
  "This reading applies one philosopher's method to what you described. It is one lens, not a complete answer, and it is for reflection rather than clinical, legal, medical, or financial advice.";

/**
 * Sentences that only ever belonged to the illustrative example reading. If any
 * of them reach a generated reading, the reading is rejected rather than shown.
 */
const SAMPLE_SENTENCES = [
  "your habits are already choosing a direction",
  "you describe a gap between what you say matters and what your week repeatedly rewards",
  "which habit is this choice quietly building",
  "for one week, write down each moment your actions and your stated priorities split",
];

const STRING_FIELDS = [
  "thesis",
  "title",
  "bearing",
  "lensName",
  "lensExplanation",
  "sources",
  "betterQuestion",
  "practiceTitle",
  "practiceDuration",
  "whatToObserve",
  "returnPrompt",
  "limitation",
] as const;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [...STRING_FIELDS, "conceptsUsed", "practiceSteps", "intakeEvidenceUsed"],
  properties: {
    thesis: {
      type: "string",
      description: "The reading's entire interpretation in one sentence. Internal check only.",
    },
    intakeEvidenceUsed: {
      type: "array",
      description:
        "Two to four concrete particulars taken from what the reader wrote, which this interpretation rests on. Internal only.",
      items: { type: "string" },
    },
    title: { type: "string", description: "The case specific interpretation, addressed to the reader." },
    bearing: {
      type: "string",
      description:
        "The interpretive hypothesis, working at least two of the reader's own particulars into it.",
    },
    lensName: { type: "string", description: "The tradition or method applied. Three words at most." },
    conceptsUsed: {
      type: "array",
      description: "The one or two concepts that carry this interpretation.",
      items: { type: "string" },
    },
    lensExplanation: {
      type: "string",
      description: "Those concepts in plain language, shown producing the interpretation.",
    },
    sources: {
      type: "string",
      description:
        "One sentence citing only the work and sections behind the concepts used, in the form: Grounded in Aristotle's Nicomachean Ethics, II.1-6 and VI.5.",
    },
    betterQuestion: {
      type: "string",
      description: "The better question, following from this interpretation only.",
    },
    practiceTitle: { type: "string", description: "Short concrete name for the experiment." },
    practiceDuration: { type: "string", description: "How long the experiment takes." },
    practiceSteps: {
      type: "array",
      description: "Two or three plain instructions with no numbering or leading digits.",
      items: { type: "string" },
    },
    whatToObserve: { type: "string", description: "The observable result that counts as evidence." },
    returnPrompt: {
      type: "string",
      description: "What to bring back and when, and what would confirm or unsettle the reading.",
    },
    limitation: {
      type: "string",
      description: "The specific assumption this reading could have wrong.",
    },
  },
} as const;

type ParsedReading = Record<(typeof STRING_FIELDS)[number], string> & {
  conceptsUsed: string[];
  practiceSteps: string[];
  intakeEvidenceUsed: string[];
};

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
    console.error("reading.gateway_error", { slug, status: response.status });
    throw new ReadingGenerationError(`gateway_${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new ReadingGenerationError("empty_response");

  let parsed: ParsedReading;
  try {
    parsed = JSON.parse(content) as ParsedReading;
  } catch {
    throw new ReadingGenerationError("unparsable_response");
  }

  return {
    parsed,
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

const STOP_WORDS = new Set([
  "the", "and", "that", "this", "with", "have", "been", "from", "they", "them", "their", "what",
  "when", "would", "could", "about", "there", "which", "because", "into", "then", "than", "some",
  "just", "like", "very", "much", "more", "most", "even", "still", "keep", "feel", "feels", "know",
  "want", "make", "made", "does", "doing", "your", "yours", "mine", "myself", "really", "always",
  "never", "every", "thing", "things", "something", "anything", "nothing", "time", "times",
]);

function significantWords(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
}

function containsSampleSentence(values: string[]): boolean {
  const haystack = values.join(" \n ").toLowerCase().replace(/[’‘]/g, "'");
  return SAMPLE_SENTENCES.some((sentence) => haystack.includes(sentence));
}

/** Duplicated work titles in one source line are the citation bug we reject. */
function sourcesAreClean(sources: string): boolean {
  const text = sources.trim();
  if (text.length < 10) return false;
  const titles = text.match(/[A-Z][A-Za-z]+(?:\s+(?:of\s+)?[A-Z][A-Za-z]+)*/g) ?? [];
  const seen = new Map<string, number>();
  for (const title of titles) {
    if (title.split(/\s+/).length < 2) continue;
    seen.set(title, (seen.get(title) ?? 0) + 1);
  }
  return ![...seen.values()].some((count) => count > 1);
}

/**
 * The personalisation quality gate. Returns the list of problems found, which is
 * empty when the reading may be shown. No reader text is included in the result.
 */
function validateReading(parsed: ParsedReading, answers: ReadingAnswers): string[] {
  const problems: string[] = [];

  for (const field of STRING_FIELDS) {
    if (typeof parsed[field] !== "string" || parsed[field].trim().length < 3) {
      problems.push(`missing_${field}`);
    }
  }
  if (!Array.isArray(parsed.conceptsUsed) || parsed.conceptsUsed.filter(Boolean).length === 0) {
    problems.push("missing_conceptsUsed");
  }
  const steps = Array.isArray(parsed.practiceSteps)
    ? parsed.practiceSteps.map((step) => (step ?? "").trim()).filter(Boolean)
    : [];
  if (steps.length < 2) problems.push("missing_practiceSteps");

  const submission = [
    answers.situation,
    answers.tried,
    answers.stakes,
    ...(answers.clarifications ?? []).map((item) => item.answer),
  ].join(" ");
  const submissionWords = new Set(significantWords(submission));

  const evidence = Array.isArray(parsed.intakeEvidenceUsed)
    ? parsed.intakeEvidenceUsed.map((item) => (item ?? "").trim()).filter(Boolean)
    : [];
  const groundedEvidence = evidence.filter((item) => {
    const words = significantWords(item);
    return words.length > 0 && words.filter((word) => submissionWords.has(word)).length >= 1;
  });
  if (groundedEvidence.length < 2) problems.push("intake_evidence_not_grounded");

  const bearingWords = new Set(significantWords(parsed.bearing ?? ""));
  const evidenceInBearing = groundedEvidence.filter((item) =>
    significantWords(item).some((word) => bearingWords.has(word)),
  ).length;
  if (groundedEvidence.length >= 2 && evidenceInBearing < 2) {
    problems.push("bearing_does_not_use_evidence");
  }

  const titleWords = significantWords(parsed.title ?? "");
  if (titleWords.length < 3) problems.push("title_not_specific");

  if (!(parsed.betterQuestion ?? "").includes("?")) problems.push("better_question_malformed");

  if (!sourcesAreClean(parsed.sources ?? "")) problems.push("sources_malformed");

  if (
    containsSampleSentence([
      parsed.title ?? "",
      parsed.bearing ?? "",
      parsed.betterQuestion ?? "",
      ...steps,
      parsed.lensExplanation ?? "",
      parsed.returnPrompt ?? "",
    ])
  ) {
    problems.push("sample_content_present");
  }

  if (!thesisHolds(parsed.thesis ?? "")) problems.push("thesis_not_single");

  return problems;
}

/** Strips any numbering the model added, so the list renders 1, 2, 3 once. */
function cleanSteps(steps: string[]): string[] {
  return steps
    .map((step) => (step ?? "").trim().replace(/^(?:\(?\d{1,2}[).:]?|[-•–])\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

function assemble(slug: ProfileSlug, parsed: ParsedReading): GeneratedReading {
  const steps = cleanSteps(parsed.practiceSteps);
  const concepts = parsed.conceptsUsed.map((item) => item.trim()).filter(Boolean).slice(0, 3);
  return {
    philosopherSlug: slug,
    headline: parsed.title.trim(),
    noticed: parsed.bearing.trim(),
    lensName: parsed.lensName.trim(),
    conceptsUsed: concepts,
    method: parsed.lensExplanation.trim(),
    grounding: parsed.sources.trim(),
    limits: parsed.limitation.trim(),
    question: parsed.betterQuestion.trim(),
    practiceTitle: parsed.practiceTitle.trim(),
    practiceDuration: parsed.practiceDuration.trim(),
    practiceSteps: steps,
    whatToObserve: parsed.whatToObserve.trim(),
    returnPrompt: parsed.returnPrompt.trim(),
    exercise: [...steps, parsed.whatToObserve.trim()].join(" "),
    tension: parsed.thesis.trim(),
    // Legacy columns, written so older views and follow up context keep working.
    challenge: "",
    assumption: parsed.thesis.trim(),
    principle: parsed.lensName.trim(),
    note: DISCLAIMER,
  };
}

/**
 * Generates a structured reading through the Lovable AI Gateway. Server only.
 * A reading is either complete and personalised or it fails. No field is ever
 * filled from a default or from example content.
 */
export async function generateReadingWithAI(
  slug: ProfileSlug,
  answers: ReadingAnswers,
): Promise<ReadingResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    console.error("reading.not_configured", { slug });
    throw new ReadingGenerationError("not_configured");
  }

  const userContent = buildUserContent(answers);
  const first = await requestReading(apiKey, slug, [{ role: "user", content: userContent }]);

  let parsed = first.parsed;
  let promptTokens = first.promptTokens;
  let completionTokens = first.completionTokens;

  let problems = validateReading(parsed, answers);
  console.info("reading.attempt", { slug, attempt: 1, ok: problems.length === 0, problems });

  // Exactly one schema repair attempt. Nothing is merged from the first reply.
  if (problems.length > 0) {
    const retry = await requestReading(apiKey, slug, [
      { role: "user", content: userContent },
      { role: "assistant", content: JSON.stringify(parsed) },
      {
        role: "user",
        content: [
          "That reading was rejected. Rewrite it completely and return every required field.",
          `Problems found: ${problems.join(", ")}.`,
          "Requirements for the rewrite:",
          "- Fill every field. Never leave one empty and never write filler that would fit another reader.",
          "- intakeEvidenceUsed must quote two to four particulars the reader actually wrote, and the bearing must use at least two of them.",
          "- The title must state a case specific interpretation, not a category or a restatement.",
          "- The better question must follow from that interpretation, and the practice must test it.",
          "- sources must be one sentence citing only the sections behind the concepts you used, with no work named twice.",
          "- practiceSteps must be two or three plain sentences with no numbering.",
          "- thesis must be one sentence that the whole reading argues for.",
        ].join("\n"),
      },
    ]);
    parsed = retry.parsed;
    promptTokens += retry.promptTokens;
    completionTokens += retry.completionTokens;
    problems = validateReading(parsed, answers);
    console.info("reading.attempt", { slug, attempt: 2, ok: problems.length === 0, problems });

    if (problems.length > 0) throw new ReadingGenerationError(problems.join(","));
  }

  return { usage: { promptTokens, completionTokens }, reading: assemble(slug, parsed) };
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
- Each question must open a different line of enquiry. Do not ask the same thing in three ways, and do not ask when the feeling began if you have already asked how long it has lasted.
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
      model: DIAGNOSTIC_MODEL,
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
- Hold to the same central interpretation the reading argued for. Extend or correct it if their question gives you reason to, and say plainly when it does.

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
