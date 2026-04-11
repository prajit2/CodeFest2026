import { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, ScrollView, Pressable, Platform, Linking } from 'react-native';
import { useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { api } from '@/services/api';
import { FeedItemSchema } from '@/services/apiTypes';
import { useUserStore } from '@/store/userStore';
import { FeedFilterBar } from '@/components/feed/FeedFilterBar';
import { useCalendarStore } from '@/store/calendarStore';
import { scheduleEventReminder } from '@/services/notifications';
import { addToNativeCalendar } from '@/services/nativeCalendar';
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
  food_bank: '#4CAF50',
  shelter: '#2196F3',
  clinic_popup: '#9C27B0',
  clinic: '#9C27B0',
  mental_health: '#9C27B0',
  event: '#2196F3',
  support_group: '#009688',
  campus_resource: '#FFC107',
  resource: '#FF9800',
};

const CATEGORY_LABELS: Record<string, string> = {
  free_food: 'Free Food',
  food_bank: 'Food Bank',
  shelter: 'Shelter',
  clinic_popup: 'Health Clinic',
  clinic: 'Health Clinic',
  mental_health: 'Mental Health',
  event: 'Event',
  support_group: 'Support Group',
  campus_resource: 'Campus Resource',
  resource: 'Resource',
};

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return (
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) +
    ' at ' +
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}

