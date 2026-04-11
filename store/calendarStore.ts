import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { CalendarEvent } from '@/constants/types';

const storage = new MMKV({ id: 'calendar-events' });

function loadEvents(): CalendarEvent[] {
  const raw = storage.getString('events');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through to empty
    }
  }
  return [];
}

interface CalendarStore {
  savedEvents: CalendarEvent[];
  saveEvent: (event: CalendarEvent) => void;
  removeEvent: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  savedEvents: loadEvents(),

  isSaved: (id) => get().savedEvents.some((e) => e.id === id),

  saveEvent: (event) => {
    const updated = [...get().savedEvents.filter((e) => e.id !== event.id), event];
    set({ savedEvents: updated });
    storage.set('events', JSON.stringify(updated));
  },

  removeEvent: (id) => {
    const updated = get().savedEvents.filter((e) => e.id !== id);
    set({ savedEvents: updated });
    storage.set('events', JSON.stringify(updated));
  },
}));
