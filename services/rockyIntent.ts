import { MapDispatchAction, ResourceCategory, University } from '@/constants/types';

export interface UserContext {
  isStudent?: boolean;
  university?: University;
}

const UNIVERSITY_LABELS: Record<University, string> = {
  drexel: 'Drexel University',
  temple: 'Temple University',
  upenn: 'University of Pennsylvania',
  ccp: 'Community College of Philadelphia',
  saint_josephs: "Saint Joseph's University",
  lasalle: 'La Salle University',
  other: 'your campus',
};

export type RockyIntent =
  | { type: 'map_filter'; category: ResourceCategory; response: string; mapAction: MapDispatchAction }
  | { type: 'crisis'; message: string }
  | { type: 'directions'; resourceName: string }
  | { type: 'show_events'; response: string }
  | { type: 'general'; response: string };

// Hardcoded crisis resources — never depend on network
export const CRISIS_RESOURCES = [
  { name: '988 Suicide & Crisis Lifeline', phone: '988', description: 'Call or text 988, 24/7' },
  { name: 'Philadelphia Crisis Line', phone: '215-685-6440', description: '24/7 mental health crisis' },
  { name: 'National Domestic Violence Hotline', phone: '1-800-799-7233', description: '24/7' },
  { name: 'SAMHSA Helpline', phone: '1-800-662-4357', description: 'Substance abuse, 24/7 free' },
];

const CRISIS_KEYWORDS = [
  'overwhelmed', 'crisis', 'suicide', 'suicidal', 'kill myself', 'end my life',
  'hopeless', "can't go on", 'hurt myself', 'self harm',
];

const INTENT_MAP: Array<{ keywords: string[]; category: ResourceCategory; response: string }> = [
  {
    keywords: ['food', 'hungry', 'eat', 'meal', 'pantry', 'groceries', 'free food'],
    category: 'food_bank',
    response: "Yo, I got youse — here are food banks and free meal jawns near you.",
  },
  {
    keywords: ['shelter', 'homeless', 'housing', 'sleep', 'place to stay', 'no home'],
    category: 'shelter',
    response: "A-ite, pulling up shelters near you right now.",
  },
  {
    keywords: ['bathroom', 'restroom', 'toilet', 'hygiene', 'shower', 'clean up'],
    category: 'shelter',
    response: "Ga head, here are shelters with hygiene facilities near you.",
  },
  {
    keywords: ['clinic', 'doctor', 'health', 'medical', 'sick', 'prescription', 'health center'],
    category: 'clinic',
    response: "No cap, your health matters — here are health clinics near you.",
  },
  {
    keywords: ['mental health', 'therapy', 'therapist', 'counseling', 'anxiety', 'depression', 'stress'],
    category: 'mental_health',
    response: "Yo, taking care of yourself is real — here are mental health jawns near you.",
  },
  {
    keywords: ['na meeting', 'aa meeting', 'narcotics', 'alcoholics', 'recovery', 'sober', 'addiction'],
    category: 'support_group',
    response: "Respect for reaching out, boul — here are support groups and recovery resources near you.",
  },
  {
    keywords: ['septa', 'bus', 'subway', 'train', 'transit', 'trolley', 'stop', 'el', 'the el'],
    category: 'septa',
    response: "Youse tryna catch the EL or a bus? Here are SEPTA stops near you.",
  },
  {
    keywords: [
      'campus', 'student', 'university', 'drexel', 'temple', 'penn', 'school',
      'help office', 'advising', 'advisor', 'financial aid', 'tutoring',
      'student center', 'dining hall', 'campus food', 'campus clinic',
      'career center', 'writing center', 'counseling center', 'free food on campus',
      'student resources', 'campus resources', 'student services',
    ],
    category: 'campus_resource',
    response: "Here are campus resources near you.",
  },
  {
    keywords: ['job', 'work', 'employment', 'career', 'resume', 'hire', 'hiring'],
    category: 'campus_resource',
    response: "A-ite, let's get youse working — here are workforce and career resources near you.",
  },
  {
    keywords: ['wifi', 'internet', 'computer', 'laptop', 'library', 'charge my phone'],
    category: 'campus_resource',
    response: "Here are places with free WiFi and computers near you. Wawa's always got an outlet too jawn.",
  },
];

const EVENTS_KEYWORDS = [
  'upcoming events', 'free events', 'what events', 'save event',
  'any events', 'events near', 'events today', 'events this week',
];

export function detectIntent(message: string, userContext?: UserContext): RockyIntent {
  const lower = message.toLowerCase();

  // Crisis check first — always highest priority
  if (CRISIS_KEYWORDS.some((kw) => lower.includes(kw))) {
    return {
      type: 'crisis',
      message: "Yo, I hear you — and I'm glad you said something. Here are immediate resources that can help:",
    };
  }

  // Directions intent
  if (lower.includes('how do i get') || lower.includes('directions to') || lower.includes('how to get to')) {
    const resourceName = message
      .replace(/how do i get to|how to get to|directions to/gi, '')
      .replace(/[?.!,]+$/g, '')
      .trim();
    return { type: 'directions', resourceName };
  }

  // Map filter intents
  for (const intent of INTENT_MAP) {
    if (intent.keywords.some((kw) => lower.includes(kw))) {
      if (intent.category === 'campus_resource') {
        // Non-students get a helpful redirect instead of an empty map
        if (!userContext?.isStudent) {
          return {
            type: 'general',
            response: "Aye, campus jawns are for enrolled students. But I got youse — ask me about food banks, health clinics, shelters, or SEPTA instead!",
          };
        }
        // Students get a personalized response and map filtered to their school
        const schoolName = userContext.university
          ? UNIVERSITY_LABELS[userContext.university]
          : 'your campus';
        return {
          type: 'map_filter',
          category: 'campus_resource',
          response: `Opening the map to ${schoolName} resources near you.`,
          mapAction: { type: 'FILTER_CATEGORY', category: 'campus_resource' },
        };
      }

      return {
        type: 'map_filter',
        category: intent.category,
        response: intent.response,
        mapAction: { type: 'FILTER_CATEGORY', category: intent.category },
      };
    }
  }

  // Events intent — before general fallback
  if (EVENTS_KEYWORDS.some((kw) => lower.includes(kw))) {
    return {
      type: 'show_events',
      response: "Here are some upcoming events you can save:",
    };
  }

  // Smart general fallback
  const wordCount = message.trim().split(/\s+/).length;
  if (lower.includes('thank') || lower.includes('thx')) {
    const goBirds = Math.random() < 0.5 ? " Go Birds! 🦅" : "";
    return { type: 'general', response: `No jawn! Holler if you need anything else.${goBirds}` };
  }
  if (['hi', 'hello', 'hey', 'sup', 'yo'].some((kw) => lower.includes(kw))) {
    const goBirds = Math.random() < 0.4 ? " Go Birds! 🦅" : "";
    return { type: 'general', response: `Yo! I'm Rocky, your Philly jawn for resources. Ask me about free food, shelters, health clinics, SEPTA, or support groups around the city.${goBirds}` };
  }
  if (lower.includes('?')) {
    return { type: 'general', response: "Ionno about dat one, boul — but I can help you find food, shelter, health clinics, SEPTA, and support nearby. Try: 'Where can I get free food?' or 'Find a health clinic'." };
  }
  if (wordCount < 4) {
    return { type: 'general', response: "Ga head, what do you need? Food, shelter, health, transit, or support — I got youse." };
  }

  return {
    type: 'general',
    response: "Yo, I can help you find food, shelter, health clinics, SEPTA, and support all around Philly. What do you need?",
  };
}
