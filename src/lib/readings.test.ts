import { describe, expect, it } from "vitest";

import {
  ACTIVE_SLUGS,
  RETIRED_SLUGS,
  conceptSourceIds,
  getProfile,
  profileConceptIds,
  renderCitation,
} from "./philosopher-profiles.server";
import {
  SAMPLE_SENTENCES,
  cleanSteps,
  normalisePlan,
  resolvePlanSources,
  validatePlan,
  validateReading,
  type ReadingPlan,
} from "./readings.server";
import {
  READING_ERROR_MESSAGE,
  READING_QUOTA_MESSAGE,
  type ReadingAnswers,
  type ReadingResult,
} from "./reading-types";

const answers: ReadingAnswers = {
  situation:
    "I turned down the Berlin transfer because my sister is in her last year of treatment, and I have told my manager twice that I want the next senior role. Every week I cancel the mentoring sessions that would qualify me for it, and I tell myself the hospital visits make it impossible.",
  tried:
    "I tried blocking the mentoring sessions in my calendar at seven in the morning, and I stopped after two weeks.",
  stakes:
    "If I keep cancelling, I will still be in the same seat next year and I will resent my sister for a choice I actually made.",
  kind: "A recurring pattern",
  duration: "Months",
  clarifications: [],
};

const plan: ReadingPlan = {
  sufficientContext: true,
  intakeEvidence: [
    {
      detail: "cancels the mentoring sessions every week",
      significance: "the repeated act is the one shaping the reader's working character",
    },
    {
      detail: "turned down the Berlin transfer while the sister is in treatment",
      significance: "the sacrifice is real and is being used to explain a separate avoidance",
    },
  ],
  centralTension:
    "The reader treats one genuine sacrifice as an explanation for a second, unrelated withdrawal.",
  interpretiveHypothesis:
    "The reader may be using the mentoring cancellations to avoid testing whether they are ready for the senior role, and reading that avoidance as caregiving.",
  primaryConcept: {
    id: "habituation",
    name: "Habituation",
    explanation:
      "The weekly cancellation is the act that forms the disposition, whatever the stated intention about the senior role is.",
    sourceIds: ["NE-II-1-6"],
  },
  supportingConcept: {
    id: "phronesis",
    name: "Practical wisdom",
    explanation:
      "Deliberation about this particular week is where the reader's judgment about mentoring and the hospital actually happens.",
    sourceIds: ["NE-VI-5"],
    reasonNeeded:
      "Habituation alone would not show that the reader is deliberating badly about a specific week rather than lacking a general commitment.",
  },
  alternativeInterpretation: {
    summary:
      "The mentoring cancellations may be an accurate reading of a real limit on the reader's hours during their sister's treatment, not an avoidance of the senior role at all.",
    evidenceFor: ["the treatment year is genuinely constrained"],
    evidenceAgainst: ["the reader chose a seven in the morning slot that the hospital does not touch"],
    whatWouldMakeItMoreLikely:
      "If the cancelled sessions collided with hospital appointments rather than with early mornings.",
  },
  betterQuestionRationale:
    "The question must ask what the weekly cancellation is building rather than whether the reader is committed to the senior role.",
  practiceRationale:
    "The practice must separate the mentoring cancellation from the hospital schedule so the reader can see which one actually forces the other.",
  uncertainty: "Whether the reader's manager treats mentoring as the real qualification.",
  safetyFlags: [],
};

