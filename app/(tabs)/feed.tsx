import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { api } from '@/services/api';
import { FeedItemSchema } from '@/services/apiTypes';
import { useUserStore } from '@/store/userStore';
import { useCalendarStore } from '@/store/calendarStore';
import { scheduleEventReminder } from '@/services/notifications';
import { CalendarEvent } from '@/constants/types';

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

const CATEGORY_COLORS: Record<string, string> = {
  free_food: '#2C7A3A',
  clinic_popup: '#9C27B0',
  event: '#2196F3',
  resource: '#FF9800',
};

const CATEGORY_LABELS: Record<string, string> = {
  free_food: 'Free Food',
  clinic_popup: 'Health Clinic',
  event: 'Event',
  resource: 'Resource',
};

function FeedCard({ item, saved, onSave }: { item: FeedItemSchema; saved: boolean; onSave: () => void }) {
  const color = CATEGORY_COLORS[item.category] ?? '#8E8E93';
  const date = new Date(item.start_time);
  const timeStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    + ' · ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={[styles.cardAccent, { backgroundColor: color }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.tag, { color }]}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
          <View style={styles.cardHeaderRight}>
            {item.university && <Text style={styles.university}>{item.university.toUpperCase()}</Text>}
            <TouchableOpacity onPress={onSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome name={saved ? 'bookmark' : 'bookmark-o'} size={16} color={saved ? '#2C7A3A' : '#C7C7CC'} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
        <View style={styles.cardMeta}>
          <FontAwesome name="clock-o" size={12} color="#8E8E93" />
          <Text style={styles.metaText}>{timeStr}</Text>
          {item.location && (
            <>
              <FontAwesome name="map-marker" size={12} color="#8E8E93" style={styles.metaIcon} />
              <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  const [items, setItems] = useState<FeedItemSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const university = useUserStore((s) => s.university);
  const isStudent = useUserStore((s) => s.isStudent);
  const saveEvent = useCalendarStore((s) => s.saveEvent);
  const isSaved = useCalendarStore((s) => s.isSaved);

  async function handleSave(item: FeedItemSchema) {
    const event = toCalendarEvent(item);
    const notificationId = await scheduleEventReminder(event.id, event.title, event.startTime);
    saveEvent({ ...event, notificationId: notificationId ?? undefined });
  }

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await api.feed.get(isStudent ? university : undefined);
      setItems(data);
    } catch (e) {
      console.warn('Feed load failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2C7A3A" /></View>;
  }

  return (
    <View style={styles.container}>
      {isStudent && university && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Showing {university} events first</Text>
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <FeedCard item={item} saved={isSaved(item.id)} onSave={() => handleSave(item)} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2C7A3A" />}
        ListEmptyComponent={<Text style={styles.empty}>No events right now. Pull to refresh.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  banner: { backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 8 },
  bannerText: { fontSize: 13, color: '#2C7A3A', fontWeight: '600' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardAccent: { width: 4 },
  cardContent: { flex: 1, padding: 14, gap: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  university: { fontSize: 10, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  cardDesc: { fontSize: 13, color: '#6C6C70', lineHeight: 18 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaIcon: { marginLeft: 8 },
  metaText: { fontSize: 12, color: '#8E8E93', flex: 1 },
  empty: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontSize: 15 },
});
