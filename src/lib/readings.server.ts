/**
 * The reading pipeline. Server only.
 *
 * Four stages, in order: a context sufficiency check, an internal analysis plan,
 * the written reading, then deterministic validation with at most one repair
 * call. A reading is either complete, personalised, and source grounded, or the
 * pipeline returns an explicit error. No field is ever filled from a default and
 * no example content is ever merged into a generated reading.
 */

import {
  buildPlannerPrompt,
  buildSystemPrompt,
  buildWriterPrompt,
  conceptSourceIds,
  getProfile,
  profileConceptIds,
  profileSourceIds,
  renderCitation,
  type ProfileSlug,
} from "./philosopher-profiles.server";
import {
  READING_ERROR_MESSAGE,
  READING_SAFETY_MESSAGE,
  type GeneratedReading,
  type ReadingAnswers,
  type ReadingResult,
  type ReadingSource,
} from "./reading-types";

export type { ReadingAnswers, GeneratedReading, ReadingResult } from "./reading-types";

/* -------------------------------------------------------------------------- */
/* Model configuration                                                         */
/* -------------------------------------------------------------------------- */

const DEFAULT_SUFFICIENCY_MODEL = "google/gemini-2.5-flash-lite";
const DEFAULT_PLANNER_MODEL = "google/gemini-2.5-flash";
const DEFAULT_WRITER_MODEL = "google/gemini-2.5-flash";
const DEFAULT_REPAIR_MODEL = "google/gemini-2.5-flash";

/** Every model id in the pipeline is read here and nowhere else. */
export function readingModels() {
  return {
    sufficiency: process.env["READING_SUFFICIENCY_MODEL"] || DEFAULT_SUFFICIENCY_MODEL,
    planner: process.env["READING_PLANNER_MODEL"] || DEFAULT_PLANNER_MODEL,
    writer: process.env["READING_WRITER_MODEL"] || DEFAULT_WRITER_MODEL,
    repair: process.env["READING_REPAIR_MODEL"] || DEFAULT_REPAIR_MODEL,
  };
}

/** The model billed for follow up answers on a saved reading. */
export const FOLLOW_UP_MODEL = DEFAULT_WRITER_MODEL;

export const DISCLAIMER =
  "This reading applies one philosopher's method to what you described. It is one lens, not a complete answer, and it is for reflection rather than clinical, legal, medical, or financial advice.";

export type Usage = { promptTokens: number; completionTokens: number };

export type ReadingTelemetry = {
  resultType: ReadingResult["kind"];
  philosopherSlug: string;
  models: { planner?: string; writer?: string; repair?: string };
  calls: number;
  latencyMs: Record<string, number>;
  usage: Usage;
  validationFailures: string[];
  clarificationRequired: boolean;
  repairAttempted: boolean;
  repairSucceeded: boolean;
};

export type PipelineOutcome = { result: ReadingResult; usage: Usage; telemetry: ReadingTelemetry };

/* -------------------------------------------------------------------------- */
/* Gateway                                                                     */
/* -------------------------------------------------------------------------- */

type Message = { role: "system" | "user" | "assistant"; content: string };

class GatewayError extends Error {
  constructor(
    public readonly status: number,
    public readonly retryable: boolean,
  ) {
    super(`gateway_${status}`);
    this.name = "GatewayError";
  }
}

async function callJson<T>(input: {
  apiKey: string;
  model: string;
  messages: Message[];
  schemaName: string;
  schema: object;
}): Promise<{ parsed: T; usage: Usage; latencyMs: number }> {
  const started = Date.now();
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      messages: input.messages,
      response_format: {
        type: "json_schema",
        json_schema: { name: input.schemaName, strict: true, schema: input.schema },
      },
    }),
  });

  if (!response.ok) {
    // Only rate limits and upstream failures are worth another attempt.
    const retryable = response.status === 429 || response.status >= 500;
    console.error("reading.gateway_error", { model: input.model, status: response.status });
    throw new GatewayError(response.status, retryable);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new GatewayError(502, true);

  let parsed: T;
  try {
    parsed = JSON.parse(content) as T;
  } catch {
    throw new GatewayError(502, true);
  }

  return {
    parsed,
    usage: {
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0,
    },
    latencyMs: Date.now() - started,
  };
}

function addUsage(total: Usage, next: Usage): Usage {
  return {
    promptTokens: total.promptTokens + next.promptTokens,
    completionTokens: total.completionTokens + next.completionTokens,
  };
}

