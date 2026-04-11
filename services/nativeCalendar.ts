import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { CalendarEvent } from '@/constants/types';

async function getRockyCalendarId(): Promise<string | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find((c) => c.title === 'RockyAI');
  if (existing) return existing.id;

  if (Platform.OS === 'android') {
    // Prefer an existing writable calendar so we don't proliferate accounts.
    // If none exists, create a local (non-syncing) calendar.
    const writable = calendars.find((c) => c.allowsModifications);
    if (writable) return writable.id;

    return Calendar.createCalendarAsync({
      title: 'RockyAI',
      color: '#2C7A3A',
      entityType: Calendar.EntityTypes.EVENT,
      name: 'RockyAI',
      ownerAccount: 'RockyAI',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
      accountName: 'RockyAI',
      accountType: 'LOCAL',
    });
  }

  // iOS
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return Calendar.createCalendarAsync({
    title: 'RockyAI',
    color: '#2C7A3A',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendar.source.id,
    source: defaultCalendar.source,
    name: 'RockyAI',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

export async function addToNativeCalendar(event: CalendarEvent): Promise<string | null> {
  try {
    const calendarId = await getRockyCalendarId();
    if (!calendarId) return null;

    const startDate = new Date(event.startTime);
    const endDate = event.endTime
      ? new Date(event.endTime)
      : new Date(startDate.getTime() + 60 * 60 * 1000);

    return Calendar.createEventAsync(calendarId, {
      title: event.title,
      location: event.location,
      startDate,
      endDate,
      alarms: [{ relativeOffset: -30 }],
    });
  } catch {
    return null;
  }
}

export async function removeFromNativeCalendar(nativeEventId: string): Promise<void> {
  try {
    await Calendar.deleteEventAsync(nativeEventId);
  } catch {
    // already deleted or permission revoked — ignore
  }
}