const reading = {
  title:
    "You may be letting one real sacrifice explain a second withdrawal it never caused",
  bearing:
    "You cancel the mentoring sessions every week, and you explain those cancellations with your sister's treatment. Both things are true, and only one of them is doing the work you think it is. You turned down the Berlin transfer for your sister, and that was a decision with a cost you actually paid. The mentoring sessions are different. You chose a seven in the morning slot that the hospital never touches, you held it for two weeks, and you let it go. What has repeated since is not caregiving. It is a weekly withdrawal from the one activity that would test whether you are ready for the senior role you say you want, and the treatment year has become the sentence you use to describe it to yourself and to your manager.",
  throughLens:
    "Aristotle would not ask you whether you want the senior role. He would ask what the cancelled mentoring session, repeated for months, is forming in you. Character is built out of the acts a life keeps repeating, so a disposition towards withdrawal is being built by every week you let that early slot pass, whatever your stated intention is. Practical wisdom is exercised in the particular week, not in the general commitment, and your deliberation about this particular week keeps resolving the same way. That changes the problem. You do not have a motivation problem that better resolve would fix; you have a pattern of small deliberations that keep producing the same withdrawal while the sacrifice for your sister covers it.",
  conceptsUsed: ["Habituation", "Practical wisdom"],
  sources: [
    { work: "Nicomachean Ethics", location: "II.1-6" },
    { work: "Nicomachean Ethics", location: "VI.5" },
  ],
  betterQuestion:
    "What disposition is each cancelled mentoring session quietly forming in you, and would your sister's treatment survive being named as the reason?",
  practice: {
    title: "Separate the two calendars",
    duration: "Two weeks",
    steps: [
      "Each week, before you cancel the mentoring session, write down the exact hospital or treatment obligation that makes that specific hour impossible.",
      "When no obligation collides with the hour, keep the session and note what you felt in the twenty minutes before it.",
      "At the end of the second week, count how many cancellations had a collision behind them and how many did not.",
    ],
    whatToObserve:
      "Whether the cancellations cluster around real treatment appointments, or around the sessions where your readiness for the senior role would have been visible to your manager.",
  },
  alternativeReading:
    "It may be that the mentoring sessions really are unaffordable during your sister's treatment year, and that the early slot failed for ordinary reasons of exhaustion rather than avoidance of the senior role.",
  returnPrompt:
    "Come back after the second week with the count of collisions, and with the one session you most wanted to cancel when nothing was in the way.",
  limitation:
    "This reads the cancelled mentoring sessions as avoidance of the senior role. If your manager treats mentoring as optional, the pattern may be an accurate response to your workplace rather than a fact about your character.",
  intakeEvidenceUsed: [
    "cancels the mentoring sessions every week",
    "turned down the Berlin transfer while the sister is in treatment",
  ],
};

function withReading(patch: Record<string, unknown>) {
  return validateReading({
    slug: "aristotle",
    plan,
    reading: { ...reading, ...patch } as typeof reading,
    answers,
  });
}

describe("the active lineup", () => {
  it("has exactly six approaches and no Epictetus", () => {
    expect(ACTIVE_SLUGS).toEqual([
      "aristotle",
      "socrates",
      "marcus-aurelius",
      "plato",
      "nietzsche",
      "carl-jung",
    ]);
    expect(RETIRED_SLUGS).not.toContain("epictetus");
  });

  it("keeps Nietzsche and Jung distinct", () => {
    const nietzsche = profileConceptIds("nietzsche");
    const jung = profileConceptIds("carl-jung");
    expect(nietzsche.some((id) => jung.includes(id))).toBe(false);
    expect(getProfile("nietzsche").distinctionRules["carl-jung"]).toBeTruthy();
    expect(getProfile("carl-jung").distinctionRules["nietzsche"]).toBeTruthy();
  });

  it("only allows friendship concepts to reach Books VIII-IX", () => {
    expect(conceptSourceIds("aristotle", "habituation")).not.toContain("NE-VIII-IX");
    expect(conceptSourceIds("aristotle", "friendship")).toContain("NE-VIII-IX");
  });

  it("blocks Aristotle from reducing material constraint to weak habit", () => {
    const prohibited = getProfile("aristotle").prohibitedSimplifications.join(" ").toLowerCase();
    expect(prohibited).toMatch(/constraint|material|circumstance/);
  });
});

describe("citations", () => {
  it("renders one work with its locations joined", () => {
    expect(
      renderCitation("aristotle", [
        { work: "Nicomachean Ethics", location: "II.1-6" },
        { work: "Nicomachean Ethics", location: "VI.5" },
      ]),
    ).toBe("Grounded in Aristotle's Nicomachean Ethics, II.1-6 and VI.5.");
  });

  it("resolves plan source ids to verified pairs without repeats", () => {
    expect(resolvePlanSources("aristotle", plan)).toEqual([
      { work: "Nicomachean Ethics", location: "II.1-6" },
      { work: "Nicomachean Ethics", location: "VI.5" },
    ]);
  });
});

describe("plan validation", () => {
  it("accepts a grounded plan", () => {
    expect(validatePlan("aristotle", plan)).toEqual([]);
  });

  it("rejects a concept outside the profile", () => {
    const bad = { ...plan, primaryConcept: { ...plan.primaryConcept, id: "shadow" } };
    expect(validatePlan("aristotle", bad)).toContain("primary_concept_not_in_profile");
  });

  it("rejects a source that does not support the concept used", () => {
    const bad = {
      ...plan,
      primaryConcept: { ...plan.primaryConcept, sourceIds: ["NE-VIII-IX"] },
    };
    expect(validatePlan("aristotle", bad)).toContain("plan_source_does_not_support_concept");
  });

  it("rejects a plan resting on a single detail", () => {
    const bad = { ...plan, intakeEvidence: [plan.intakeEvidence[0]!] };
    expect(validatePlan("aristotle", bad)).toContain("plan_evidence_too_thin");
  });

  it("folds an unused supporting concept to null", () => {
    const raw = {
      ...plan,
      supportingConcept: { id: "none", name: "", explanation: "", sourceIds: [], reasonNeeded: "" },
    };
    expect(normalisePlan(raw).supportingConcept).toBeNull();
  });
});

