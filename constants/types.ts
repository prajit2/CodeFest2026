// Shared data types — all three devs import from here

export type ResourceCategory =
  | 'food_bank'
  | 'shelter'
  | 'clinic'
  | 'mental_health'
  | 'septa'
  | 'support_group'
  | 'campus_resource';

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hours?: string;
  nearestSeptaStops?: SeptaStop[];
}

export interface SeptaStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  routes: string[];
}

export interface SeptaArrival {
  route: string;
  destination: string;
  minutesAway: number;
}

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  university?: string;
  location?: string;
  startTime: string; // ISO string
  category: 'free_food' | 'clinic_popup' | 'resource' | 'event';
  resourceId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  location?: string;
  startTime: string; // ISO string
  endTime?: string;
  category: FeedItem['category'];
  resourceId?: string;
  notificationId?: string;
}

// Chat-to-map bridge — Rocky sends this, map receives it
export interface MapDispatchAction {
  type: 'FILTER_CATEGORY' | 'CENTER_ON_LOCATION' | 'SHOW_RESOURCE';
  category?: ResourceCategory;
  latitude?: number;
  longitude?: number;
  resourceId?: string;
  zoom?: number;
}

export type University =
  | 'drexel'
  | 'temple'
  | 'upenn'
  | 'ccp'
  | 'saint_josephs'
  | 'lasalle'
  | 'other';

export interface UserPreferences {
  isStudent: boolean;
  university?: University;
  substanceSupport: boolean;
  mentalHealthSupport: boolean;
  hasCompletedOnboarding: boolean;
}
