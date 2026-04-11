// Mirror of backend/schemas.py — keep in sync

export interface SeptaStopSchema {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  routes: string[];
}

export interface ResourceSchema {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hours?: string;
  description?: string;
  nearest_septa_stops?: SeptaStopSchema[];
}

export interface EventSchema {
  id: string;
  title: string;
  description?: string;
  university?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  start_time: string;
  end_time?: string;
  category: string;
  resource_id?: string;
}

export interface FeedItemSchema {
  id: string;
  title: string;
  description?: string;
  university?: string;
  location?: string;
  start_time: string;
  category: string;
  resource_id?: string;
}

export interface CrimePointSchema {
  latitude: number;
  longitude: number;
  weight: number;
}

export interface SeptaArrivalSchema {
  route: string;
  destination: string;
  minutes_away: number;
}
