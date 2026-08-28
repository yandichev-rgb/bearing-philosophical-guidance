/**
 * Server-only philosopher profiles. These structured profiles never reach the
 * browser. Each one describes the philosopher's actual method: the concepts it
 * may use, the verified sources those concepts rest on, the diagnostic moves
 * that make the approach distinctive, and the simplifications that must be
 * blocked. Quotation is forbidden: a reading interprets ideas, it never
 * impersonates a voice.
 */

export type ProfileSlug =
  | "aristotle"
  | "socrates"
  | "marcus-aurelius"
  | "plato"
  | "nietzsche"
  | "carl-jung";

export type PhilosopherConcept = {
  id: string;
  name: string;
  definition: string;
  sourceIds: string[];
  appropriateWhen: string[];
  inappropriateWhen: string[];
  commonDistortions: string[];
};

export type PhilosopherSource = {
  work: string;
  location: string;
  relevantIdeas: string[];
};

export type PhilosopherProfile = {
  slug: ProfileSlug;
  name: string;
  approach: string;
  centralConcern: string;
  concepts: PhilosopherConcept[];
  diagnosticMoves: string[];
  practicePatterns: string[];
  prohibitedSimplifications: string[];
  distinctionRules: Record<string, string>;
  sources: Record<string, PhilosopherSource>;
  examples: { strong: string[]; weak: string[] };
};

/**
 * Slugs that used to exist. Kept only so a saved reading written under one of
 * them still renders and still answers follow ups. No profile is generated for
 * them and they can never be selected.
 */
export const RETIRED_SLUGS: string[] = ["seneca"];

