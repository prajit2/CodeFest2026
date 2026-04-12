/**
 * API client — all three devs import from here.
 * Change BASE_URL to your deployed backend when ready.
 */
import { ResourceSchema, EventSchema, FeedItemSchema, CrimePointSchema, SeptaArrivalSchema } from './apiTypes';

const BASE_URL = __DEV__
  ? 'http://10.250.6.175:8000'
  : 'https://your-deployed-api.com'; // TODO: update when deployed

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export const api = {
  resources: {
    list: (category?: string) =>
      get<ResourceSchema[]>('/resources', category ? { category } : undefined),
    nearby: (lat: number, lon: number, radiusKm = 2, category?: string) =>
      get<ResourceSchema[]>('/resources/nearby', {
        lat: String(lat), lon: String(lon), radius_km: String(radiusKm),
        ...(category ? { category } : {}),
      }),
    get: (id: string) => get<ResourceSchema>(`/resources/${id}`),
    categories: () => get<string[]>('/resources/categories'),
  },

  events: {
    list: (university?: string, category?: string) =>
      get<EventSchema[]>('/events', {
        ...(university ? { university } : {}),
        ...(category ? { category } : {}),
      }),
  },

  feed: {
    get: (university?: string, needs?: string) =>
      get<FeedItemSchema[]>('/feed', {
        ...(university ? { university } : {}),
        ...(needs ? { needs } : {}),
      }),
  },

  transit: {
    stopsNearby: (lat: number, lon: number) =>
      get('/transit/stops/nearby', { lat: String(lat), lon: String(lon) }),
    arrivals: (stopId: string) =>
      get<SeptaArrivalSchema[]>(`/transit/arrivals/${stopId}`),
  },

  crime: {
    heatmap: () => get<CrimePointSchema[]>('/crime/heatmap'),
  },

  chat: {
    send: (message: string) =>
      post<ChatResponse>('/chat', { message }),
  },
};
