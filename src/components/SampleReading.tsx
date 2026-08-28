import { useState } from "react";
import { Seal } from "./Seal";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import { ReadingBody, type ReadingLike } from "./ReadingBody";

/**
 * One situation, six methods. Hand written demonstration copy, not generated,
 * so the comparison shows that the methods genuinely disagree about what the
 * problem is rather than producing six versions of the same advice.
 */
const situation =
  "Work is going well, but it is taking over the rest of my life. I am afraid that slowing down will cost me everything I have built.";

type Sample = {
  id: string;
  tab: string;
  label: string;
  margin: string;
  /** The one line this method adds to the comparison list. */
  lens: string;
  compare: string;
  reading: ReadingLike;
};

const samples: Sample[] = [
  {
    id: "aristotle",
    tab: "Aristotle",
    label: "An Aristotelian reading",
    margin: "Habit",
    lens: "Aristotle, virtue ethics",
    compare: "What is your current schedule training you to become?",
    reading: {
      headline: "Your week is already practising an answer.",
      noticed:
        "You say you want a life with room for more than work, but your week repeats the opposite every day. The gap is not confusion. It is repetition.",
      tension:
        "You want the standing your work has earned, and you want a life whose shape you chose. At present the first is quietly setting the second.",
      assumption: "You want the standing your work has earned, and a life whose shape you chose.",
      method:
        "Virtue ethics treats character as the residue of repeated action, so the evidence here is your calendar rather than your intention. The real problem is not an undecided question but a habit forming without your consent.",
      principle: "Virtue ethics treats character as the residue of repeated action.",
      grounding:
        "The account of habituation and of the mean as relative to the person sits in the Nicomachean Ethics, Books II and VI, alongside practical wisdom as the capacity that judges the particular case. Paraphrased, not quoted.",
      challenge:
        "Consider whether describing this as fear of losing what you built keeps you from admitting which parts of the week you would cut first if nobody were watching.",
      limits:
        "This lens works slowly. It says little about money, dependents, or a decision that has to be made this month rather than practised over a year.",
      question: "Which version of you is this schedule rehearsing every Tuesday?",
      exercise:
        "Set a hard stopping time for one week and keep it on the evenings when the work could continue. Write one line each night about what you did with the hour instead.",
      returnPrompt:
        "Come back after seven days and report which evenings you broke the stop, and what reason you gave yourself each time.",
    },
  },
  {
    id: "socrates",
    tab: "Socrates",
    label: "A Socratic reading",
    margin: "Belief",
    lens: "Socrates, Socratic inquiry",
    compare: "Why have you treated rest and lack of ambition as the same thing?",
    reading: {
      headline: "One word here is doing work you have never examined.",
      noticed:
        "You use slowing down and being unambitious as though they name the same thing. That equation carries most of the fear in your account, and you have never made it defend itself.",
      tension:
        "You believe ambition is proved by continuous output, and you also believe a good life is more than output. Both cannot govern the same week.",
      assumption: "Ambition proved by output against a good life that is more than output.",
      method:
        "The Socratic method does not supply a conclusion. It isolates the definition you are relying on, tests it against a case, and treats the contradiction it exposes as the real problem rather than the schedule itself.",
      principle: "The Socratic method tests definitions rather than supplying conclusions.",
      grounding:
        "The pattern of examining a definition until it collapses, and treating admitted ignorance as progress, runs through the Apology and the early dialogues such as Euthyphro and Laches. Paraphrased, not quoted.",
      challenge:
        "If a colleague you respect worked fewer hours and produced the same result, would you call them unambitious, and if not, what is your definition actually measuring?",
      limits:
        "Examination can clarify a belief without changing a workload. It offers little where the pressure is structural rather than a matter of what you think.",
      question: "What would ambition mean if it could not be measured in hours?",
      exercise:
        "Write your definition of ambition in one sentence, then cross out every clause that depends on someone else noticing. Read what remains before your next planning meeting.",
      returnPrompt:
        "Return in a week with the sentence that survived, and one occasion where you acted against it.",
    },
  },
  {
    id: "marcus-aurelius",
    tab: "Marcus Aurelius",
    label: "Through Marcus Aurelius",
    margin: "Perspective",
    lens: "Marcus Aurelius, Stoic perspective",
    compare: "How much of this weight is the event, and how much the judgment you added?",
    reading: {
      headline: "The event is a workload. The weight is a verdict you added.",
      noticed:
        "You describe the work as taking your life, which is a judgment rather than a report. What happened is that hours were requested and you agreed to them.",
      tension:
        "You want to be seen as someone who carries the load, and you want the day to belong to you. The wish to be seen is deciding.",
      assumption: "Being seen to carry the load against owning your own day.",
      method:
        "This method separates the event from the opinion added to it, then asks what usefulness today actually requires. It treats reputation and the fear of loss as material to be put back in proportion, not as facts to be managed.",
      principle: "Separate the event from the judgment, then ask what today requires.",
      grounding:
        "These moves are recurrent in the Meditations, especially Books IV, V, and VIII, where impressions are examined and reputation set against a wider view of time. Paraphrased from private notes, not quoted.",
      challenge:
        "Ask whether everything you have built would be diminished by one quieter month, or only your standing in a room you will not remember in ten years.",
      limits:
        "Perspective can console where change is needed. It risks making an unreasonable arrangement bearable instead of ending it.",
      question: "What does today actually ask of you, apart from being seen to do it?",
      exercise:
        "Each morning this week write the day's single most useful task, and do it before answering anything. Note at the end whether the rest changed anything real.",
      returnPrompt:
        "Come back after five days and report what remained undone, and what it cost.",
    },
  },
  {
    id: "plato",
    tab: "Plato",
    label: "A Platonic reading",
    margin: "Order",
    lens: "Plato, the ordered soul",
    compare: "Which part of you is currently governing the rest?",
    reading: {
      headline: "Something other than your judgment is currently in charge.",
      noticed:
        "You know what a good week would look like and you do not live one. That is not ignorance. It is a question of which part of you is giving the orders.",
      tension:
        "Your reasoned view of a good life and your appetite for standing and reward both want the same hours.",
      assumption: "A reasoned view of a good life against an appetite for standing.",
      method:
        "This method distinguishes how the situation appears from what is actually the case, names the standard it should be measured against, and asks whether reason, ambition, or appetite is governing. The problem is disorder in the soul, not a shortage of time.",
      principle: "Ask which part of the soul is governing, and what order would serve you better.",
      grounding:
        "The tripartite soul and the account of a just ordering appear in the Republic, Books IV and IX, with the contrast of appearance and reality in Book VII. Paraphrased, not quoted.",
      challenge:
        "If your reasoned judgment truly governed here, your calendar would already differ, so consider what is being served by leaving it as it is.",
      limits:
        "The ideal ordering is easier to name than to install, and this lens can make a practical constraint sound like a failure of character.",
      question: "What would your week look like if judgment, not appetite, set the order?",
      exercise:
        "Write the ordered week you would defend as good, in hours. Put one block of it into next week and protect it as though it were a meeting with someone else.",
      returnPrompt: "Return in a week and report which block survived, and what displaced the rest.",
    },
  },
  {
    id: "nietzsche",
    tab: "Nietzsche",
    label: "Through Nietzsche",
    margin: "Genealogy",
    lens: "Nietzsche, genealogy and self overcoming",
    compare: "Whose values are you obeying, and what did obeying them cost?",
    reading: {
      headline: "The standard you are afraid of failing is not yours.",
      noticed:
        "You call the work everything you have built, but you have not asked who taught you to count it that way, or what that accounting leaves out.",
      tension:
        "You want to be the author of your own standard, and you want the approval that comes from meeting an inherited one.",
      assumption: "Authoring your own standard against meeting an inherited one.",
      method:
        "Genealogy asks where a value came from and whose interest it served, then asks whether it still increases your strength or only your obedience. The real problem is not overwork but a value you adopted without ever choosing it.",
      principle: "Trace the value to its origin, then ask whether it still serves your life.",
      grounding:
        "The genealogical method and the question of the value of values are set out in On the Genealogy of Morality, and self overcoming in Thus Spoke Zarathustra. Paraphrased, not quoted.",
      challenge:
        "Consider that fear of losing what you built may be less about the work than about who you would be without an external scoreboard confirming you.",
      limits:
        "This lens is corrosive by design. It can dissolve a commitment worth keeping and offers little guidance on obligations to the people around you.",
      question: "Which of your standards would you still choose if no one else measured by it?",
      exercise:
        "List the three achievements you name first when you describe yourself. Beside each, write who taught you it counted. Keep one, and act this week as though the other two were optional.",
      returnPrompt:
        "Come back in ten days and report which of the two you could not let go of, and what happened when you tried.",
    },
  },
  {
    id: "carl-jung",
    tab: "Jung",
    label: "Through Jung",
    margin: "Persona",
    lens: "Jung, analytical psychology",
    compare: "What does the identity you present have to leave out?",
    reading: {
      headline: "The role has become so complete that there is nowhere left to be unfinished.",
      noticed:
        "You describe yourself almost entirely through what you deliver. The parts of you that are unproductive, uncertain, or simply idle appear only as failures of discipline.",
      tension:
        "You want the recognition the role reliably brings, and you want a life in which not everything has to be earned.",
      assumption: "The competent identity against the parts of you it has to exclude.",
      method:
        "This lens treats the identity you present to the world as useful but partial, and asks what it has had to exclude. One possibility is that the excluded part is returning indirectly, through resentment, exhaustion, or a reaction that felt larger than the situation deserved. It is offered as a hypothesis to test, not a verdict.",
      principle: "What a person excludes from their identity can continue to influence them indirectly.",
      grounding:
        "Persona and the excluded part of the personality are discussed in Two Essays on Analytical Psychology, Collected Works Volume 7. Paraphrased, not quoted.",
      challenge:
        "Consider that the irritation you feel toward people who seem to coast may be less about them than about a permission you have not given yourself.",
      limits:
        "This is interpretation, not diagnosis, and it can invent depth where a situation is simply overloaded. It says nothing about the money and obligations that keep the role in place.",
      question: "What part of you must stay unacceptable for this identity to hold together?",
      exercise:
        "For one week, note each time a reaction felt disproportionate to the event, and write the trait in the other person that set it off. Say nothing to them. Read the list on the seventh day.",
      returnPrompt:
        "Come back after seven days with the list, and say which trait appeared more than once.",
    },
  },
];