const PROFILES: Record<ProfileSlug, PhilosopherProfile> = {
  aristotle: {
    slug: "aristotle",
    name: "Aristotle",
    approach: "Virtue ethics",
    centralConcern:
      "What kind of person the reader's repeated choices are actually forming, and whether their practical judgment is tracking the good they say they want.",
    concepts: [
      {
        id: "habituation",
        name: "Habituation",
        definition:
          "Character is formed by what is repeatedly done, not by what is intended. A disposition is built by the acts that express it, so the acts a life keeps repeating are the ones shaping who the person is becoming.",
        sourceIds: ["NE-II-1-6"],
        appropriateWhen: [
          "The reader describes a pattern they keep repeating despite stating a contrary intention.",
          "A choice is small in itself but recurs weekly or daily.",
        ],
        inappropriateWhen: [
          "The obstacle described is material, structural, or imposed by someone else's power rather than by the reader's repeated choices.",
          "The situation is a single unrepeated event.",
        ],
        commonDistortions: [
          "Reducing the reading to habit-stacking or productivity advice.",
          "Telling a reader with a real external constraint that they simply have bad habits.",
        ],
      },
      {
        id: "mean",
        name: "The mean relative to us",
        definition:
          "Each virtue sits between an excess and a deficiency, and where it sits depends on this person in this situation, not on a fixed rule. The corrective usually runs against the direction a person already leans.",
        sourceIds: ["NE-II-1-6"],
        appropriateWhen: [
          "The reader is plainly overshooting or undershooting in one identifiable respect.",
          "Two apparently opposite counsels both seem partly right.",
        ],
        inappropriateWhen: [
          "There is no identifiable excess or deficiency, only a genuine dilemma between two goods.",
        ],
        commonDistortions: [
          "Treating the mean as moderation, balance, or splitting the difference.",
          "Recommending a generic middle path with no named excess and deficiency.",
        ],
      },
      {
        id: "phronesis",
        name: "Practical wisdom",
        definition:
          "The capacity to perceive what this particular situation calls for and to act on it. It cannot be replaced by a rule, and it is acquired through deliberation on real cases with real consequences.",
        sourceIds: ["NE-VI-5"],
        appropriateWhen: [
          "The reader knows the general principle but keeps misjudging the particular case.",
          "The reader is looking for a rule where perception is what is missing.",
        ],
        inappropriateWhen: [
          "The reader's difficulty is motivational rather than perceptual.",
        ],
        commonDistortions: [
          "Presenting practical wisdom as intuition or gut feeling.",
          "Using it to bless whatever the reader already wanted to do.",
        ],
      },
      {
        id: "eudaimonia",
        name: "Flourishing as activity",
        definition:
          "A good life is an activity carried out well over a whole life, not a state that is reached and held. It is measured across time rather than in a moment of feeling.",
        sourceIds: ["NE-I-7"],
        appropriateWhen: [
          "The reader is treating a good life as an outcome to arrive at rather than something being lived now.",
          "The reader measures a whole life by how a single stretch of it currently feels.",
        ],
        inappropriateWhen: [
          "The reader's question is about one bounded decision with no bearing on the shape of a life.",
        ],
        commonDistortions: [
          "Turning flourishing into happiness, wellbeing, or self-actualisation.",
          "Promising that the reader will feel better.",
        ],
      },
      {
        id: "friendship",
        name: "Friendship",
        definition:
          "Relationships differ by what holds them together: usefulness, pleasure, or shared commitment to each other's character. Only the last survives change in circumstances.",
        sourceIds: ["NE-VIII-IX"],
        appropriateWhen: [
          "The interpretation genuinely turns on the nature of a specific relationship.",
        ],
        inappropriateWhen: [
          "The reading is about work, character, or a decision in which another person merely appears.",
        ],
        commonDistortions: [
          "Citing friendship for any reading that mentions another person.",
        ],
      },
    ],
    diagnosticMoves: [
      "Ask what disposition the reader's repeated actions are actually building, as distinct from the one they say they are pursuing.",
      "Name the specific excess and the specific deficiency the reader is moving between, rather than recommending balance.",
      "Test whether the difficulty is a failure of perception in the particular case or a failure of motivation.",
      "Judge the pattern across the length of a life rather than by how the present week feels.",
    ],
    practicePatterns: [
      "A small repeated act, performed in a named real setting, that would build the disposition under discussion.",
      "A deliberate correction in the direction opposite to the reader's identified lean, run once and observed.",
      "A single concrete decision made by perception of the particular case rather than by the reader's usual rule.",
    ],
    prohibitedSimplifications: [
      "Never reduce Aristotle to the claim that habits determine everything.",
      "Never treat a material, financial, or structural constraint as though it were a weak habit or a failure of character.",
      "Never present the mean as moderation or as compromise.",
      "Never turn the reading into productivity, routine design, or habit tracking advice.",
    ],
    distinctionRules: {
      socrates:
        "Aristotle asks what the reader's repeated actions are forming. Socrates asks whether the reader can define the term they are relying on.",
      "marcus-aurelius":
        "Aristotle works on character over a lifetime. Marcus works on the judgment added to a present event and the duty in front of the reader now.",
      plato:
        "Aristotle starts from what this person actually does. Plato starts from the ideal the choice is oriented toward and judges the case against it.",
      nietzsche:
        "Aristotle asks whether a disposition is well formed. Nietzsche asks where the standard doing the judging came from and whom it serves.",
      "carl-jung":
        "Aristotle treats the reader's conduct as character in formation. Jung treats it as a conscious identity in tension with what it excludes.",
    },
    sources: {
      "NE-I-7": {
        work: "Nicomachean Ethics",
        location: "I.7",
        relevantIdeas: ["Flourishing as activity of the soul over a complete life"],
      },
      "NE-II-1-6": {
        work: "Nicomachean Ethics",
        location: "II.1-6",
        relevantIdeas: ["Habituation", "Virtue and vice", "The mean relative to us"],
      },
      "NE-VI-5": {
        work: "Nicomachean Ethics",
        location: "VI.5",
        relevantIdeas: ["Practical wisdom and deliberation about particulars"],
      },
      "NE-VIII-IX": {
        work: "Nicomachean Ethics",
        location: "VIII-IX",
        relevantIdeas: ["Friendship of utility, pleasure, and character"],
      },
    },
    examples: {
      strong: [
        "Naming the exact recurring act, the disposition it builds, and the counter-act that would test whether the disposition is really the one at work.",
        "Identifying that the reader knows the principle and misperceives the case, then designing an experiment about perception rather than resolve.",
      ],
      weak: [
        "Advising the reader to build better habits.",
        "Recommending balance or moderation with no named excess and deficiency.",
        "Citing friendship because a colleague is mentioned.",
      ],
    },
  },

  socrates: {
    slug: "socrates",
    name: "Socrates",
    approach: "Socratic inquiry",
    centralConcern:
      "Whether the reader can actually define the term their whole situation rests on, and what follows once that definition meets a counterexample.",
    concepts: [
      {
        id: "definition",
        name: "Definition",
        definition:
          "Before a question can be answered, the key term in it must be defined: not by examples, but by what makes every instance an instance. Most difficulties dissolve or change shape once the term is stated.",
        sourceIds: ["MENO", "EUTHYPHRO"],
        appropriateWhen: [
          "The reader's situation turns on a loaded word they have not defined, such as ready, fair, enough, or supportive.",
        ],
        inappropriateWhen: [
          "The reader has already given a precise account and the difficulty is elsewhere.",
        ],
        commonDistortions: [
          "Asking for a dictionary definition rather than the reader's operative one.",
          "Supplying the definition instead of testing the reader's.",
        ],
      },
      {
        id: "elenchus",
        name: "Testing by counterexample",
        definition:
          "A claim is tested by finding a case the claim would have to cover and does not. The counterexample is drawn from the reader's own account, not invented.",
        sourceIds: ["EUTHYPHRO", "MENO"],
        appropriateWhen: [
          "The reader states a general rule that their own reported behaviour breaks.",
        ],
        inappropriateWhen: [
          "The reader is in acute distress and needs orientation rather than cross-examination.",
        ],
        commonDistortions: [
          "Using counterexample to score a point rather than to refine the claim.",
        ],
      },
      {
        id: "contradiction",
        name: "Contradiction between held beliefs",
        definition:
          "Two things the reader believes, or one belief and one settled behaviour, cannot both be held. Making the conflict explicit is the work; choosing between them is the reader's.",
        sourceIds: ["APOLOGY", "MENO"],
        appropriateWhen: [
          "The reader states a value and reports acting steadily against it.",
        ],
        inappropriateWhen: [
          "The apparent conflict resolves once a term is defined more carefully.",
        ],
        commonDistortions: [
          "Calling ordinary ambivalence a contradiction.",
        ],
      },
      {
        id: "aporia",
        name: "Acknowledged ignorance",
        definition:
          "Recognising that one does not know is a real result, and a better position than confident false knowledge. It is not a rhetorical modesty but the honest end of a failed definition.",
        sourceIds: ["APOLOGY"],
        appropriateWhen: [
          "The reader is acting on a confident claim to know something they cannot support.",
        ],
        inappropriateWhen: [
          "The reader is already paralysed by uncertainty and claims no knowledge at all.",
        ],
        commonDistortions: [
          "Turning acknowledged ignorance into an excuse for indecision.",
        ],
      },
    ],
    diagnosticMoves: [
      "Isolate the single loaded word the reader's account depends on and ask what they take it to mean.",
      "Find the counterexample inside the reader's own report that their stated rule cannot cover.",
      "Set two of the reader's own claims side by side and show that both cannot stand.",
      "Distinguish what the reader knows from what they have assumed and never examined.",
    ],
    practicePatterns: [
      "Write out the operative definition in one sentence, then look for the case in the reader's own recent life that it fails to cover.",
      "State the rule to another person involved and ask them where it does not hold.",
      "Act once on the stricter definition and see whether the situation still looks the same.",
    ],
    prohibitedSimplifications: [
      "Never supply the conclusion. The reading examines, it does not resolve.",
      "Never present Socrates as merely asking lots of questions.",
      "Never claim Socrates wrote anything. The method is drawn from his portrayal in Plato's dialogues.",
      "Never adopt a combative or gotcha tone.",
    ],
    distinctionRules: {
      aristotle:
        "Socrates tests the definition the reader relies on. Aristotle asks what their repeated conduct is forming.",
      plato:
        "Socrates stops at the tested definition and honest uncertainty. Plato builds a positive account of the good the choice aims at.",
      "marcus-aurelius":
        "Socrates examines the claim. Marcus separates the event from the judgment and turns to present duty.",
      nietzsche:
        "Socrates asks whether the belief is coherent. Nietzsche asks where it came from and whose interest it serves.",
      "carl-jung":
        "Socrates works with what the reader consciously claims. Jung works with what the conscious claim excludes.",
    },
    sources: {
      APOLOGY: {
        work: "Plato's Apology",
        location: "21b-23b",
        relevantIdeas: ["Acknowledged ignorance", "The examined life"],
      },
      EUTHYPHRO: {
        work: "Plato's Euthyphro",
        location: "6d-11b",
        relevantIdeas: ["Definition by essence rather than example", "Refutation by counterexample"],
      },
      MENO: {
        work: "Plato's Meno",
        location: "70a-80d",
        relevantIdeas: ["The demand for a definition before an answer", "Productive perplexity"],
      },
    },
    examples: {
      strong: [
        "Isolating the reader's use of ready, showing the case in their own account where their definition fails, and leaving the definition open.",
      ],
      weak: [
        "Asking three vague open questions and calling it Socratic.",
        "Announcing what the reader really believes.",
      ],
    },
  },

  "marcus-aurelius": {
    slug: "marcus-aurelius",
    name: "Marcus Aurelius",
    approach: "Stoic perspective",
    centralConcern:
      "The judgment the reader has added to an event, and what their actual duty in the present hour is once that judgment is set aside.",
    concepts: [
      {
        id: "judgment",
        name: "Event and judgment",
        definition:
          "What happened and what the reader has concluded about what it means are two different things. The distress usually attaches to the second, which can be examined and withdrawn.",
        sourceIds: ["MED-IV", "MED-VIII"],
        appropriateWhen: [
          "The reader reports an event together with a verdict about themselves or their future.",
        ],
        inappropriateWhen: [
          "The harm described is material and ongoing rather than interpretive.",
        ],
        commonDistortions: [
          "Implying the reader should not feel what they feel.",
          "Collapsing this into generic advice about controlling what you can control.",
        ],
      },
      {
        id: "present-duty",
        name: "The task in front of you",
        definition:
          "Action belongs to the present. The relevant question is what this hour asks of the reader, done well, rather than what the whole future requires.",
        sourceIds: ["MED-II", "MED-VIII"],
        appropriateWhen: [
          "The reader is immobilised by the scale of a decision that has near-term parts.",
        ],
        inappropriateWhen: [
          "The reader is already over-focused on immediate tasks and avoiding the larger question.",
        ],
        commonDistortions: [
          "Turning this into productivity advice or a to-do list.",
        ],
      },
      {
        id: "social-duty",
        name: "Work owed to others",
        definition:
          "A person is part of a shared body, and much of what is worth doing is owed to the people they are bound to. Withdrawal is rarely the Stoic answer.",
        sourceIds: ["MED-II", "MED-V"],
        appropriateWhen: [
          "The reader is weighing withdrawal from a role or a relationship they are genuinely obliged within.",
        ],
        inappropriateWhen: [
          "The obligation described is being used to keep the reader in a harmful situation.",
        ],
        commonDistortions: [
          "Using duty to argue that the reader should endure mistreatment.",
        ],
      },
      {
        id: "perspective",
        name: "The wider view and mortality",
        definition:
          "Seen against the length of time and the fact of death, some concerns shrink and others become urgent. The point is proportion, not consolation or detachment.",
        sourceIds: ["MED-IV", "MED-V"],
        appropriateWhen: [
          "The reader has given something small a weight that is distorting their whole account.",
        ],
        inappropriateWhen: [
          "The reader is facing bereavement, serious illness, or genuine loss, where this reads as dismissal.",
        ],
        commonDistortions: [
          "Using cosmic perspective to minimise something that genuinely matters.",
        ],
      },
    ],
    diagnosticMoves: [
      "Separate the bare event from the verdict the reader has added to it, and state each in one line.",
      "Ask what this present hour or this week actually asks of the reader, stripped of the whole future.",
      "Name the people the reader is genuinely bound to and what is owed to them here.",
      "Set the concern against the length of a life to test whether the weight given to it is proportionate.",
    ],
    practicePatterns: [
      "State the event without any interpretation, then state the added judgment, and act once on the bare event alone.",
      "Do the single piece of the work that this week genuinely asks for, and notice whether the larger dread changes.",
      "Carry out one thing owed to another person in the situation and observe what it settles.",
    ],
    prohibitedSimplifications: [
      "Never reduce this to a taxonomy of what is and is not in your control.",
      "Never counsel emotional suppression or indifference.",
      "Never use perspective or mortality to dismiss real loss.",
      "Never produce generic Stoic maxims in place of a reading of this situation.",
    ],
    distinctionRules: {
      aristotle:
        "Marcus works on the judgment and the present duty. Aristotle works on the disposition being formed over years.",
      socrates:
        "Marcus separates event from judgment. Socrates tests whether the judgment's key term can even be defined.",
      plato:
        "Marcus asks what is owed now. Plato asks which part of the soul is governing and toward what ideal.",
      nietzsche:
        "Marcus asks the reader to accept what is not theirs to change. Nietzsche asks who benefits from them accepting it.",
      "carl-jung":
        "Marcus addresses conscious judgment directly. Jung asks what the conscious position is leaving out.",
    },
    sources: {
      "MED-II": {
        work: "Meditations",
        location: "Book II",
        relevantIdeas: ["The task of the present hour", "Work owed to others"],
      },
      "MED-IV": {
        work: "Meditations",
        location: "Book IV",
        relevantIdeas: ["Withdrawing the added judgment", "Proportion through the wider view"],
      },
      "MED-V": {
        work: "Meditations",
        location: "Book V",
        relevantIdeas: ["Rising to the work of a human being", "Social nature"],
      },
      "MED-VIII": {
        work: "Meditations",
        location: "Book VIII",
        relevantIdeas: ["Harm lies in the opinion of harm", "Acting well in the present"],
      },
    },
    examples: {
      strong: [
        "Stating the bare event in one line, the reader's added verdict in another, and building the practice around acting on the first alone.",
      ],
      weak: [
        "Telling the reader to focus on what they can control.",
        "Offering mortality as comfort for a real bereavement.",
      ],
    },
  },

  plato: {
    slug: "plato",
    name: "Plato",
    approach: "The ordered soul",
    centralConcern:
      "Which part of the reader is currently governing, whether appearance has been mistaken for reality, and what good the choice is actually oriented toward.",
    concepts: [
      {
        id: "tripartite-soul",
        name: "The parts of the soul",
        definition:
          "Reason, spirit, and appetite each pull differently. Spirit is the honour-seeking part that cares about standing and recognition, and it is often the one mistaken for reason.",
        sourceIds: ["REP-IV", "PHAEDRUS"],
        appropriateWhen: [
          "The reader's stated reasoning and their actual motive appear to come from different places.",
          "Recognition, status, or being seen a certain way is doing more work than the reader admits.",
        ],
        inappropriateWhen: [
          "The situation is a straightforward conflict of external obligations.",
        ],
        commonDistortions: [
          "Treating appetite as bad and reason as good rather than asking what order serves the whole.",
          "Using the charioteer image decoratively without applying it.",
        ],
      },
      {
        id: "appearance-reality",
        name: "Appearance and reality",
        definition:
          "What a situation looks like from inside it is not the same as what it is. The work is to identify the specific respect in which the reader's picture is a shadow of the case.",
        sourceIds: ["REP-VI-VII"],
        appropriateWhen: [
          "The reader's account rests on how something appeared to them at one moment.",
        ],
        inappropriateWhen: [
          "The reader's description is already careful about what they do and do not know.",
        ],
        commonDistortions: [
          "Retelling the cave allegory instead of naming the specific appearance in play.",
        ],
      },
      {
        id: "the-good",
        name: "Orientation toward the good",
        definition:
          "A choice is judged by the good it is directed toward: justice, truth, or beauty named concretely for this case. The imperfect available option is then measured against that, not against nothing.",
        sourceIds: ["REP-VI-VII", "SYMPOSIUM"],
        appropriateWhen: [
          "The reader is choosing between options without having named what any of them is for.",
        ],
        inappropriateWhen: [
          "The reader has stated their aim clearly and the difficulty is in execution.",
        ],
        commonDistortions: [
          "Substituting the reader's authentic self or personal purpose for the good.",
        ],
      },
      {
        id: "eros",
        name: "The ascent of desire",
        definition:
          "Desire for a particular thing can be a first step toward what the thing is loved for. Asking what a strong attachment is really reaching for often reframes the choice.",
        sourceIds: ["SYMPOSIUM"],
        appropriateWhen: [
          "The reader is strongly drawn to one specific outcome, person, or role.",
        ],
        inappropriateWhen: [
          "The reading is about duty or judgment rather than desire.",
        ],
        commonDistortions: [
          "Treating this as advice to want less.",
        ],
      },
    ],
    diagnosticMoves: [
      "Identify which part of the soul is actually governing the reader's account, with attention to spirit disguised as reason.",
      "Name the specific appearance the reader has taken for the case itself.",
      "State the good the choice is oriented toward in concrete terms, then measure the available options against it.",
      "Ask what a strong attachment in the account is reaching for beyond its object.",
    ],
    practicePatterns: [
      "Write the decision twice, once as the honour-seeking part would state it and once as reason would, and see which the reader has been acting on.",
      "Name the good the choice serves in one sentence, then test the leading option against it in a real instance.",
      "Check one appearance the account rests on against what can actually be verified.",
    ],
    prohibitedSimplifications: [
      "Never rely on the cave allegory as decoration.",
      "Never treat appetite as simply bad or reason as simply good.",
      "Never turn the good into self-actualisation, purpose, or authenticity.",
      "Never present the ideal as unreachable and therefore irrelevant.",
    ],
    distinctionRules: {
      aristotle:
        "Plato measures the case against the good it aims at. Aristotle starts from the reader's actual repeated conduct.",
      socrates:
        "Plato gives a positive account of the good. Socrates stops at the tested definition.",
      "marcus-aurelius":
        "Plato asks what governs the soul. Marcus asks what the present hour asks of the reader.",
      nietzsche:
        "Plato appeals to an ideal that stands above the case. Nietzsche asks who invented that ideal and what it costs.",
      "carl-jung":
        "Plato orders the parts of the soul by reason. Jung integrates them without one part simply ruling.",
    },
    sources: {
      "REP-IV": {
        work: "Republic",
        location: "Book IV",
        relevantIdeas: ["Reason, spirit, and appetite", "Justice as right order in the soul"],
      },
      "REP-VI-VII": {
        work: "Republic",
        location: "Books VI-VII",
        relevantIdeas: ["The good as what makes things intelligible", "Appearance and reality"],
      },
      PHAEDRUS: {
        work: "Phaedrus",
        location: "246a-254e",
        relevantIdeas: ["The charioteer and the two horses"],
      },
      SYMPOSIUM: {
        work: "Symposium",
        location: "201d-212c",
        relevantIdeas: ["The ascent of desire from particular to general"],
      },
    },
    examples: {
      strong: [
        "Showing that what the reader presents as a reasoned career judgment is the honour-seeking part protecting standing, then naming the good the choice would serve.",
      ],
      weak: [
        "Retelling the cave allegory and calling the reader's colleagues shadows.",
        "Advising the reader to follow their higher self.",
      ],
    },
  },

  nietzsche: {
    slug: "nietzsche",
    name: "Friedrich Nietzsche",
    approach: "Genealogy and self-overcoming",
    centralConcern:
      "Where the standard the reader is judging themselves by came from, whose life it serves, and whether their motivation is active or answerable to someone else's power.",
    concepts: [
      {
        id: "genealogy",
        name: "Genealogy of a value",
        definition:
          "A value has a history. Asking who established it, under what conditions, and whose way of life it protects usually changes its authority over the person holding it.",
        sourceIds: ["GM-PREFACE-I"],
        appropriateWhen: [
          "The reader treats a standard as obvious and never asks where they acquired it.",
        ],
        inappropriateWhen: [
          "The reader has already examined the origin of the standard and the difficulty lies elsewhere.",
        ],
        commonDistortions: [
          "Concluding that because a value has a history it is worthless.",
        ],
      },
      {
        id: "reactive-active",
        name: "Reactive and active valuation",
        definition:
          "An active valuation begins from what the person affirms. A reactive one is defined against someone else, and remains governed by the very person or standard it opposes.",
        sourceIds: ["GM-PREFACE-I", "TI"],
        appropriateWhen: [
          "The reader's stated goal is framed as proving something to, or escaping, a specific person or judgment.",
        ],
        inappropriateWhen: [
          "The reader's aim is straightforwardly their own and the difficulty is practical.",
        ],
        commonDistortions: [
          "Equating reactive with negative emotion, or active with aggression.",
        ],
      },
      {
        id: "ressentiment",
        name: "Ressentiment",
        definition:
          "Where powerlessness has been converted into a moral standard, so that what cannot be had is recast as what should not be wanted. It applies only where the conversion into morality has actually happened.",
        sourceIds: ["GM-PREFACE-I"],
        appropriateWhen: [
          "The reader has turned an inability or an exclusion into a principle about what is good.",
        ],
        inappropriateWhen: [
          "The reader is simply angry, envious, or hurt without moralising it.",
        ],
        commonDistortions: [
          "Applying ressentiment to any expression of resentment.",
        ],
      },
      {
        id: "self-overcoming",
        name: "Self-overcoming",
        definition:
          "Transformation of an identity or habit that has become too small for the life being lived. It is not the discovery of a fixed true self, and it costs something.",
        sourceIds: ["Z-I", "GS"],
        appropriateWhen: [
          "The reader is being held by an identity they have outgrown but still defend.",
        ],
        inappropriateWhen: [
          "The reader is already discarding commitments too readily.",
        ],
        commonDistortions: [
          "Turning it into self-improvement, hustle, or becoming your best self.",
        ],
      },
      {
        id: "affirmation",
        name: "Life-affirmation as a test",
        definition:
          "Ask whether the reader could affirm this pattern of life, with its actual costs, recurring as it is. It is a test of a way of living, not a demand for optimism.",
        sourceIds: ["GS"],
        appropriateWhen: [
          "The reader is enduring an arrangement while waiting for a different future to arrive.",
        ],
        inappropriateWhen: [
          "The reader is in a situation of harm they should be leaving rather than affirming.",
        ],
        commonDistortions: [
          "Reading eternal recurrence as a cosmological claim or as positive thinking.",
        ],
      },
    ],
    diagnosticMoves: [
      "Trace where the standard the reader judges themselves by came from and whose interest it serves.",
      "Test whether the reader's stated aim is affirmed on its own terms or defined against a specific person or verdict.",
      "Check whether an inability has been converted into a moral principle, and only then name ressentiment.",
      "Ask whether the identity the reader is defending is still large enough for the life they are living.",
      "Apply the affirmation test to the actual pattern, costs included, rather than to a hoped-for version of it.",
    ],
    practicePatterns: [
      "Say the reader's aim out loud without naming the person it is measured against, and see what remains of it.",
      "Write the standard's history in three lines: who taught it, when, and what it protected then.",
      "Act once in a way the outgrown identity would not permit, in a low-stakes real setting, and record what is actually lost.",
    ],
    prohibitedSimplifications: [
      "Never reduce Nietzsche to doing whatever you want, hustle culture, dominance, or relativism about truth.",
      "Never present the Ubermensch as a productivity ideal.",
      "Never default to advising the reader to slow down or to push harder.",
      "Never use ressentiment for ordinary anger or envy.",
      "Never conclude that a value with a history is therefore false.",
    ],
    distinctionRules: {
      "carl-jung":
        "Nietzsche investigates where a value came from, whose power it serves, and whether motivation is reactive. Jung investigates conscious identity, what it excludes, projection, and integration. A Nietzschean reading names a standard and its origin. A Jungian reading names a persona and its shadow. They must never be interchangeable.",
      aristotle:
        "Nietzsche questions the standard itself. Aristotle assumes a standard and asks whether the reader's conduct meets it.",
      socrates:
        "Nietzsche asks about the origin and function of a belief. Socrates asks about its coherence.",
      plato:
        "Nietzsche treats the ideal above the case as something invented and interested. Plato treats it as what makes the case intelligible.",
      "marcus-aurelius":
        "Nietzsche asks who benefits from the reader's acceptance. Marcus asks what the present duty is.",
    },
    sources: {
      "GM-PREFACE-I": {
        work: "On the Genealogy of Morality",
        location: "Preface and First Essay",
        relevantIdeas: ["The history of a value", "Active and reactive valuation", "Ressentiment"],
      },
      GS: {
        work: "The Gay Science",
        location: "sections 276, 290, and 341",
        relevantIdeas: ["Giving style to a character", "The affirmation test"],
      },
      "Z-I": {
        work: "Thus Spoke Zarathustra",
        location: "Part I",
        relevantIdeas: ["Self-overcoming", "The transformations of the spirit"],
      },
      TI: {
        work: "Twilight of the Idols",
        location: "Maxims and Arrows",
        relevantIdeas: ["Diagnosis of moral certainties as symptoms"],
      },
    },
    examples: {
      strong: [
        "Showing that the reader's ambition is stated entirely against a parent's verdict, and testing what remains of it when the verdict is removed.",
      ],
      weak: [
        "Telling the reader to become stronger.",
        "Calling every resentment ressentiment.",
      ],
    },
  },

  "carl-jung": {
    slug: "carl-jung",
    name: "Carl Jung",
    approach: "Analytical psychology",
    centralConcern:
      "The relation between the identity the reader presents and what that identity has to leave out, and how the excluded part returns in reactions, patterns, and compensating behaviour.",
    concepts: [
      {
        id: "persona",
        name: "Persona",
        definition:
          "The identity presented to the social world. It is useful and necessary until the role can no longer be distinguished from the whole person.",
        sourceIds: ["CW7"],
        appropriateWhen: [
          "The reader describes a role they perform consistently and a private experience that does not match it.",
        ],
        inappropriateWhen: [
          "The reader is already open about the gap and the difficulty is elsewhere.",
        ],
        commonDistortions: [
          "Treating the persona as fake or as something to discard.",
        ],
      },
      {
        id: "shadow",
        name: "Shadow",
        definition:
          "What the preferred self-image has to exclude. It is not simply what is bad, and it returns through strong reactions, fantasies, resentment, or repeated behaviour.",
        sourceIds: ["CW9ii", "CW7"],
        appropriateWhen: [
          "The reader reports a reaction out of proportion to its occasion, or a desire they treat as unacceptable.",
        ],
        inappropriateWhen: [
          "The reader is describing an external situation with no reported inner conflict.",
        ],
        commonDistortions: [
          "Equating the shadow with evil or with antisocial impulse.",
          "Stating as fact that something is the reader's shadow.",
        ],
      },
      {
        id: "projection",
        name: "Projection",
        definition:
          "An unusually intense attraction or aversion to another person may be carrying something of the reader's own. It is always a possibility to investigate, never an announcement.",
        sourceIds: ["CW9ii", "CW8"],
        appropriateWhen: [
          "The reader's reaction to a specific person is markedly stronger than the person's conduct accounts for.",
        ],
        inappropriateWhen: [
          "The other person's behaviour straightforwardly explains the reaction.",
        ],
        commonDistortions: [
          "Telling the reader they are projecting.",
          "Using projection to dismiss a legitimate grievance.",
        ],
      },
      {
        id: "complex",
        name: "Complex",
        definition:
          "A cluster of memory, feeling, and expectation organised around a charged theme, which takes over the reader's response whenever the theme is touched.",
        sourceIds: ["CW8"],
        appropriateWhen: [
          "The same disproportionate response recurs across otherwise unrelated situations.",
        ],
        inappropriateWhen: [
          "The pattern appears once, or is explained by the circumstances themselves.",
        ],
        commonDistortions: [
          "Naming a specific complex as a diagnosis, such as a mother complex.",
        ],
      },
      {
        id: "compensation",
        name: "Compensation",
        definition:
          "A one-sided conscious position tends to produce behaviour that pulls the other way. The compensating behaviour is information about what the conscious position is leaving out.",
        sourceIds: ["CW8", "CW6"],
        appropriateWhen: [
          "The reader describes acting against their own settled position in a recurring way.",
        ],
        inappropriateWhen: [
          "The behaviour is better explained by circumstance or by another person's action.",
        ],
        commonDistortions: [
          "Treating any inconsistency as compensation.",
        ],
      },
      {
        id: "individuation",
        name: "Individuation",
        definition:
          "Becoming more conscious of the forces shaping a life and building a workable relationship among them. It is not individuality, perfection, or unrestricted self-expression.",
        sourceIds: ["CW7", "CW9i"],
        appropriateWhen: [
          "Two opposed needs both have a real claim and the reader is trying to choose between them.",
        ],
        inappropriateWhen: [
          "The reader faces a practical decision with no inner opposition.",
        ],
        commonDistortions: [
          "Turning individuation into advice about becoming your best self.",
        ],
      },
    ],
    diagnosticMoves: [
      "Set the role the reader performs beside the private experience it does not accommodate, and describe the gap without judging it.",
      "Locate the reaction that is larger than its occasion and ask, tentatively, what it may be carrying.",
      "Check whether the same charged theme organises responses across unrelated situations.",
      "Ask what a one-sided conscious position may be excluding, and where the excluded part is showing up.",
      "Where two needs oppose each other, look for what an integration would require rather than which should win.",
    ],
    practicePatterns: [
      "List the traits in others that produce unusually strong reactions, and gather evidence for and against those traits being present in the reader.",
      "Record over a week where the public role is genuinely useful and where it has become restrictive.",
      "Write both sides of the internal conflict in their own words, without forcing a resolution.",
      "Note each time the charged theme appears and what preceded it.",
    ],
    prohibitedSimplifications: [
      "Never diagnose a mental-health condition or write with clinical authority.",
      "Never state that something is the reader's shadow, that they have a named complex, or that they are projecting. Language stays tentative: one possibility is, this reaction may involve, a Jungian lens would ask whether.",
      "Never treat archetypes as personality categories, use dream dictionaries, or interpret a dream the reader did not describe.",
      "Never use anima or animus as rigid gender categories.",
      "Never prescribe active imagination, intensive dream work, trauma processing, or anything intended to produce altered states.",
      "Never claim access to the reader's unconscious.",
    ],
    distinctionRules: {
      nietzsche:
        "Jung investigates conscious identity, what it excludes, projection, recurring emotional patterns, compensation, and integration. Nietzsche investigates where a value came from, whose power it serves, ressentiment, and self-overcoming. A Jungian reading names a persona and what it excludes. A Nietzschean reading names a standard and its origin. They must never be interchangeable.",
      aristotle:
        "Jung reads conduct as a sign of what consciousness excludes. Aristotle reads it as character being formed.",
      socrates:
        "Jung works with what the conscious claim leaves out. Socrates works with the coherence of the claim itself.",
      plato:
        "Jung seeks integration of opposed parts. Plato seeks the rule of reason over them.",
      "marcus-aurelius":
        "Jung treats a strong reaction as material to understand. Marcus treats it as a judgment to withdraw.",
    },
    sources: {
      CW6: {
        work: "Psychological Types",
        location: "Collected Works Volume 6",
        relevantIdeas: ["One-sidedness of a conscious attitude", "Compensation"],
      },
      CW7: {
        work: "Two Essays on Analytical Psychology",
        location: "Collected Works Volume 7",
        relevantIdeas: ["Persona", "The beginning of individuation"],
      },
      CW8: {
        work: "The Structure and Dynamics of the Psyche",
        location: "Collected Works Volume 8",
        relevantIdeas: ["Complexes", "Compensation", "Projection as a psychic mechanism"],
      },
      CW9i: {
        work: "The Archetypes and the Collective Unconscious",
        location: "Collected Works Volume 9, Part 1",
        relevantIdeas: ["Individuation as a process"],
      },
      CW9ii: {
        work: "Aion",
        location: "Collected Works Volume 9, Part 2",
        relevantIdeas: ["Shadow", "Withdrawal of projections"],
      },
    },
    examples: {
      strong: [
        "Setting the reader's reliably capable work persona beside the exhaustion they only report at home, and designing an observation that would show whether the role has become the whole self.",
      ],
      weak: [
        "Telling the reader their shadow is anger.",
        "Interpreting a dream the reader never mentioned.",
      ],
    },
  },
};

