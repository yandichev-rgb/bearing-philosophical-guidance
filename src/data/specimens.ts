/**
 * Hand written demonstration readings for the hero specimen panel.
 * These are fixed copy, not generated. No AI call, no cost, no drift.
 * Each specimen matches one concern chip and one philosopher.
 */

export type Specimen = {
  id: string;
  /** Chip label shown in the panel and the concern strip. */
  chip: string;
  /** The kind value handed to the inquiry when a visitor starts from here. */
  kind: "A decision to make" | "A pattern that repeats" | "A relationship" | "A fear I keep meeting";
  /** The typed question. */
  question: string;
  philosopher: string;
  method: string;
  sections: { heading: string; body: string }[];
};

export const specimens: Specimen[] = [
  {
    id: "comparison",
    chip: "Comparing myself",
    kind: "A pattern that repeats",
    question: "I cannot stop measuring my life against everyone else's.",
    philosopher: "Marcus Aurelius",
    method: "Stoicism",
    sections: [
      {
        heading: "What stands out",
        body: "You are weighing your whole life against the parts of other lives you are shown. The comparison is not unfair because you lose it. It is unfair because you never agreed to the terms.",
      },
      {
        heading: "The question",
        body: "If nobody could see the result, would you still want the thing you are chasing?",
      },
      {
        heading: "The principle",
        body: "What other people think of you sits outside your control. Your effort, your attention, and your standards sit inside it. Spend yourself there.",
      },
      {
        heading: "The practice",
        body: "For one week, open the feed only once a day, and write one line afterward about what you actually did that day.",
      },
      {
        heading: "Sit with this",
        body: "The envy is information. It tells you what you want. It does not tell you it is yours.",
      },
    ],
  },
  {
    id: "decision",
    chip: "A decision I keep delaying",
    kind: "A decision to make",
    question: "I have been circling the same choice for months and cannot commit.",
    philosopher: "Aristotle",
    method: "Virtue ethics",
    sections: [
      {
        heading: "What stands out",
        body: "You describe this as a lack of information, but you have gathered plenty. What is missing is not another fact. It is a willingness to accept the cost of either road.",
      },
      {
        heading: "The question",
        body: "Which version of yourself does each option practise, day after day?",
      },
      {
        heading: "The principle",
        body: "Character is built by repetition, not by resolve. A choice matters because of the habit it starts, and delay is itself a habit you are training.",
      },
      {
        heading: "The practice",
        body: "Set a date this month. Write the two costs plainly, choose the one you can live beside, and act small on it within a day.",
      },
      {
        heading: "Sit with this",
        body: "Waiting is not neutral. It is a quiet vote for the life you already have.",
      },
    ],
  },
  {
    id: "resentment",
    chip: "Resentment I carry",
    kind: "A relationship",
    question: "I keep replaying what they did and it still colours everything.",
    philosopher: "Seneca",
    method: "Stoicism",
    sections: [
      {
        heading: "What stands out",
        body: "You are still paying rent on an event that has ended. The injury took an hour. The rehearsal has taken a year, and you are running it yourself.",
      },
      {
        heading: "The question",
        body: "What are you protecting by keeping the grievance warm?",
      },
      {
        heading: "The principle",
        body: "Anger promises justice and delivers occupation. You can hold someone responsible without handing them your attention every evening.",
      },
      {
        heading: "The practice",
        body: "Write the account once, in full, as if for a record. Then name one thing that is yours to repair, and do only that.",
      },
      {
        heading: "Sit with this",
        body: "Forgiveness is not a favour to them. It is the moment you stop carrying the weight for both of you.",
      },
    ],
  },
  {
    id: "drift",
    chip: "Feeling behind",
    kind: "A fear I keep meeting",
    question: "I am afraid I am wasting the years I have.",
    philosopher: "Socrates",
    method: "Socratic inquiry",
    sections: [
      {
        heading: "What stands out",
        body: "You speak of being behind, which means you are holding a schedule. You did not write it, and you have never read it aloud to check whether you agree with it.",
      },
      {
        heading: "The question",
        body: "Behind whom, and by what measure that you chose?",
      },
      {
        heading: "The principle",
        body: "An unexamined standard will govern you more firmly than one you argue with. Define the word before you let it judge you.",
      },
      {
        heading: "The practice",
        body: "Write your definition of a life well spent in one sentence. Cross out every clause that exists to impress someone.",
      },
      {
        heading: "Sit with this",
        body: "A borrowed timeline can only ever make you late.",
      },
    ],
  },
  {
    id: "discipline",
    chip: "I know but do not do",
    kind: "A pattern that repeats",
    question: "I know exactly what I should be doing and I still do not do it.",
    philosopher: "Epictetus",
    method: "Stoicism",
    sections: [
      {
        heading: "What stands out",
        body: "You are treating this as a failure of knowledge. It is not. You have the knowledge. What you have been rehearsing is the gap between agreeing with a thing and doing it.",
      },
      {
        heading: "The question",
        body: "What is the smallest version of this you could not talk yourself out of?",
      },
      {
        heading: "The principle",
        body: "Do not tell people what you have understood. Show it in the one act available to you now. Training beats intention, every day.",
      },
      {
        heading: "The practice",
        body: "Shrink the task until it is almost trivial, attach it to something you already do, and keep it for ten days without judging the size of it.",
      },
      {
        heading: "Sit with this",
        body: "You are not short on willpower. You are short on a task small enough to survive a bad day.",
      },
    ],
  },
  {
    id: "dread",
    chip: "Dread about what comes next",
    kind: "A fear I keep meeting",
    question: "I keep bracing for something going wrong and cannot settle.",
    philosopher: "Plato",
    method: "Platonic reasoning",
    sections: [
      {
        heading: "What stands out",
        body: "The dread has no shape yet, and that is what gives it power. Unnamed, it can be everything at once, so your mind treats every hour as the hour before the news.",
      },
      {
        heading: "The question",
        body: "If you had to state the feared thing in one plain sentence, what would it say?",
      },
      {
        heading: "The principle",
        body: "Fear thrives on shadows and thins in daylight. Bring the thing into the open, examine it, and you will find its true size, usually smaller and usually survivable.",
      },
      {
        heading: "The practice",
        body: "Write the fear as one sentence, then write what you would actually do in the first week if it happened.",
      },
      {
        heading: "Sit with this",
        body: "A named fear can be answered. An unnamed one only grows.",
      },
    ],
  },
];