function FeedCard({ item, saved, onSave, onPress }: { item: FeedItemSchema; saved: boolean; onSave: () => void; onPress: () => void }) {
  const color = CATEGORY_COLORS[item.category] ?? '#8E8E93';
  const date = new Date(item.start_time);
  const timeStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    + ' · ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
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

function FeedDetailSheet({
  item,
  saved,
  onSave,
  onClose,
}: {
  item: FeedItemSchema;
  saved: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const color = CATEGORY_COLORS[item.category] ?? '#8E8E93';

  function openMaps() {
    if (!item.location) return;
    const encoded = encodeURIComponent(item.location);
    const url = Platform.OS === 'ios'
      ? `maps:0,0?q=${encoded}`
      : `geo:0,0?q=${encoded}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${encoded}`)
    );
  }

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheetContainer}>
        {/* Header bar */}
        <View style={styles.sheetHeader}>
          <View style={styles.sheetDragHandle} />
          <Pressable style={styles.sheetCloseBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityRole="button" accessibilityLabel="Close detail sheet">
            <FontAwesome name="times" size={18} color="#3C3C43" />
          </Pressable>
        </View>

        <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {/* Category tag */}
          <View style={[styles.sheetTag, { backgroundColor: color + '1A', borderColor: color }]}>
            <Text style={[styles.sheetTagText, { color }]}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
          </View>

          {/* Title */}
          <Text style={styles.sheetTitle}>{item.title}</Text>

          {/* University badge */}
          {item.university && (
            <View style={styles.sheetUniversityBadge}>
              <FontAwesome name="graduation-cap" size={12} color="#6C6C70" />
              <Text style={styles.sheetUniversityText}>{item.university.toUpperCase()}</Text>
            </View>
          )}

          {/* Description */}
          {item.description && (
            <Text style={styles.sheetDesc}>{item.description}</Text>
          )}

          {/* Date / time */}
          <View style={styles.sheetMetaRow}>
            <FontAwesome name="calendar" size={15} color="#8E8E93" />
            <Text style={styles.sheetMetaText}>{formatDateTime(item.start_time)}</Text>
          </View>

          {/* Location */}
          {item.location && (
            <View style={styles.sheetMetaRow}>
              <FontAwesome name="map-marker" size={15} color="#8E8E93" />
              <Text style={styles.sheetMetaText}>{item.location}</Text>
            </View>
          )}
        </ScrollView>

        {/* Footer: Maps + Save buttons */}
        <View style={styles.sheetFooter}>
          {item.location && (
            <TouchableOpacity style={styles.sheetMapsBtn} onPress={openMaps} activeOpacity={0.75}>
              <FontAwesome name="map-o" size={16} color="#2C7A3A" />
              <Text style={styles.sheetMapsBtnText}>Open in Maps</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.sheetSaveBtn, saved && styles.sheetSaveBtnSaved]}
            onPress={saved ? undefined : onSave}
            disabled={saved}
            activeOpacity={saved ? 1 : 0.75}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Already saved to calendar' : 'Save to calendar'}
          >
            {saved ? (
              <>
                <FontAwesome name="check" size={16} color="#FFFFFF" />
                <Text style={styles.sheetSaveBtnText}>Saved</Text>
              </>
            ) : (
              <Text style={styles.sheetSaveBtnText}>Save to Calendar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function FeedScreen() {
  const [items, setItems] = useState<FeedItemSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedItemSchema | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const university = useUserStore((s) => s.university);
  const isStudent = useUserStore((s) => s.isStudent);
  const substanceSupport = useUserStore((s) => s.substanceSupport);
  const mentalHealthSupport = useUserStore((s) => s.mentalHealthSupport);
  const saveEvent = useCalendarStore((s) => s.saveEvent);
  const savedEvents = useCalendarStore((s) => s.savedEvents);
  const savedIds = useMemo(() => new Set(savedEvents.map((e) => e.id)), [savedEvents]);

  // Priority categories based on user needs — used for sorting, not filtering
  const priorityCategories = new Set([
    ...(substanceSupport ? ['support_group', 'event'] : []),
    ...(mentalHealthSupport ? ['mental_health', 'clinic', 'clinic_popup'] : []),
  ]);

  async function handleSave(item: FeedItemSchema) {
    try {
      const event = toCalendarEvent(item);
      const [notificationId, nativeCalendarEventId] = await Promise.all([
        scheduleEventReminder(event.id, event.title, event.startTime),
        addToNativeCalendar(event),
      ]);
      saveEvent({
        ...event,
        notificationId: notificationId ?? undefined,
        nativeCalendarEventId: nativeCalendarEventId ?? undefined,
      });
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  const load = useCallback(async (isRefresh = false) => {
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
  }, [isStudent, university]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const FILTER_CATEGORIES: Record<string, string[]> = {
    Food: ['free_food', 'food_bank'],
    Shelters: ['shelter'],
    Health: ['clinic_popup', 'clinic'],
    Recovery: ['support_group', 'mental_health'],
    'Support Groups': ['support_group'],
    Campus: [],
  };

  const filteredItems = (() => {
    let result =
      activeFilter === 'Campus'
        ? items.filter(i => i.university === university)
        : activeFilter === 'All'
          ? items.filter(i => !i.university)   // exclude campus events from All view
          : items.filter(i => !i.university && (FILTER_CATEGORIES[activeFilter] ?? []).includes(i.category));

    // Boost priority categories to the top on "All" view
    if (activeFilter === 'All' && priorityCategories.size > 0) {
      result = [
        ...result.filter(i => priorityCategories.has(i.category)),
        ...result.filter(i => !priorityCategories.has(i.category)),
      ];
    }
    return result;
  })();

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2C7A3A" /></View>;
  }

  return (
    <View style={styles.container}>
      <FeedFilterBar active={activeFilter} onSelect={setActiveFilter} showCampus={!!isStudent} />
      {isStudent && university && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Showing {university} events first</Text>
        </View>
      )}
      <FlatList
        data={filteredItems}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <FeedCard
            item={item}
            saved={savedIds.has(item.id)}
            onSave={() => handleSave(item)}
            onPress={() => setSelectedItem(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2C7A3A" />}
        ListEmptyComponent={<Text style={styles.empty}>No events right now. Pull to refresh.</Text>}
      />
      {selectedItem && (
        <FeedDetailSheet
          item={selectedItem}
          saved={savedIds.has(selectedItem.id)}
          onSave={() => handleSave(selectedItem)}
          onClose={() => setSelectedItem(null)}
        />
      )}
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
  // --- Detail sheet ---
  sheetContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  sheetHeader: { alignItems: 'center', paddingTop: 12, paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA' },
  sheetDragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D1D6', marginBottom: 8 },
  sheetCloseBtn: { position: 'absolute', right: 16, top: 12, padding: 4 },
  sheetScroll: { flex: 1 },
  sheetContent: { padding: 20, gap: 14 },
  sheetTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  sheetTagText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', lineHeight: 26 },
  sheetUniversityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sheetUniversityText: { fontSize: 11, fontWeight: '700', color: '#6C6C70', letterSpacing: 0.5 },
  sheetDesc: { fontSize: 15, color: '#3C3C43', lineHeight: 22 },
  sheetMetaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  sheetMetaText: { fontSize: 14, color: '#3C3C43', flex: 1, lineHeight: 20 },
  sheetFooter: { padding: 20, paddingBottom: 36, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E5EA' },
  sheetSaveBtn: { backgroundColor: '#2C7A3A', borderRadius: 12, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  sheetSaveBtnSaved: { backgroundColor: '#5A9E68' },
  sheetSaveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  sheetMapsBtn: { borderWidth: 1.5, borderColor: '#2C7A3A', borderRadius: 12, paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  sheetMapsBtnText: { fontSize: 16, fontWeight: '600', color: '#2C7A3A' },
});
