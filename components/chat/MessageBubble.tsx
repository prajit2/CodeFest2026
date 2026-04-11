import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { FeedItemSchema } from '@/services/apiTypes';
import { useCalendarStore } from '@/store/calendarStore';
import { CalendarEvent } from '@/constants/types';
import { scheduleEventReminder } from '@/services/notifications';
import { addToNativeCalendar } from '@/services/nativeCalendar';

export interface Message {
  id: string;
  role: 'user' | 'rocky';
  text: string;
  timestamp: Date;
  events?: FeedItemSchema[];
}

interface Props {
  message: Message;
}

function toCalendarEvent(item: FeedItemSchema): CalendarEvent {
  return {
    id: item.id,
    title: item.title,
    location: item.location,
    startTime: item.start_time,
    category: item.category as CalendarEvent['category'],
    resourceId: item.resource_id,
  };
}

function MiniEventCard({ item }: { item: FeedItemSchema }) {
  const saveEvent = useCalendarStore((s) => s.saveEvent);
  const isSaved = useCalendarStore((s) => s.isSaved(item.id));

  async function handleSave(item: FeedItemSchema) {
    try {
      const event = toCalendarEvent(item);
      const [notificationId, nativeCalendarEventId] = await Promise.all([
        scheduleEventReminder(event.id, event.title, event.startTime),
        addToNativeCalendar(event),
      ]);
      saveEvent({ ...event, notificationId: notificationId ?? undefined, nativeCalendarEventId: nativeCalendarEventId ?? undefined });
    } catch (e) {
      console.warn('MiniEventCard save failed:', e);
    }
  }

  const dateLabel = item.start_time
    ? new Date(item.start_time).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.title} numberOfLines={2}>{item.title}</Text>
      {dateLabel ? <Text style={cardStyles.date}>{dateLabel}</Text> : null}
      <TouchableOpacity
        style={[cardStyles.saveBtn, isSaved && cardStyles.saveBtnSaved]}
        onPress={() => handleSave(item)}
        disabled={isSaved}
        accessibilityLabel={isSaved ? `${item.title} saved` : `Save ${item.title}`}
        accessibilityRole="button"
      >
        <Text style={[cardStyles.saveBtnText, isSaved && cardStyles.saveBtnTextSaved]}>
          {isSaved ? 'Saved' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleRocky]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{message.text}</Text>
        {!isUser && message.events && message.events.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={cardStyles.scrollContainer}
            contentContainerStyle={cardStyles.scrollContent}
          >
            {message.events.map((item) => (
              <MiniEventCard key={item.id} item={item} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 16 },
  rowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '90%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleRocky: { backgroundColor: '#F2F2F7', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: '#2C7A3A', borderBottomRightRadius: 4 },
  text: { fontSize: 15, color: '#1C1C1E', lineHeight: 21 },
  textUser: { color: '#FFFFFF' },
});

const cardStyles = StyleSheet.create({
  scrollContainer: { marginTop: 10 },
  scrollContent: { paddingRight: 8, gap: 8 },
  card: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    lineHeight: 18,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#2C7A3A',
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: 'center',
  },
  saveBtnSaved: {
    backgroundColor: '#E8F5E9',
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveBtnTextSaved: {
    color: '#2C7A3A',
  },
});