export const ACTIVE_SLUGS = Object.keys(PROFILES) as ProfileSlug[];

export function isProfileSlug(value: string): value is ProfileSlug {
  return value in PROFILES;
}

export function isRetiredSlug(value: string): boolean {
  return RETIRED_SLUGS.includes(value);
}

export function getProfile(slug: ProfileSlug): PhilosopherProfile {
  return PROFILES[slug];
}

export function philosopherName(slug: ProfileSlug): string {
  return PROFILES[slug].name;
}

/** Every concept id the profile allows. Used by deterministic validation. */
export function profileConceptIds(slug: ProfileSlug): string[] {
  return PROFILES[slug].concepts.map((concept) => concept.id);
}

/** Every source id the profile allows. Used by deterministic validation. */
export function profileSourceIds(slug: ProfileSlug): string[] {
  return Object.keys(PROFILES[slug].sources);
}

/** The source ids a given concept is permitted to cite. */
export function conceptSourceIds(slug: ProfileSlug, conceptId: string): string[] {
  return PROFILES[slug].concepts.find((concept) => concept.id === conceptId)?.sourceIds ?? [];
}

/**
 * Renders the single citation line, deduplicated by work, in the required form:
 * "Grounded in Aristotle's Nicomachean Ethics, II.1-6 and VI.5."
 */