describe("reading validation", () => {
  it("accepts a complete, grounded reading", () => {
    expect(validateReading({ slug: "aristotle", plan, reading, answers })).toEqual([]);
  });

  it("rejects a partial response instead of filling it in", () => {
    expect(withReading({ limitation: "" })).toContain("missing_limitation");
    expect(withReading({ practice: { ...reading.practice, steps: [] } })).toContain(
      "missing_practice_steps",
    );
  });

  it("requires at least two concrete intake details", () => {
    expect(withReading({ intakeEvidenceUsed: ["the reader's situation"] })).toContain(
      "intake_evidence_not_grounded",
    );
  });

  it("rejects sample fallback sentences", () => {
    expect(
      withReading({
        bearing: `${reading.bearing} You describe a gap between what you say matters and what your week repeatedly rewards.`,
      }),
    ).toContain("sample_content_present");
    expect(SAMPLE_SENTENCES).toHaveLength(4);
  });

  it("rejects a concept the plan never selected", () => {
    expect(withReading({ conceptsUsed: ["Shadow"] })).toContain("concept_not_in_plan");
  });

  it("rejects an irrelevant citation", () => {
    expect(
      withReading({ sources: [{ work: "Nicomachean Ethics", location: "VIII-IX" }] }),
    ).toContain("source_does_not_support_concept");
  });

  it("rejects a duplicated citation", () => {
    expect(
      withReading({
        sources: [
          { work: "Nicomachean Ethics", location: "II.1-6" },
          { work: "Nicomachean Ethics", location: "II.1-6" },
        ],
      }),
    ).toContain("duplicate_source");
  });

  it("rejects a citation not in the profile", () => {
    expect(withReading({ sources: [{ work: "Meditations", location: "Book II" }] })).toContain(
      "source_not_in_profile",
    );
  });

  it("rejects a generic title", () => {
    expect(withReading({ title: "You are navigating uncertainty about your future" })).toContain(
      "title_generic",
    );
  });

  it("rejects a default journalling practice the plan never justified", () => {
    expect(
      withReading({
        practice: {
          ...reading.practice,
          title: "Journal each evening",
          steps: [
            "Journal about the mentoring sessions each evening for a week.",
            "Journal about your sister's treatment as well.",
          ],
        },
      }),
    ).toContain("practice_is_default_action");
  });

  it("rejects a boilerplate limitation", () => {
    expect(
      withReading({
        limitation:
          "Of course, systemic barriers and unforeseen circumstances may always change how any of this applies to you.",
      }),
    ).toContain("limitation_generic");
  });

  it("rejects a fabricated quotation", () => {
    expect(
      withReading({
        throughLens: `${reading.throughLens} Aristotle writes, "the cancelled hour is the hour that forms the man you become".`,
      }),
    ).toContain("fabricated_quotation");
  });

  it("rejects a clinically authoritative claim", () => {
    expect(
      withReading({
        bearing: `${reading.bearing} You are showing symptoms of a diagnosable avoidant personality disorder.`,
      }),
    ).toContain("clinical_claim");
  });
});

describe("practice steps", () => {
  it("strips hard coded numbering so only one system renders", () => {
    expect(cleanSteps(["01 Write it down", "2. Keep the session", "  ", "03. Count them"])).toEqual([
      "Write it down",
      "Keep the session",
      "Count them",
    ]);
  });
});

describe("the quota outcome", () => {
  it("is its own result kind, distinct from a generation error", () => {
    const quota: ReadingResult = { kind: "quota", message: READING_QUOTA_MESSAGE };
    const failure: ReadingResult = {
      kind: "error",
      message: READING_ERROR_MESSAGE,
      retryable: true,
    };
    expect(quota.kind).not.toBe(failure.kind);
    expect(READING_QUOTA_MESSAGE).not.toContain("couldn't prepare");
    expect(READING_QUOTA_MESSAGE).toContain("free readings");
  });

  it("keeps the explicit failure message available for display", () => {
    expect(READING_ERROR_MESSAGE).toContain("Your answers have been preserved");
  });
});