/* -------------------------------------------------------------------------- */
/* Stage one: context sufficiency                                              */
/* -------------------------------------------------------------------------- */

const SUFFICIENCY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["sufficientContext", "questions", "safetyFlags"],
  properties: {
    sufficientContext: {
      type: "boolean",
      description: "True when the intake supports one responsible interpretation.",
    },
    questions: {
      type: "array",
      description: "Two or three adaptive questions when context is insufficient, else empty.",
      items: { type: "string" },
    },
    safetyFlags: {
      type: "array",
      description:
        "Flags such as crisis, self_harm, abuse, medical, legal, or financial. Empty when none apply.",
      items: { type: "string" },
    },
  },
} as const;

const SUFFICIENCY_RULES = `
You decide whether a submission carries enough particular detail to support one responsible philosophical interpretation. You never write a reading.

Sufficient intake normally identifies all of these:
- a concrete situation or a recurring pattern
- at least one behaviour, event, relationship, or decision
- what the person has tried or how they have responded
- what feels conflicted or at stake

Judge by content, never by word count. A short entry naming a real event and a real conflict is sufficient. A long entry of general feeling is not.

When context is insufficient, write two or three questions that would most change the interpretation:
- adapted to the words the person actually used, never a generic intake form
- asking for particulars: a recent instance, who else is involved, what they tried and what stopped it, what the difficulty actually consists of
- one sentence each, plain language, no philosophical or therapeutic vocabulary, no em dashes
- each opening a different line of enquiry

For example, for "I feel lost", good questions are: when during the past year they felt most engaged or useful; what directions they have tried and what caused them to stop; whether feeling lost means no option appeals, too many compete, or they cannot commit.

Set safetyFlags when the submission indicates a crisis, self-harm, abuse, or a request for medical, legal, or financial advice. Otherwise return an empty array.
`;

type SufficiencyReply = {
  sufficientContext: boolean;
  questions: string[];
  safetyFlags: string[];
};

/* -------------------------------------------------------------------------- */
/* Stage two: the internal analysis plan                                       */
/* -------------------------------------------------------------------------- */

const CONCEPT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "explanation", "sourceIds"],
  properties: {
    id: { type: "string", description: "A concept id from the permitted list." },
    name: { type: "string" },
    explanation: { type: "string", description: "How this concept explains this reader's case." },
    sourceIds: { type: "array", items: { type: "string" } },
  },
} as const;

const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "sufficientContext",
    "intakeEvidence",
    "centralTension",
    "interpretiveHypothesis",
    "primaryConcept",
    "supportingConcept",
    "alternativeInterpretation",
    "betterQuestionRationale",
    "practiceRationale",
    "uncertainty",
    "safetyFlags",
  ],
  properties: {
    sufficientContext: { type: "boolean" },
    intakeEvidence: {
      type: "array",
      description: "At least two concrete details from what the reader wrote, with why each matters.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["detail", "significance"],
        properties: {
          detail: { type: "string" },
          significance: { type: "string" },
        },
      },
    },
    centralTension: { type: "string" },
    interpretiveHypothesis: {
      type: "string",
      description: "One hypothesis, held as a possibility about the situation.",
    },
    primaryConcept: CONCEPT_SCHEMA,
    supportingConcept: {
      type: "object",
      additionalProperties: false,
      required: ["id", "name", "explanation", "sourceIds", "reasonNeeded"],
      description:
        "A second concept only when it materially changes the interpretation. When it is not needed, set id to none and leave the other fields empty.",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        explanation: { type: "string" },
        sourceIds: { type: "array", items: { type: "string" } },
        reasonNeeded: { type: "string" },
      },
    },

    alternativeInterpretation: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "evidenceFor", "evidenceAgainst", "whatWouldMakeItMoreLikely"],
      properties: {
        summary: { type: "string" },
        evidenceFor: { type: "array", items: { type: "string" } },
        evidenceAgainst: { type: "array", items: { type: "string" } },
        whatWouldMakeItMoreLikely: { type: "string" },
      },
    },
    betterQuestionRationale: { type: "string" },
    practiceRationale: { type: "string" },
    uncertainty: { type: "string" },
    safetyFlags: { type: "array", items: { type: "string" } },
  },
} as const;

