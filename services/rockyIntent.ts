import { MapDispatchAction, ResourceCategory } from '@/constants/types';

export type RockyIntent =
  | { type: 'map_filter'; category: ResourceCategory; mapAction: MapDispatchAction }
  | { type: 'crisis'; message: string }
  | { type: 'directions'; resourceName: string }
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
  'hopeless', 'can\'t go on', 'hurt myself', 'self harm',
];

const INTENT_MAP: Array<{ keywords: string[]; category: ResourceCategory; response: string }> = [
  {
    keywords: ['food', 'hungry', 'eat', 'meal', 'pantry', 'groceries', 'free food'],
    category: 'food_bank',
    response: "Here are food banks and free meal sites near you.",
  },
  {
    keywords: ['shelter', 'homeless', 'housing', 'sleep', 'place to stay', 'no home'],
    category: 'shelter',
    response: "Here are shelters near you.",
  },
  {
    keywords: ['clinic', 'doctor', 'health', 'medical', 'sick', 'prescription', 'health center'],
    category: 'clinic',
    response: "Here are health clinics near you.",
  },
  {
    keywords: ['mental health', 'therapy', 'therapist', 'counseling', 'anxiety', 'depression', 'stress'],
    category: 'mental_health',
    response: "Here are mental health services near you.",
  },
  {
    keywords: ['na meeting', 'aa meeting', 'narcotics', 'alcoholics', 'recovery', 'sober', 'addiction'],
    category: 'support_group',
    response: "Here are support groups and recovery resources near you.",
  },
  {
    keywords: ['septa', 'bus', 'subway', 'train', 'transit', 'trolley', 'stop'],
    category: 'septa',
    response: "Here are nearby SEPTA stops.",
  },
  {
    keywords: ['campus', 'student', 'university', 'drexel', 'temple', 'penn', 'school'],
    category: 'campus_resource',
    response: "Here are campus resources near you.",
  },
];

export function detectIntent(message: string): RockyIntent {
  const lower = message.toLowerCase();

  // Crisis check first — always highest priority
  if (CRISIS_KEYWORDS.some((kw) => lower.includes(kw))) {
    return {
      type: 'crisis',
      message: "I hear you. Here are immediate resources that can help:",
    };
  }

  // Directions intent
  if (lower.includes('how do i get') || lower.includes('directions to') || lower.includes('how to get to')) {
    const resourceName = message.replace(/how (do i get|to get) to|directions to/gi, '').trim();
    return { type: 'directions', resourceName };
  }

  // Map filter intents
  for (const intent of INTENT_MAP) {
    if (intent.keywords.some((kw) => lower.includes(kw))) {
      return {
        type: 'map_filter',
        category: intent.category,
        mapAction: { type: 'FILTER_CATEGORY', category: intent.category },
      };
    }
  }

  return {
    type: 'general',
    response: "I can help you find food, shelter, health clinics, transit, and support resources in Philadelphia. What do you need?",
  };
}
