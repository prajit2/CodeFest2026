import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CalendarEvent } from '@/constants/types';
import { useCalendarStore } from '@/store/calendarStore';
import { cancelEventReminder } from '@/services/notifications';
import { removeFromNativeCalendar } from '@/services/nativeCalendar';

function EmptyCalendar() {
  return (
    <View style={styles.empty}>
      <FontAwesome name="calendar-o" size={48} color="#D1D1D6" />
      <Text style={styles.emptyTitle}>No saved events yet</Text>
      <Text style={styles.emptyDesc}>
        Events you save from the Feed or Rocky will appear here. They'll sync to your phone calendar so you get reminders.
      </Text>
    </View>
  );
}

function EventCard({ event, onRemove }: { event: CalendarEvent; onRemove: (id: string) => void }) {
  const date = new Date(event.startTime);
  const isPast = date < new Date();
  return (
    <View style={[styles.card, isPast && styles.cardPast]}>
      <View style={styles.dateCol}>
        <Text style={styles.dateMonth}>{date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</Text>
        <Text style={styles.dateDay}>{date.getDate()}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{event.title}</Text>
        {event.location && (
          <View style={styles.row}>
            <FontAwesome name="map-marker" size={12} color="#8E8E93" />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
        )}
        <View style={styles.timeRow}>
          <Text style={styles.time}>
            {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </Text>
          {isPast && <Text style={styles.pastBadge}>Past</Text>}
        </View>
      </View>
      <TouchableOpacity onPress={() => onRemove(event.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <FontAwesome name="trash-o" size={18} color="#C7C7CC" />
      </TouchableOpacity>
    </View>
  );
}

export default function CalendarScreen() {
  const saved = useCalendarStore((s) => s.savedEvents);
  const removeEventFromStore = useCalendarStore((s) => s.removeEvent);

  async function removeEvent(id: string) {
    const event = saved.find((e) => e.id === id);
    try {
      await Promise.all([
        event?.notificationId ? cancelEventReminder(event.notificationId) : Promise.resolve(),
        event?.nativeCalendarEventId ? removeFromNativeCalendar(event.nativeCalendarEventId) : Promise.resolve(),
      ]);
    } catch (e) {
      console.warn('Remove event cleanup failed:', e);
    } finally {
      removeEventFromStore(id);
    }
  }

  const sorted = [...saved].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Events</Text>
        <Text style={styles.headerSub}>Syncs to your phone calendar</Text>
      </View>

      {sorted.length === 0 ? (
        <EmptyCalendar />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => <EventCard event={item} onRemove={removeEvent} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  headerSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  dateCol: { alignItems: 'center', width: 36 },
  dateMonth: { fontSize: 10, fontWeight: '700', color: '#2C7A3A', letterSpacing: 0.5 },
  dateDay: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  cardContent: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#8E8E93' },
  time: { fontSize: 12, color: '#8E8E93' },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  cardPast: { opacity: 0.45 },
  pastBadge: { fontSize: 11, color: '#C7C7CC', fontWeight: '600', marginLeft: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  emptyDesc: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
});