export type ReadingPlan = {
  sufficientContext: boolean;
  intakeEvidence: { detail: string; significance: string }[];
  centralTension: string;
  interpretiveHypothesis: string;
  primaryConcept: { id: string; name: string; explanation: string; sourceIds: string[] };
  supportingConcept: {
    id: string;
    name: string;
    explanation: string;
    sourceIds: string[];
    reasonNeeded: string;
  } | null;
  alternativeInterpretation: {
    summary: string;
    evidenceFor: string[];
    evidenceAgainst: string[];
    whatWouldMakeItMoreLikely: string;
  };
  betterQuestionRationale: string;
  practiceRationale: string;
  uncertainty: string;
  safetyFlags: string[];
};

/* -------------------------------------------------------------------------- */
/* Stage three: the written reading                                            */
/* -------------------------------------------------------------------------- */

const READING_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "bearing",
    "throughLens",
    "conceptsUsed",
    "sources",
    "betterQuestion",
    "practice",
    "alternativeReading",
    "returnPrompt",
    "limitation",
    "intakeEvidenceUsed",
  ],
  properties: {
    title: { type: "string", description: "The interpretive hypothesis, in this reader's case." },
    bearing: { type: "string", description: "The whole interpretation, one continuous passage." },
    throughLens: {
      type: "string",
      description: "The plan's concepts in plain language, tied to the reader's own details.",
    },
    conceptsUsed: { type: "array", items: { type: "string" } },
    sources: {
      type: "array",
      description: "Only the works and locations the plan selected.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["work", "location"],
        properties: { work: { type: "string" }, location: { type: "string" } },
      },
    },
    betterQuestion: { type: "string" },
    practice: {
      type: "object",
      additionalProperties: false,
      required: ["title", "duration", "steps", "whatToObserve"],
      properties: {
        title: { type: "string" },
        duration: { type: "string" },
        steps: {
          type: "array",
          description: "Two or three plain imperatives with no numbering or leading digits.",
          items: { type: "string" },
        },
        whatToObserve: { type: "string" },
      },
    },
    alternativeReading: { type: "string" },
    returnPrompt: { type: "string" },
    limitation: { type: "string" },
    intakeEvidenceUsed: { type: "array", items: { type: "string" } },
  },
} as const;

type WrittenReading = {
  title: string;
  bearing: string;
  throughLens: string;
  conceptsUsed: string[];
  sources: ReadingSource[];
  betterQuestion: string;
  practice: { title: string; duration: string; steps: string[]; whatToObserve: string };
  alternativeReading: string;
  returnPrompt: string;
  limitation: string;
  intakeEvidenceUsed: string[];
};

/* -------------------------------------------------------------------------- */
/* Deterministic validation                                                    */
/* -------------------------------------------------------------------------- */

/** Sentences that only ever belonged to the labelled example reading. */
export const SAMPLE_SENTENCES = [
  "your habits are already choosing a direction",
  "you describe a gap between what you say matters and what your week repeatedly rewards",
  "which habit is this choice quietly building",
  "for one week, write down each moment your actions and your stated priorities split",
];

const GENERIC_TITLES = [
  "you are navigating uncertainty",
  "you are navigating a persistent fear",
  "your reading",
  "a reading for you",
  "finding your bearing",
];

const DEFAULT_PRACTICE_TERMS = [
  "journal",
  "journalling",
  "journaling",
  "meditate",
  "meditation",
  "pros and cons",
  "habit tracker",
  "track your habits",
  "go for a walk",
  "take a walk",
  "wait 48 hours",
  "forty eight hours",
];

const GENERIC_LIMITATION_TERMS = [
  "systemic barriers",
  "unforeseen circumstances",
  "every situation is unique",
  "individual results vary",
  "no interpretation is complete",
];

const CLINICAL_TERMS = [
  "you have a mother complex",
  "you are projecting",
  "your shadow is",
  "your archetype is",
  "you are suffering from",
  "you have been diagnosed",
  "this is clinical",
  "you have depression",
  "you have anxiety disorder",
];

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

function normalise(text: string): string {
  return (text || "").toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}

