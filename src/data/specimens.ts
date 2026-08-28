/**
 * Hand written demonstration readings for the hero specimen panel.
 * These are fixed copy, not generated. No AI call, no cost, no drift.
 * Each specimen matches one concern chip and one philosopher.
 *
 * Voice rule: specific situations, ordinary lives, direct address.
 * Never "Aristotle would say", never first person as the philosopher.
 */

export type Specimen = {
  id: string;
  /** Chip label shown in the panel and the concern strip. */
  chip: string;
  /** The kind value handed to the inquiry when a visitor starts from here. */
  kind: "A decision" | "A recurring pattern" | "A relationship" | "A persistent fear";
  /** The typed question. */
  question: string;
  philosopher: string;
  method: string;
  sections: { heading: string; body: string }[];
};

export const specimens: Specimen[] = [
  {
    id: "job-offer",
    chip: "A decision I keep putting off",
    kind: "A decision",
    question:
      "I have an offer for $22k more, an hour further away, and a manager who checks in on weekends. I have re-read the email for nine days.",
    philosopher: "Aristotle",
    method: "Virtue ethics",
    sections: [
      {
        heading: "The bearing",
        body: "You have not asked which job pays better. You already know. You keep opening the email because you are hoping the number will start to feel like permission, and it has not, nine days running.",
      },
      {
        heading: "The better question",
        body: "Picture a Tuesday in March next year, 7pm, in each job. Where are you sitting, and who is waiting for you?",
      },
      {
        heading: "The philosophical lens",
        body: "A life is made of its ordinary days, not its offer letters. The right choice is the one whose Tuesdays you can practise for years without becoming someone you would rather not be.",
      },
      {
        heading: "The experiment",
        body: "Tonight, write the two Tuesdays out in full, in plain sentences. Tomorrow, ask the new manager one direct question: what happened the last three weekends. Decide by Friday.",
      },
      {
        heading: "When you return",
        body: "Nine days of re-reading is an answer you have not agreed to hear yet.",
      },
    ],
  },
  {
    id: "sister",
    chip: "A relationship gone quiet",
    kind: "A relationship",
    question:
      "My sister said something about my parenting at Easter. It is August. I have drafted a text about it maybe thirty times and sent none of them.",
    philosopher: "Epictetus",
    method: "Stoic agency",
    sections: [
      {
        heading: "The bearing",
        body: "The remark took four seconds. You have carried it for four months, and the thirty drafts were not attempts to reach her. They were rehearsals of being right, and each one made the silence a little heavier to break.",
      },
      {
        heading: "The better question",
        body: "Do you want the apology, or do you want your sister back? Answer honestly, because they need different sentences.",
      },
      {
        heading: "The philosophical lens",
        body: "Anger promises justice and delivers occupation. You can think she was wrong and still be the one who speaks first. Being the first to speak costs nothing you actually own.",
      },
      {
        heading: "The experiment",
        body: "Delete the drafts. Send seven words with no case in them: I miss you, can I call Sunday. Say the Easter thing out loud on the phone, once, then let her answer.",
      },
      {
        heading: "When you return",
        body: "You have already spent four months on four seconds. That rate is yours to set.",
      },
    ],
  },
  {
    id: "instagram",
    chip: "The habit of comparing myself",
    kind: "A recurring pattern",
    question:
      "I am 34, renting, and three people from school posted their new front doors this month. I make good money and I feel behind every single evening.",
    philosopher: "Marcus Aurelius",
    method: "Stoicism",
    sections: [
      {
        heading: "The bearing",
        body: "You are comparing your whole life to three photographs of doors. You do not know their deposit, their in-laws' loan, their commute, or how they feel on a Sunday. You are losing a contest whose rules you were never shown.",
      },
      {
        heading: "The better question",
        body: "If nobody could ever see the deed, would you still want the house, or would you want what you imagine it proves?",
      },
      {
        heading: "The philosophical lens",
        body: "What other people think of your life sits outside your control. Your savings rate, your work, your attention, and what you do with a free Saturday sit inside it. Spend yourself there.",
      },
      {
        heading: "The experiment",
        body: "For two weeks, open the feed once a day, at lunch, not in the evening. Each night write one line: what I actually did today. Read the fourteen lines together.",
      },
      {
        heading: "When you return",
        body: "The envy tells you what you want. It does not tell you the schedule is real.",
      },
    ],
  },
  {
    id: "gym",
    chip: "A promise I keep breaking to myself",
    kind: "A recurring pattern",
    question:
      "I have paid for the gym since January and been eleven times. I know exactly what to do and every morning I turn the alarm off before I am properly awake.",
    philosopher: "Epictetus",
    method: "Stoicism",
    sections: [
      {
        heading: "The bearing",
        body: "You are treating this as a failure of knowledge, and it is not. Eleven visits is not ignorance. What you have trained since January is the gap between agreeing at 10pm and deciding at 6am, half asleep, alone.",
      },
      {
        heading: "The better question",
        body: "What is the smallest version of this that you could not talk yourself out of on your worst morning?",
      },
      {
        heading: "The philosophical lens",
        body: "Do not announce what you have understood; show it in the one act available now. Training beats intention, and a plan that only works when you feel strong is not a plan.",
      },
      {
        heading: "The experiment",
        body: "Move it off the morning. Put clothes and shoes by the door tonight, and for ten days do fifteen minutes after work, twice a week, no matter how thin it feels. Do not add anything until day eleven.",
      },
      {
        heading: "When you return",
        body: "You are not short on willpower. You are short on a version small enough to survive a bad night's sleep.",
      },
    ],
  },
  {
    id: "layoffs",
    chip: "A fear I cannot quite name",
    kind: "A persistent fear",
    question:
      "Two rounds of layoffs have gone through my team. Nothing has happened to me and I check my calendar for unexpected meetings maybe forty times a day.",
    philosopher: "Plato",
    method: "Platonic reasoning",
    sections: [
      {
        heading: "The bearing",
        body: "The fear has no shape yet, so it can be everything at once, and that is why forty calendar checks feel productive. Unnamed, it makes every ordinary hour into the hour before the news.",
      },
      {
        heading: "The better question",
        body: "State the feared thing in one plain sentence, with a date and a number in it. What does it say?",
      },
      {
        heading: "The philosophical lens",
        body: "Fear thrives in shadow and thins in daylight. Brought into the open and examined, a thing has a true size, usually smaller than the shadow and usually survivable.",
      },
      {
        heading: "The experiment",
        body: "Write on one page: how many months of costs you have, who you would message in week one, and the three people you should have coffee with this month anyway. Then move the calendar check to twice a day, morning and after lunch.",
      },
      {
        heading: "When you return",
        body: "A named fear can be answered and planned for. An unnamed one only asks to be checked again.",
      },
    ],
  },
  {
    id: "sunday",
    chip: "The feeling that time is slipping by",
    kind: "A persistent fear",
    question:
      "I am fine at work and fine at home and every Sunday around six I get the sense that the years are going past and I am not spending them on anything.",
    philosopher: "Socrates",
    method: "Socratic inquiry",
    sections: [
      {
        heading: "The bearing",
        body: "You say wasted, which means you are holding a standard for a life well spent. You have never written it down or read it aloud, yet it arrives every Sunday at six and passes judgement on your whole week.",
      },
      {
        heading: "The better question",
        body: "Wasted against what, and who set that measure? Name the person whose approval the standard is waiting for.",
      },
      {
        heading: "The philosophical lens",
        body: "An unexamined standard governs you more firmly than one you argue with. Define the word before you let it sentence you.",
      },
      {
        heading: "The experiment",
        body: "This Sunday, write one sentence defining a life well spent. Cross out every clause that exists to impress someone. Then put one thing from what remains into next week's calendar, with a time.",
      },
      {
        heading: "When you return",
        body: "A borrowed measure can only ever find you short.",
      },
    ],
  },
];
