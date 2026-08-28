import aristotleImg from "@/assets/aristotle.jpg";
import socratesImg from "@/assets/socrates.jpg";
import marcusImg from "@/assets/marcus.jpg";
import jungImg from "@/assets/carl-jung.jpg";
import platoImg from "@/assets/plato.jpg";
import nietzscheImg from "@/assets/nietzsche.jpg";

export type Philosopher = {
  slug: string;
  name: string;
  dates: string;
  school: string;
  principle: string;
  /** Short invitation shown on the Lyceum card. */
  prompt: string;
  summary: string;
  overview: string;
  /** How the reading actually proceeds when this method is applied. */
  method: string;
  /** Named concepts a reading may draw on. */
  concepts: string[];
  /** Primary works cited in the textual grounding of a reading. */
  works: string[];
  /** What this approach directs attention toward. */
  notices: string;
  /** Honest limits of the approach. */
  misses: string;
  principles: { title: string; body: string }[];
  bestFor: string;
  question: string;
  portrait: string;
  portraitAlt: string;
  free: boolean;
};

export const philosophers: Philosopher[] = [
  {
    slug: "aristotle",
    name: "Aristotle",
    dates: "384–322 BC",
    school: "Virtue Ethics",
    principle: "A good life is built one habit at a time.",
    prompt: "Bring a habit you cannot break.",
    summary: "Examine the character your repeated actions are forming.",
    overview:
      "Aristotle believed the point of life was to flourish: to use your abilities well and become a person of good character. You do that through habituation. Each choice is practice for the next one. His approach is useful when you know what matters to you, but your routines or priorities keep pulling you away from it.",
    method:
      "A reading identifies what your repeated actions are training you to become, then asks what the right measure would be for you in this particular situation. It uses practical wisdom rather than a fixed rule, and judges the choice against a whole life rather than a single outcome.",
    concepts: [
      "Habituation",
      "Virtue and vice",
      "The mean relative to the person",
      "Practical wisdom",
      "Flourishing",
      "Friendship and the whole life",
    ],
    works: [
      "Nicomachean Ethics, Books I–II and VI",
      "Nicomachean Ethics, Books VIII–IX on friendship",
      "Politics, Book I",
    ],
    notices:
      "Repetition, formation of character, whether a standard is excessive or deficient for you specifically, and whether a life has room for work, friendship, and purpose together.",
    misses:
      "It assumes conditions stable enough for habit to matter. It says little about injustice, sudden loss, or circumstances that no amount of good character can change, and it can be misread as the claim that habits determine everything.",
    principles: [
      {
        title: "Build character by doing",
        body: "You become brave by doing brave things, generous by giving, and dependable by keeping your word.",
      },
      {
        title: "Aim for the right measure",
        body: "Too much and too little can both miss the mark. The right response depends on the person and the moment.",
      },
      {
        title: "Use practical judgment",
        body: "Life rarely gives you a perfect rule. Good judgment means seeing what this situation actually calls for.",
      },
      {
        title: "Judge the whole life",
        body: "A good life is more than pleasure or success. It includes work, friendship, purpose, and how you treat people.",
      },
    ],
    bestFor: "Habits, purpose, leadership, relationships, and finding balance.",
    question: "What habit is this choice building?",
    portrait: aristotleImg,
    portraitAlt:
      "Black ink screen print portrait of Aristotle with thick curled hair and a short full beard at a three quarter angle",
    free: true,
  },
  {
    slug: "socrates",
    name: "Socrates",
    dates: "470–399 BC",
    school: "Socratic Inquiry",
    principle: "Question the story you keep telling yourself.",
    prompt: "Bring a belief you have never argued with.",
    summary: "Test the belief sitting underneath the problem.",
    overview:
      "Socrates rarely gave people an answer. He asked them to say what they meant, then followed the logic until weak assumptions showed themselves. Socrates left no writings of his own. The method is drawn from his portrayal in Plato's dialogues and in Xenophon, so a reading works from that portrayal rather than from a text he authored.",
    method:
      "A reading isolates the definition you are relying on, tests it against a counterexample, and shows where two of your beliefs, or a belief and your behaviour, contradict each other. It does not supply a conclusion. Admitted uncertainty counts as progress.",
    concepts: [
      "Definition",
      "Counterexample",
      "Elenchus, or cross-examination",
      "Contradiction between beliefs",
      "Acknowledged ignorance",
      "The examined life",
    ],
    works: [
      "Plato, Apology 38a on the examined life",
      "Plato, Euthyphro on definition",
      "Plato, Meno on knowing what you do not know",
      "Xenophon, Memorabilia",
    ],
    notices:
      "Unexamined words such as success, loyalty, fair, and selfish, and the gap between what you say you believe and what you actually do.",
    misses:
      "It clarifies without deciding. It can leave you sharper and no closer to action, it can feel corrosive when applied to grief or love, and it depends on your willingness to be shown wrong.",
    principles: [
      {
        title: "Examine your life",
        body: "Do not let habit, fear, or other people's expectations choose your life without being questioned.",
      },
      {
        title: "Admit what you do not know",
        body: "Being unsure is not a weakness. It is the point where honest thinking can begin.",
      },
      {
        title: "Define your words",
        body: "Before arguing about success, loyalty, justice, or love, ask what you actually mean by them.",
      },
      {
        title: "Follow the contradiction",
        body: "When two beliefs do not fit together, do not ignore the gap. It usually contains the real problem.",
      },
    ],
    bestFor:
      "Confusion, recurring arguments, major decisions, and beliefs that no longer fit your life.",
    question: "What are you assuming without checking?",
    portrait: socratesImg,
    portraitAlt:
      "Black ink screen print portrait of Socrates with a bald crown, heavy brows, and a long irregular beard looking upward",
    free: false,
  },
  {
    slug: "marcus-aurelius",
    name: "Marcus Aurelius",
    dates: "121–180 AD",
    school: "Stoic Perspective",
    principle: "The event is one thing. Your judgment of it is another.",
    prompt: "Bring what you cannot control.",
    summary: "Separate the event from the judgment you have added to it.",
    overview:
      "Marcus Aurelius wrote private notes to himself while running an empire and burying children. His Stoicism is less a system than a discipline of perspective: strip the judgment from the event, remember that your time is finite, do the work in front of you, and treat other people as part of the same body you belong to.",
    method:
      "A reading separates what happened from the interpretation you added, sets the situation against mortality and a wider view, and returns you to the useful action available today. It emphasises duty to other people rather than private calm alone.",
    concepts: [
      "Event distinguished from judgment",
      "Memento mori and the view from above",
      "Duty to the common good",
      "Present action",
      "Proportion of reputation and insult",
    ],
    works: [
      "Meditations, Book II on the present and on mortality",
      "Meditations, Book IV on the view from above",
      "Meditations, Books V and VIII on duty and opinion",
    ],
    notices:
      "The commentary you attach to events, time spent on reputation or resentment, and the useful thing that could be done today.",
    misses:
      "It can flatten legitimate grievance into acceptance and reduce to generic advice about controlling what you can. It has less to offer when the right response is to change the situation rather than your judgment of it.",
    principles: [
      {
        title: "Pause before you judge",
        body: "What happened and what you tell yourself about it are not the same thing. Leave room between them.",
      },
      {
        title: "Do the useful thing",
        body: "Status and resentment waste attention. Ask what would help the people and the work in front of you.",
      },
      {
        title: "Return to today",
        body: "The past is over and the future is not here. Your only place to act is the present.",
      },
      {
        title: "Keep your ego in proportion",
        body: "A wider view makes most insults, delays, and anxieties smaller. It also makes the important work clearer.",
      },
    ],
    bestFor: "Pressure, responsibility, criticism, grief, anger, and uncertain outcomes.",
    question: "What is yours to do today?",
    portrait: marcusImg,
    portraitAlt:
      "Black ink screen print portrait of Marcus Aurelius with dense curled hair, a curled beard, and a Roman cloak clasp",
    free: false,
  },
  {
    slug: "plato",
    name: "Plato",
    dates: "428–348 BC",
    school: "The Ordered Soul",
    principle: "Ask which part of you is currently in charge.",
    prompt: "Bring a choice pulled in three directions.",
    summary: "Examine what rules you, and what good the choice is aimed at.",
    overview:
      "Plato held that appearances are not the whole of what is real, and that a person, like a city, can be well or badly ordered. Reason, spirit, and appetite each make claims on you. His philosophy asks which of them is governing this choice, and which good, such as justice or truth, the choice is actually directed toward.",
    method:
      "A reading asks which part of the self is ruling, distinguishes how the situation appears from what is the case, and names the ideal the choice is aimed at so an imperfect option can be judged against it.",
    concepts: [
      "Reason, spirit, and appetite",
      "Order and disorder in the soul",
      "Appearance and reality",
      "The Forms and the good",
      "Justice as right ordering",
    ],
    works: [
      "Republic, Book IV on the parts of the soul",
      "Republic, Books VI–VII on the good and the cave",
      "Phaedrus 246a on the charioteer",
      "Symposium on the ascent of desire",
    ],
    notices:
      "Which motive is actually steering you, standards you have never named, and the difference between what a choice looks like and what it is.",
    misses:
      "The ideal can be used to condemn a workable life for not being perfect, and the framework can undervalue the body, appetite, and ordinary attachment.",
    principles: [
      {
        title: "Look past appearances",
        body: "What is familiar, popular, or visible may still be incomplete. Ask what you are not seeing.",
      },
      {
        title: "Name the ideal",
        body: "Ideas such as justice and beauty give you a standard for judging an imperfect situation.",
      },
      {
        title: "Put the self in order",
        body: "A good life lets reason guide ambition and appetite instead of letting the loudest impulse win.",
      },
      {
        title: "Keep moving toward the good",
        body: "Learning and love can move you beyond possession and status toward something less selfish.",
      },
    ],
    bestFor: "Values, identity, justice, love, long term direction, and hard tradeoffs.",
    question: "What would the best version of this look like?",
    portrait: platoImg,
    portraitAlt:
      "Black ink screen print profile portrait of Plato with long wavy hair and a long beard, gaze raised",
    free: false,
  },
  {
    slug: "nietzsche",
    name: "Friedrich Nietzsche",
    dates: "1844–1900",
    school: "Genealogy & Self-Overcoming",
    principle: "Before obeying a value, ask where it came from, and what kind of life it produces.",
    prompt: "Bring a rule for your life that no longer feels like yours.",
    summary: "Trace inherited values, expose reactive motives, and decide what you are willing to affirm.",
    overview:
      "Nietzsche asks how words such as good, successful, selfish, responsible, and worthy acquired their authority over us. His genealogical method traces values back to the fears, conflicts, needs, and power relationships that produced them. He is useful when guilt, resentment, ambition, conformity, or an inherited identity is making a decision on your behalf.",
    method:
      "A reading traces the value you are obeying back to its origin, asks whether you hold it actively or maintain it in reaction to someone whose approval still governs you, and then tests whether this pattern of life is one you could affirm with its real costs.",
    concepts: [
      "Genealogy of values",
      "Affirmative and reactive valuation",
      "Ressentiment",
      "Self-overcoming",
      "Perspective",
      "Life-affirmation and eternal recurrence as a test",
    ],
    works: [
      "On the Genealogy of Morality, Preface and First Essay",
      "The Gay Science, sections 276, 290, and 341",
      "Thus Spoke Zarathustra, Part I on the three metamorphoses",
      "Twilight of the Idols, Maxims and Arrows",
    ],
    notices:
      "Values you never chose, guilt turned inward, ambition sustained by comparison, and the difference between creating something and answering to someone.",
    misses:
      "It is stronger at diagnosis than at telling you what to do next. It can license self-indulgence when read carelessly, and it undervalues obligation, dependence, and the ordinary goods of duty and care.",
    principles: [
      {
        title: "Trace the value",
        body: "Before accepting a moral rule or personal standard, ask who created it, under what conditions, and whose way of life it serves.",
      },
      {
        title: "Distinguish creation from reaction",
        body: "A value can arise from something you actively affirm, or as a reaction against someone whose power, freedom, or approval still governs you.",
      },
      {
        title: "Practise self-overcoming",
        body: "Growth is not merely discovering a fixed true self. It involves transforming the habits, standards, and identities that have become too small.",
      },
      {
        title: "Test what you can affirm",
        body: "Ask whether you could affirm this pattern of life with its real costs, rather than merely endure it while hoping for a different future.",
      },
    ],
    bestFor:
      "Identity, ambition, guilt, resentment, inherited expectations, conformity, reinvention, and fear of becoming someone different.",
    question: "Whose values are you living by, and what are they making possible?",
    portrait: nietzscheImg,
    portraitAlt:
      "Black ink screen print portrait of Friedrich Nietzsche with a heavy moustache, dark swept back hair, and a high collared jacket",
    free: false,
  },
  {
    slug: "carl-jung",
    name: "Carl Jung",
    dates: "1875–1961",
    school: "Analytical Psychology",
    principle: "What you exclude from your identity can continue influencing you indirectly.",
    prompt: "Bring a reaction or recurring pattern that feels larger than the situation.",
    summary:
      "Examine the persona you present, the qualities you disown, and the patterns seeking greater integration.",
    overview:
      "Carl Jung developed analytical psychology as a way of understanding the relationship between conscious identity and the less conscious forces that shape behaviour. His approach is useful when a reaction feels disproportionate, the same relationship pattern keeps returning, or a carefully maintained identity leaves important parts of life unexpressed. A Jungian reading does not diagnose you or decode you from a distance. It offers hypotheses about persona, projection, shadow, complexes, and individuation that you can examine against lived evidence.",
    method:
      "A reading proposes one possibility about the identity you present, what that identity has to leave out, and how the excluded part may be returning through a strong reaction or a repeating pattern. It is offered as a hypothesis to test against your own evidence, never as a verdict about your unconscious.",
    concepts: [
      "Persona and social identity",
      "Shadow",
      "Projection",
      "Complexes",
      "Compensation",
      "Individuation",
    ],
    works: [
      "Two Essays on Analytical Psychology, Collected Works Volume 7",
      "The Structure and Dynamics of the Psyche, Collected Works Volume 8",
      "The Archetypes and the Collective Unconscious, Collected Works Volume 9, Part 1",
      "Aion, Collected Works Volume 9, Part 2",
      "Psychological Types, Collected Works Volume 6",
    ],
    notices:
      "Reactions out of proportion to the event, relationship patterns that keep returning, and the distance between the role you perform and what you privately want.",
    misses:
      "It is interpretive rather than conclusive, and it can invite you to read meaning into an ordinary situation. It is not therapy, not diagnosis, and it says little about practical constraints such as money, time, or obligation.",
    principles: [
      {
        title: "Notice the role you have learned to perform",
        body: "The persona is the identity presented to the social world. It can be necessary and useful, but problems arise when a person becomes unable to distinguish the role from the whole of the self.",
      },
      {
        title: "Examine what the identity excludes",
        body: "Traits that conflict with a person's preferred self-image may be pushed out of conscious identity. They do not simply disappear and may return through strong reactions, fantasies, resentment, or recurring behaviour.",
      },
      {
        title: "Question what you place entirely in others",
        body: "An unusually intense attraction or aversion can sometimes involve qualities the person has difficulty recognising in themselves. This is a possibility to investigate, not a conclusion Bearing should announce.",
      },
      {
        title: "Hold the tension instead of choosing a false half",
        body: "Individuation involves becoming more conscious of the different forces shaping one's life and developing a more integrated relationship among them. It is not simple individuality, perfection, or unrestricted self-expression.",
      },
    ],
    bestFor:
      "Identity transitions, recurring relationship patterns, disproportionate reactions, projection, self-sabotage, conflict between public identity and private desire, and periods when an established role no longer feels sufficient.",
    question:
      "What part of yourself must remain unacceptable for your current identity to stay intact?",
    portrait: jungImg,
    portraitAlt:
      "Black ink screen-print portrait of Carl Jung with swept-back white hair, a white moustache, round glasses, and a dark suit at a slight three-quarter angle.",
    free: false,
  },
];

export const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];

/** Approaches no longer offered for new readings, kept so saved history still renders. */
export const retiredPhilosopherNames: Record<string, string> = {
  seneca: "Seneca",
};


export function philosopherBySlug(slug: string): Philosopher | undefined {
  return philosophers.find((p) => p.slug === slug);
}