function wordCount(text: string): number {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

export function submissionText(answers: ReadingAnswers): string {
  return [
    answers.situation,
    answers.tried,
    answers.stakes,
    ...(answers.clarifications ?? []).map((item) => item.answer),
  ].join(" ");
}

/** Strips any numbering the model added, so the list is numbered exactly once. */
export function cleanSteps(steps: string[]): string[] {
  return (steps ?? [])
    .map((step) => (step ?? "").trim().replace(/^(?:\(?\d{1,2}[).:]?|[-•–])\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

/**
 * The full quality gate. Returns the problems found, empty when the reading may
 * be shown. No reader text is ever included in the returned codes.
 */
export function validateReading(input: {
  slug: ProfileSlug;
  plan: ReadingPlan;
  reading: WrittenReading;
  answers: ReadingAnswers;
}): string[] {
  const { slug, plan, reading, answers } = input;
  const problems: string[] = [];
  const profile = getProfile(slug);

  // Required fields.
  const strings: [string, string][] = [
    ["title", reading.title],
    ["bearing", reading.bearing],
    ["throughLens", reading.throughLens],
    ["betterQuestion", reading.betterQuestion],
    ["alternativeReading", reading.alternativeReading],
    ["returnPrompt", reading.returnPrompt],
    ["limitation", reading.limitation],
    ["practiceTitle", reading.practice?.title ?? ""],
    ["practiceDuration", reading.practice?.duration ?? ""],
    ["whatToObserve", reading.practice?.whatToObserve ?? ""],
  ];
  for (const [name, value] of strings) {
    if (typeof value !== "string" || value.trim().length < 3) problems.push(`missing_${name}`);
  }

  const steps = cleanSteps(reading.practice?.steps ?? []);
  if (steps.length < 2) problems.push("missing_practice_steps");

  // At least two concrete intake details, actually present in the submission
  // and actually carried into the bearing.
  const submissionWords = new Set(significantWords(submissionText(answers)));
  const evidence = (reading.intakeEvidenceUsed ?? []).map((item) => (item ?? "").trim()).filter(Boolean);
  const grounded = evidence.filter((item) =>
    significantWords(item).some((word) => submissionWords.has(word)),
  );
  if (grounded.length < 2) problems.push("intake_evidence_not_grounded");

  const bearingWords = new Set(significantWords(reading.bearing ?? ""));
  const inBearing = grounded.filter((item) =>
    significantWords(item).some((word) => bearingWords.has(word)),
  ).length;
  if (grounded.length >= 2 && inBearing < 2) problems.push("bearing_does_not_use_evidence");

  // The title must be specific, and never a sample or generic fallback.
  const title = normalise(reading.title ?? "");
  if (significantWords(title).length < 3) problems.push("title_not_specific");
  if (GENERIC_TITLES.some((generic) => title.includes(generic))) problems.push("title_generic");

  // Only the plan's concepts may appear.
  const planConceptNames = [plan.primaryConcept?.name, plan.supportingConcept?.name]
    .filter(Boolean)
    .map((name) => normalise(name as string));
  const used = (reading.conceptsUsed ?? []).map((name) => normalise(name)).filter(Boolean);
  if (used.length === 0) problems.push("missing_concepts_used");
  if (used.length > planConceptNames.length) problems.push("extra_concepts_used");
  for (const name of used) {
    const known = planConceptNames.some((planName) => planName.includes(name) || name.includes(planName));
    if (!known) problems.push("concept_not_in_plan");
  }

  // Sources: must exist in this profile, must support a concept actually used,
  // and must never repeat.
  const allowedSourceIds = new Set([
    ...(plan.primaryConcept?.sourceIds ?? []),
    ...(plan.supportingConcept?.sourceIds ?? []),
  ]);
  const sources = (reading.sources ?? []).filter((source) => source && source.work && source.location);
  if (sources.length === 0) problems.push("missing_sources");
  const seen = new Set<string>();
  for (const source of sources) {
    const key = `${normalise(source.work)}|${normalise(source.location)}`;
    if (seen.has(key)) problems.push("duplicate_source");
    seen.add(key);

    const match = Object.entries(profile.sources).find(
      ([, entry]) =>
        normalise(entry.work) === normalise(source.work) &&
        normalise(entry.location) === normalise(source.location),
    );
    if (!match) {
      problems.push("source_not_in_profile");
      continue;
    }
    if (!allowedSourceIds.has(match[0])) problems.push("source_does_not_support_concept");
  }
  // The better question must be a question, and must follow the hypothesis.
  if (!(reading.betterQuestion ?? "").includes("?")) problems.push("better_question_malformed");
  const hypothesisWords = new Set(significantWords(plan.interpretiveHypothesis ?? ""));
  const questionWords = significantWords(reading.betterQuestion ?? "");
  if (questionWords.length > 0 && !questionWords.some((word) => hypothesisWords.has(word))) {
    problems.push("better_question_not_from_hypothesis");
  }

  // The practice must test the hypothesis and must not fall back on a default action.
  const practiceText = normalise([reading.practice?.title, ...steps, reading.practice?.whatToObserve].join(" "));
  const rationale = normalise(plan.practiceRationale ?? "");
  for (const term of DEFAULT_PRACTICE_TERMS) {
    if (practiceText.includes(term) && !rationale.includes(term.split(" ")[0]!)) {
      problems.push("practice_is_default_action");
      break;
    }
  }
  const practiceWords = significantWords(practiceText);
  if (!practiceWords.some((word) => hypothesisWords.has(word) || submissionWords.has(word))) {
    problems.push("practice_does_not_test_hypothesis");
  }

  // The alternative reading and the limitation must both be specific.
  const alternative = normalise(reading.alternativeReading ?? "");
  if (wordCount(alternative) < 15) problems.push("alternative_reading_too_thin");
  if (!significantWords(alternative).some((word) => submissionWords.has(word))) {
    problems.push("alternative_reading_not_specific");
  }
  const limitation = normalise(reading.limitation ?? "");
  if (wordCount(limitation) < 12) problems.push("limitation_too_thin");
  if (GENERIC_LIMITATION_TERMS.some((term) => limitation.includes(term))) {
    problems.push("limitation_generic");
  }

  // Length.
  const total =
    wordCount(reading.bearing) +
    wordCount(reading.throughLens) +
    wordCount(reading.betterQuestion) +
    steps.reduce((sum, step) => sum + wordCount(step), 0) +
    wordCount(reading.practice?.whatToObserve ?? "") +
    wordCount(reading.alternativeReading) +
    wordCount(reading.returnPrompt);
  if (total < 350) problems.push("too_short");
  if (total > 650) problems.push("too_long");

  const everything = normalise(
    [
      reading.title,
      reading.bearing,
      reading.throughLens,
      reading.betterQuestion,
      reading.alternativeReading,
      reading.returnPrompt,
      reading.limitation,
      reading.practice?.title,
      reading.practice?.whatToObserve,
      ...steps,
    ].join(" \n "),
  );

  // No fabricated quotation, no clinical claim, no example content.
  if (/["“][^"”]{25,}["”]/.test(everything)) problems.push("fabricated_quotation");
  if (CLINICAL_TERMS.some((term) => everything.includes(term))) problems.push("clinical_claim");
  if (SAMPLE_SENTENCES.some((sentence) => everything.includes(sentence))) {
    problems.push("sample_content_present");
  }

  return [...new Set(problems)];
}

/* -------------------------------------------------------------------------- */
/* Prompt bodies                                                               */
/* -------------------------------------------------------------------------- */

function buildIntake(answers: ReadingAnswers): string {
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
        "Answers to the questions asked before the reading:",
        ...answers.clarifications.map(
          (item) => `Q: ${item.question}\nA: ${item.answer || "Not answered."}`,
        ),
        "These answers are the sharpest material available. Build the interpretation from them.",
      ].join("\n"),
    );
  }
  return parts.join("\n\n");
}

/**
 * Normalises the planner's reply: the schema always returns a supportingConcept
 * object, so an unused one is folded to null here.
 */
export function normalisePlan(plan: ReadingPlan): ReadingPlan {
  const supporting = plan.supportingConcept;
  const unused =
    !supporting ||
    !supporting.id ||
    supporting.id.trim().toLowerCase() === "none" ||
    supporting.name.trim().length === 0;
  return { ...plan, supportingConcept: unused ? null : supporting };
}

function describePlan(plan: ReadingPlan & { __sources?: ReadingSource[] }): string {

  const lines = [
    `Interpretive hypothesis: ${plan.interpretiveHypothesis}`,
    `Central tension: ${plan.centralTension}`,
    "Intake evidence this reading rests on:",
    ...plan.intakeEvidence.map((item) => `- "${item.detail}" matters because ${item.significance}`),
    `Primary concept: ${plan.primaryConcept.name} (${plan.primaryConcept.id}). ${plan.primaryConcept.explanation}`,
  ];
  if (plan.supportingConcept) {
    lines.push(
      `Supporting concept: ${plan.supportingConcept.name} (${plan.supportingConcept.id}). ${plan.supportingConcept.explanation} It is needed because ${plan.supportingConcept.reasonNeeded}`,
    );
  } else {
    lines.push("Supporting concept: none. Use the primary concept only.");
  }
  lines.push(
    `Sources fixed for this reading: ${JSON.stringify(plan.__sources ?? [])}. Reproduce exactly these work and location pairs in the sources field, once each, and cite nothing else.`,
    `Alternative interpretation: ${plan.alternativeInterpretation.summary} Evidence for it: ${plan.alternativeInterpretation.evidenceFor.join("; ")}. Evidence against it: ${plan.alternativeInterpretation.evidenceAgainst.join("; ")}. It would become more likely if ${plan.alternativeInterpretation.whatWouldMakeItMoreLikely}`,
    `The better question must follow this reasoning: ${plan.betterQuestionRationale}`,
    `The practice must test the hypothesis in this way: ${plan.practiceRationale}`,
    `What remains uncertain: ${plan.uncertainty}`,
  );
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* The pipeline                                                                */
/* -------------------------------------------------------------------------- */

function emptyTelemetry(slug: string): ReadingTelemetry {
  return {
    resultType: "error",
    philosopherSlug: slug,
    models: {},
    calls: 0,
    latencyMs: {},
    usage: { promptTokens: 0, completionTokens: 0 },
    validationFailures: [],
    clarificationRequired: false,
    repairAttempted: false,
    repairSucceeded: false,
  };
}

/**
 * Runs the full pipeline for one submission. Never throws for an expected
 * failure: every outcome comes back as a discriminated result.
 */
export async function runReadingPipeline(
  slug: ProfileSlug,
  answers: ReadingAnswers,
): Promise<PipelineOutcome> {
  const models = readingModels();
  const telemetry = emptyTelemetry(slug);
  let usage: Usage = { promptTokens: 0, completionTokens: 0 };

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    console.error("reading.not_configured", { slug });
    return {
      result: { kind: "error", message: READING_ERROR_MESSAGE, retryable: false },
      usage,
      telemetry: { ...telemetry, validationFailures: ["not_configured"] },
    };
  }

  const intake = buildIntake(answers);
  const finish = (result: ReadingResult): PipelineOutcome => {
    const done = { ...telemetry, resultType: result.kind, usage };
    console.info("reading.pipeline", {
      resultType: done.resultType,
      philosopherSlug: done.philosopherSlug,
      models: done.models,
      calls: done.calls,
      latencyMs: done.latencyMs,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      validationFailures: done.validationFailures,
      clarificationRequired: done.clarificationRequired,
      repairAttempted: done.repairAttempted,
      repairSucceeded: done.repairSucceeded,
    });
    return { result, usage, telemetry: done };
  };

  try {
    // Stage one: is there enough here to read?
    const sufficiency = await callJson<SufficiencyReply>({
      apiKey,
      model: models.sufficiency,
      messages: [
        { role: "system", content: SUFFICIENCY_RULES },
        { role: "user", content: intake },
      ],
      schemaName: "sufficiency",
      schema: SUFFICIENCY_SCHEMA,
    });
    usage = addUsage(usage, sufficiency.usage);
    telemetry.calls += 1;
    telemetry.latencyMs["sufficiency"] = sufficiency.latencyMs;

    if ((sufficiency.parsed.safetyFlags ?? []).length > 0) {
      return finish({ kind: "safety", message: READING_SAFETY_MESSAGE });
    }

    const questions = (sufficiency.parsed.questions ?? [])
      .map((question) => question.trim())
      .filter(Boolean)
      .slice(0, 3);
    const alreadyClarified = (answers.clarifications ?? []).some(
      (item) => item.answer.trim().length > 0,
    );
    if (!sufficiency.parsed.sufficientContext && questions.length >= 2 && !alreadyClarified) {
      telemetry.clarificationRequired = true;
      return finish({ kind: "clarification", questions });
    }

    // Stage two: the internal analysis plan.
    telemetry.models.planner = models.planner;
    const planned = await callJson<ReadingPlan>({
      apiKey,
      model: models.planner,
      messages: [
        { role: "system", content: buildPlannerPrompt(slug) },
        { role: "user", content: intake },
      ],
      schemaName: "reading_plan",
      schema: PLAN_SCHEMA,
    });
    usage = addUsage(usage, planned.usage);
    telemetry.calls += 1;
    telemetry.latencyMs["planner"] = planned.latencyMs;

    const plan = normalisePlan(planned.parsed);
    if ((plan.safetyFlags ?? []).length > 0) {
      return finish({ kind: "safety", message: READING_SAFETY_MESSAGE });
    }
    if (plan.sufficientContext === false && questions.length >= 2 && !alreadyClarified) {
      telemetry.clarificationRequired = true;
      return finish({ kind: "clarification", questions });
    }

    const planProblems = validatePlan(slug, plan);
    if (planProblems.length > 0) {
      telemetry.validationFailures = planProblems;
      return finish({ kind: "error", message: READING_ERROR_MESSAGE, retryable: true });
    }

    // Sources are resolved here, from the profile, never from the model.
    const resolved = resolvePlanSources(slug, plan);
    const planWithSources = { ...plan, __sources: resolved } as ReadingPlan & {
      __sources: ReadingSource[];
    };

    // Stage three: write the reading from the fixed plan.
    telemetry.models.writer = models.writer;
    const written = await callJson<WrittenReading>({
      apiKey,
      model: models.writer,
      messages: [
        { role: "system", content: buildWriterPrompt(slug) },
        { role: "user", content: `The reader's intake:\n${intake}` },
        { role: "user", content: `The fixed analysis plan:\n${describePlan(planWithSources)}` },
      ],
      schemaName: "reading",
      schema: READING_SCHEMA,
    });
    usage = addUsage(usage, written.usage);
    telemetry.calls += 1;
    telemetry.latencyMs["writer"] = written.latencyMs;

    let reading = written.parsed;
    let problems = validateReading({ slug, plan, reading, answers });
    telemetry.validationFailures = problems;

    // Stage four: at most one repair call. Nothing is merged from the rejected reply.
    if (problems.length > 0) {
      telemetry.repairAttempted = true;
      telemetry.models.repair = models.repair;
      const repaired = await callJson<WrittenReading>({
        apiKey,
        model: models.repair,
        messages: [
          { role: "system", content: buildWriterPrompt(slug) },
          { role: "user", content: `The reader's intake:\n${intake}` },
          { role: "user", content: `The fixed analysis plan:\n${describePlan(planWithSources)}` },
          { role: "assistant", content: JSON.stringify(reading) },
          {
            role: "user",
            content: [
              "That reading failed validation and was rejected. Write it again completely, returning every required field.",
              `Validation failures: ${problems.join(", ")}.`,
              "Do not keep any part of the rejected version that caused a failure, and do not pad the reading to fix a length problem.",
              "The plan above is fixed. Do not select different concepts and do not cite anything outside the sources it names.",
            ].join("\n"),
          },
        ],
        schemaName: "reading",
        schema: READING_SCHEMA,
      });
      usage = addUsage(usage, repaired.usage);
      telemetry.calls += 1;
      telemetry.latencyMs["repair"] = repaired.latencyMs;

      reading = repaired.parsed;
      problems = validateReading({ slug, plan, reading, answers });
      telemetry.validationFailures = problems;
      telemetry.repairSucceeded = problems.length === 0;

      if (problems.length > 0) {
        return finish({ kind: "error", message: READING_ERROR_MESSAGE, retryable: true });
      }
    }

    return finish({ kind: "reading", reading: assemble(slug, reading, resolved) });
  } catch (error) {
    const retryable = error instanceof GatewayError ? error.retryable : true;
    telemetry.validationFailures = [
      error instanceof GatewayError ? `gateway_${error.status}` : "unexpected_error",
    ];
    if (!(error instanceof GatewayError)) console.error("reading.unexpected_error", error);
    return finish({ kind: "error", message: READING_ERROR_MESSAGE, retryable });
  }
}

/** Plan level checks that do not need the written reading. */
export function validatePlan(slug: ProfileSlug, plan: ReadingPlan): string[] {
  const problems: string[] = [];
  const conceptIds = new Set(profileConceptIds(slug));
  const sourceIds = new Set(profileSourceIds(slug));

  if (!plan.primaryConcept?.id || !conceptIds.has(plan.primaryConcept.id)) {
    problems.push("primary_concept_not_in_profile");
  }
  if (plan.supportingConcept && !conceptIds.has(plan.supportingConcept.id)) {
    problems.push("supporting_concept_not_in_profile");
  }
  if (plan.supportingConcept && plan.supportingConcept.id === plan.primaryConcept?.id) {
    problems.push("supporting_concept_duplicates_primary");
  }
  if ((plan.intakeEvidence ?? []).filter((item) => item?.detail?.trim()).length < 2) {
    problems.push("plan_evidence_too_thin");
  }
  if ((plan.interpretiveHypothesis ?? "").trim().length < 20) problems.push("plan_hypothesis_missing");
  if ((plan.alternativeInterpretation?.summary ?? "").trim().length < 20) {
    problems.push("plan_alternative_missing");
  }

  const cited = [
    ...(plan.primaryConcept?.sourceIds ?? []),
    ...(plan.supportingConcept?.sourceIds ?? []),
  ];
  if (cited.length === 0) problems.push("plan_has_no_sources");
  for (const id of cited) {
    if (!sourceIds.has(id)) problems.push("plan_source_not_in_profile");
  }
  // A source may only be cited by a concept that permits it.
  for (const concept of [plan.primaryConcept, plan.supportingConcept]) {
    if (!concept) continue;
    const permitted = new Set(conceptSourceIds(slug, concept.id));
    for (const id of concept.sourceIds ?? []) {
      if (!permitted.has(id)) problems.push("plan_source_does_not_support_concept");
    }
  }

  return [...new Set(problems)];
}

/** Turns the plan's source ids into verified work and location pairs. */
export function resolvePlanSources(slug: ProfileSlug, plan: ReadingPlan): ReadingSource[] {
  const profile = getProfile(slug);
  const ids = [
    ...(plan.primaryConcept?.sourceIds ?? []),
    ...(plan.supportingConcept?.sourceIds ?? []),
  ];
  const out: ReadingSource[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const source = profile.sources[id];
    if (!source) continue;
    const key = `${source.work}|${source.location}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ work: source.work, location: source.location });
  }
  return out;
}

function assemble(
  slug: ProfileSlug,
  reading: WrittenReading,
  sources: ReadingSource[],
): GeneratedReading {
  const profile = getProfile(slug);
  return {
    philosopherSlug: slug,
    title: reading.title.trim(),
    bearing: reading.bearing.trim(),
    throughLens: reading.throughLens.trim(),
    conceptsUsed: reading.conceptsUsed.map((name) => name.trim()).filter(Boolean).slice(0, 2),
    // The rendered citation always comes from the profile, never from the model.
    sources,
    betterQuestion: reading.betterQuestion.trim(),
    practice: {
      title: reading.practice.title.trim(),
      duration: reading.practice.duration.trim(),
      steps: cleanSteps(reading.practice.steps),
      whatToObserve: reading.practice.whatToObserve.trim(),
    },
    alternativeReading: reading.alternativeReading.trim(),
    returnPrompt: reading.returnPrompt.trim(),
    limitation: reading.limitation.trim(),
    intakeEvidenceUsed: (reading.intakeEvidenceUsed ?? []).map((item) => item.trim()).filter(Boolean),
    citation: renderCitation(slug, sources),
    lensName: profile.approach,
    note: DISCLAIMER,
  };
}

/** Strips internal validation material before a reading leaves the server. */
export function forClient(reading: GeneratedReading): GeneratedReading {
  return { ...reading, intakeEvidenceUsed: [] };
}

/* -------------------------------------------------------------------------- */
/* Follow up questions on a saved reading                                      */
/* -------------------------------------------------------------------------- */

export type FollowUpResult = { answer: string; usage: Usage };

const FOLLOW_UP_RULES = `
The reader has already received a full reading and is now asking one further question about it.

Rules for this reply:
- Answer only what they asked. Do not restate the reading and do not repeat its sections.
- Hold to the same central interpretation the reading argued for. Extend or correct it if their question gives you reason to, and say plainly when it does.
- Two or three short paragraphs at most. Plain prose, no headings, no lists, no markdown.
- Speak directly to the reader as "you". Never write in the philosopher's first person.
- Stay inside the same method. If the question falls outside what that method can address, say so plainly and give what the method can offer.
- Where it helps, adjust or replace the experiment with one concrete revised step.
- Cite a work and section only when you are sure of it. Never invent a quotation.
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
    method?: string | null;
    question: string;
    exercise?: string | null;
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
    "The reading they received:",
    `Its title: ${input.reading.headline}`,
    `The bearing: ${input.reading.noticed}`,
    `Through the thinker: ${input.reading.method || "Not recorded."}`,
    `What it could have wrong: ${input.reading.limits || "Not recorded."}`,
    `The practice: ${input.reading.exercise || "Not recorded."}`,
    `The better question: ${input.reading.question}`,
  ].join("\n");

  const messages: Message[] = [
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
    body: JSON.stringify({ model: FOLLOW_UP_MODEL, messages }),
  });

  if (response.status === 429) throw new Error("The Lyceum is busy. Try again in a moment.");
  if (!response.ok) {
    console.error("followup.gateway_error", { status: response.status });
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