export function SampleReading() {
  const [active, setActive] = useState(samples[0]!.id);
  const current = samples.find((sample) => sample.id === active) ?? samples[0]!;

  return (
    <section
      id="sample"
      aria-labelledby="sample-heading"
      className="bg-sample vignette relative py-20 lg:py-28"
    >
      <div className="shell relative grid gap-14 lg:grid-cols-[1fr_1.12fr] lg:items-start lg:gap-16">
        <div>
          <Reveal>
            <SectionLabel numeral="V">One situation, six methods</SectionLabel>
          </Reveal>
          <Reveal>
            <h2 id="sample-heading" className="display-lg mt-8 text-ink">
              The problem stays the same.
              <br />
              The question changes.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md leading-relaxed text-ink-soft">
              These methods do not agree. Each one decides that a different part of the situation is
              the real problem.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 border-l-2 border-oxblood/60 bg-papyrus-light/60 p-5">
              <p className="label text-oxblood">The situation</p>
              <p className="mt-3 leading-relaxed text-ink">{situation}</p>
            </div>
          </Reveal>

          <ul className="mt-8 border-t border-ink/20">
            {samples.map((sample, index) => (
              <Reveal
                as="li"
                key={sample.id}
                delay={index * 0.05}
                className="border-b border-ink/15 py-5"
              >
                <p className="label text-ink-soft">{sample.lens}</p>
                <p
                  className="mt-2 text-[1.1rem] leading-snug text-ink"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {sample.compare}
                </p>
              </Reveal>
            ))}
          </ul>

          <p className="label mt-9 text-ink-soft">Read the full reading</p>
          <div role="tablist" aria-label="Sample readings" className="mt-3 flex flex-wrap gap-3">
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                role="tab"
                id={`tab-${sample.id}`}
                aria-selected={active === sample.id}
                aria-controls={`panel-${sample.id}`}
                onClick={() => setActive(sample.id)}
                className={`label border border-ink px-5 py-3 transition-colors duration-200 ${
                  active === sample.id
                    ? "bg-ink text-papyrus-light"
                    : "bg-transparent text-ink hover:bg-ink/10"
                }`}
              >
                {sample.tab}
              </button>
            ))}
          </div>

          <p className="mt-9 max-w-md text-sm leading-relaxed text-ink-soft">
            Every reading names the work its ideas come from and states what the method may miss. It
            applies a philosopher's method without pretending to speak in their voice.
          </p>
        </div>

        <Reveal delay={0.06}>
          <div
            role="tabpanel"
            id={`panel-${current.id}`}
            aria-labelledby={`tab-${current.id}`}
            className="plate grain"
            style={{ transform: "rotate(-0.4deg)" }}
          >
            <div className="relative flex items-center justify-between gap-4 border-b border-ink/25 px-6 py-4 sm:px-9">
              <div className="flex min-w-0 items-center gap-3">
                <Seal size={28} className="shrink-0" />
                <div className="min-w-0">
                  <p className="label text-ink-soft">{current.label}</p>
                  <p className="truncate text-lg text-ink">{current.reading.headline}</p>
                </div>
              </div>
              <span className="folio hidden shrink-0 sm:block">{current.margin}</span>
            </div>

            <div className="relative px-6 py-9 sm:px-10 sm:py-11">
              <ReadingBody reading={current.reading} />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-ink/25 px-6 py-4 sm:px-9">
              <span className="folio">Bearing · Sample reading</span>
              <span aria-hidden="true" className="h-px w-12 bg-bronze" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