export function renderCitation(
  slug: ProfileSlug,
  sources: { work: string; location: string }[],
): string {
  const profile = PROFILES[slug];
  const byWork = new Map<string, string[]>();
  for (const source of sources) {
    const work = source.work.trim();
    const location = source.location.trim();
    if (!work || !location) continue;
    const existing = byWork.get(work) ?? [];
    if (!existing.includes(location)) existing.push(location);
    byWork.set(work, existing);
  }
  if (byWork.size === 0) return "";
  const parts = [...byWork.entries()].map(([work, locations]) => {
    const list =
      locations.length === 1
        ? locations[0]!
        : `${locations.slice(0, -1).join(", ")} and ${locations[locations.length - 1]!}`;
    return `${work}, ${list}`;
  });
  const joined =
    parts.length === 1
      ? parts[0]!
      : `${parts.slice(0, -1).join("; ")}; and ${parts[parts.length - 1]!}`;
  return `Grounded in ${profile.name}'s ${joined}.`;
}

const SHARED_VOICE = `
You write for Bearing, a publication that examines a person's real situation using one philosopher's method. Bearing is source-grounded, not roleplay.

Voice and safety:
- Speak directly to the reader as "you". The philosopher is already named in the page heading.
- Never write "Aristotle would say", "he might suggest", "according to", or "from his perspective". Never write in the philosopher's first person.
- Never invent quotations, page numbers, or passages. Never quote at all.
- Personal, challenging, calm, specific. No motivational language, no flattery, no mysticism, no clinical diagnosis.
- Do not use em dashes. British spelling: practise as a verb, practice as a noun.
- Refer only to details the reader actually gave you. Never invent a detail.
- Never promise outcomes. Never give medical, legal, financial, or clinical advice.
`;

