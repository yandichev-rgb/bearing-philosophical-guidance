import aristotleImg from "@/assets/aristotle.jpg";
import socratesImg from "@/assets/socrates.jpg";
import marcusImg from "@/assets/marcus.jpg";
import epictetusImg from "@/assets/epictetus.jpg";
import platoImg from "@/assets/plato.jpg";
import senecaImg from "@/assets/seneca.jpg";

export type Philosopher = {
  slug: string;
  name: string;
  dates: string;
  school: string;
  principle: string;
  summary: string;
  overview: string;
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
    summary: "Use your daily choices to become the person you want to be.",
    overview:
      "Aristotle believed the point of life was to flourish: to use your abilities well and become a person of good character. You do that through habit. Each choice is practice for the next one. His approach is useful when you know what matters to you, but your routines or priorities keep pulling you away from it.",
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
    summary: "Test your assumptions before they make your decisions for you.",
    overview:
      "Socrates rarely gave people an answer. He asked them to explain what they meant, then followed the logic until weak assumptions showed themselves. The point was not to win an argument. It was to think honestly enough to live honestly. His method is useful when you feel stuck between options or keep returning to the same conflict.",
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
    school: "Stoicism",
    principle: "You cannot control what happens. You can control what you do next.",
    summary: "Stay steady under pressure and act on what is actually yours.",
    overview:
      "Marcus Aurelius was an emperor trying to remain decent under pressure. His private notes became a guide to staying calm, doing your duty, and not letting praise, criticism, anger, or fear run your life. He reminds you that events are not yours to command. Your attention, judgment, and next action are.",
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
    slug: "epictetus",
    name: "Epictetus",
    dates: "approximately 50–135 AD",
    school: "Stoicism",
    principle: "Put your effort where you have a say.",
    summary: "Stop spending energy on outcomes and people you cannot control.",
    overview:
      "Epictetus knew how little control a person can have over circumstances. Born into slavery, he built his philosophy around a hard distinction: some things are up to us and some are not. Other people, reputation, and final outcomes are never fully ours. How we respond is. His approach turns wasted worry into deliberate action.",
    principles: [
      {
        title: "Separate what you control",
        body: "Your choices and judgments are yours. Other people, outcomes, and reputation are not.",
      },
      {
        title: "Do not trust the first thought",
        body: "A frightening first impression is not a final verdict. Stop and test it before you react.",
      },
      {
        title: "Keep your choices your own",
        body: "Someone else can limit your options. They do not get to decide what kind of person you will be.",
      },
      {
        title: "Use difficulty as practice",
        body: "Every obstacle gives you a chance to practice patience, courage, restraint, or clear thinking.",
      },
    ],
    bestFor: "Anxiety, rejection, difficult people, discipline, and outcomes you cannot control.",
    question: "Which part of this is actually up to you?",
    portrait: epictetusImg,
    portraitAlt:
      "Black ink screen print profile portrait of Epictetus with short hair and beard wearing a simple robe",
    free: false,
  },
  {
    slug: "plato",
    name: "Plato",
    dates: "428–348 BC",
    school: "Platonism",
    principle: "What seems true is not always the whole truth.",
    summary: "Step back from appearances and ask which ideal should guide you.",
    overview:
      "Plato believed that everyday appearances can hide deeper truths. In his famous cave, people mistake shadows for reality because shadows are all they have known. His philosophy asks you to step back, question what looks obvious, and decide which ideals deserve to guide your life: truth, justice, beauty, or goodness.",
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
    slug: "seneca",
    name: "Seneca",
    dates: "4 BC–65 AD",
    school: "Roman Stoicism",
    principle: "Life is long enough if you stop wasting it.",
    summary: "Use your time well, prepare for setbacks, and hold success lightly.",
    overview:
      "Seneca wrote for people with careers, money, ambition, friendships, and grief. He kept returning to time: the one thing we give away while carefully guarding everything else. His version of Stoicism helps you prepare for setbacks, question your anger, and enjoy success without becoming dependent on it.",
    principles: [
      {
        title: "Guard your time",
        body: "A full calendar is not the same as a full life. Spend your hours on purpose.",
      },
      {
        title: "Prepare for setbacks",
        body: "Thinking about loss before it arrives can make you less afraid and more ready.",
      },
      {
        title: "Hold success lightly",
        body: "Comfort and money can be useful. They become dangerous when you cannot imagine being okay without them.",
      },
      {
        title: "Question your anger",
        body: "Anger grows from the story you tell about an event. Change the story and the emotion can change with it.",
      },
    ],
    bestFor: "Time, ambition, burnout, money, anger, mortality, and fear of losing what you have built.",
    question: "If your time were limited, would this still deserve it?",
    portrait: senecaImg,
    portraitAlt:
      "Black ink screen print portrait of Seneca with a receding hairline and lean clean shaven Roman features",
    free: false,
  },
];

export const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];