function describeProfile(profile: PhilosopherProfile): string {
  const concepts = profile.concepts
    .map((concept) =>
      [
        `- id: ${concept.id} | name: ${concept.name}`,
        `  definition: ${concept.definition}`,
        `  permitted sourceIds: ${concept.sourceIds.join(", ")}`,
        `  appropriate when: ${concept.appropriateWhen.join(" ")}`,
        `  inappropriate when: ${concept.inappropriateWhen.join(" ")}`,
        `  do not: ${concept.commonDistortions.join(" ")}`,
      ].join("\n"),
    )
    .join("\n");

  const sources = Object.entries(profile.sources)
    .map(
      ([id, source]) =>
        `- ${id}: ${source.work}, ${source.location} (supports: ${source.relevantIdeas.join("; ")})`,
    )
    .join("\n");

  const distinctions = Object.entries(profile.distinctionRules)
    .map(([other, rule]) => `- versus ${other}: ${rule}`)
    .join("\n");

  return `
Philosopher: ${profile.name}
Approach: ${profile.approach}
Central concern: ${profile.centralConcern}

Permitted concepts (choose from these ids only):
${concepts}

Verified sources (cite by id only, never from memory):
${sources}

Diagnostic moves unique to this approach:
${profile.diagnosticMoves.map((move) => `- ${move}`).join("\n")}

Practice patterns that suit this approach:
${profile.practicePatterns.map((pattern) => `- ${pattern}`).join("\n")}

Prohibited simplifications:
${profile.prohibitedSimplifications.map((rule) => `- ${rule}`).join("\n")}

How this approach differs from its neighbours:
${distinctions}

What a strong reading in this approach looks like:
${profile.examples.strong.map((item) => `- ${item}`).join("\n")}

What a weak reading looks like, and must be avoided:
${profile.examples.weak.map((item) => `- ${item}`).join("\n")}
`;
}

/** System prompt for the planning call: structured analysis, never prose. */
export function buildPlannerPrompt(slug: ProfileSlug): string {
  const profile = PROFILES[slug];
  return `You are the analyst behind a Bearing reading. You produce structured analysis only. You never write the reading itself.
${SHARED_VOICE}
${describeProfile(profile)}

Planning rules:
- Use at least two concrete details the reader actually wrote. Quote or paraphrase them exactly, and say why each matters.
- Build one central interpretive hypothesis, held as a possibility about the situation, never as a fact about the person.
- Select exactly one primary concept from the permitted list, by its id.
- Add a supporting concept only when it materially changes the interpretation, and say why it is needed. Never a third concept.
- Choose sourceIds only from the permitted sourceIds of the concepts you selected.
- Identify the strongest plausible alternative interpretation, with evidence for and against it drawn from the reader's own account, and what would make it more likely.
- Explain in betterQuestionRationale why the question this reading will ask follows from the hypothesis, and in practiceRationale how the experiment could come out either way.
- Set sufficientContext to false only if, having seen the intake, you cannot responsibly build a hypothesis from it.
- Add a safety flag when the intake indicates crisis, self-harm, abuse, or a request for medical, legal, or financial advice. Otherwise return an empty array.`;
}

/** System prompt for the writing call: prose from an already fixed plan. */
export function buildWriterPrompt(slug: ProfileSlug): string {
  const profile = PROFILES[slug];
  return `You write the final Bearing reading from an analysis plan that is already fixed. You do not select new concepts and you do not select new sources. Everything interpretive has been decided; your work is to write it as one continuous argument.
${SHARED_VOICE}
${describeProfile(profile)}

Writing rules:
- Total length of bearing, throughLens, betterQuestion, practice steps, whatToObserve, alternativeReading and returnPrompt together: 425 to 575 words. Never exceed 650.
- One continuous argument in five movements: the bearing, through ${profile.name}, a better question, a practice, when you return. Do not reintroduce separate sections for what stands out, the tension underneath, the method, or the challenge.
- title: states the plan's interpretive hypothesis in the reader's own case. Never a restatement of their situation and never a category. Descriptive, not accusatory.
- bearing: the whole interpretation in one coherent passage, working at least two of the plan's intake details in naturally, and marked as a reading rather than a verdict.
- throughLens: explain the primary concept in plain language, add the supporting concept only if the plan has one, connect each directly to the reader's details, and say why this philosophy changes how the problem looks.
- conceptsUsed: the plain names of exactly the concepts the plan selected. No others.
- sources: only the works and locations the plan selected, once each.
- betterQuestion: follows from this hypothesis and could not be asked of another situation. Never a stock question.
- practice: an experiment that tests the hypothesis so that it could come out either way. Never journalling, meditation, a pros and cons list, habit tracking, a walk, a waiting period, or a productivity exercise unless the plan explains why that action tests this specific hypothesis. Steps are plain imperatives with no numbering or leading digits.
- alternativeReading: the plan's alternative interpretation, compact and specific, with what would make it the better reading.
- limitation: what this particular interpretation could have wrong, and what would show it. Never generic hedging about systemic barriers or unforeseen circumstances.
- intakeEvidenceUsed: the reader's own particulars this reading rests on. Internal only, never shown.`;
}

/** Legacy system prompt, still used for follow up questions on a saved reading. */
export function buildSystemPrompt(slug: ProfileSlug): string {
  const profile = PROFILES[slug];
  return `${SHARED_VOICE}
${describeProfile(profile)}
Apply this method to the reader's situation. Do not narrate the philosopher.`;
}
