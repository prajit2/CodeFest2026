import { StyleSheet, View, Text, TouchableOpacity, Linking, ActivityIndicator, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Resource } from '@/constants/types';
import { MARKER_COLORS, MARKER_LABELS } from '@/constants/mapColors';
import { api } from '@/services/api';
import { SeptaArrivalSchema } from '@/services/apiTypes';

interface Props {
  resource: Resource;
  onClose: () => void;
}

export function ResourceDetailPanel({ resource, onClose }: Props) {
  const accentColor = MARKER_COLORS[resource.category];

  const [arrivalsMap, setArrivalsMap] = useState<Record<string, SeptaArrivalSchema[]>>({});
  const [arrivalsLoading, setArrivalsLoading] = useState(false);

  useEffect(() => {
    const stops = resource.nearestSeptaStops;
    if (!stops || stops.length === 0) {
      setArrivalsMap({});
      return;
    }

    let cancelled = false;
    setArrivalsLoading(true);
    setArrivalsMap({});

    Promise.all(
      stops.map((stop) =>
        api.transit.arrivals(stop.id)
          .then((arrivals) => ({ stopId: stop.id, arrivals }))
          .catch(() => ({ stopId: stop.id, arrivals: [] as SeptaArrivalSchema[] }))
      )
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, SeptaArrivalSchema[]> = {};
      results.forEach(({ stopId, arrivals }) => {
        map[stopId] = arrivals;
      });
      setArrivalsMap(map);
      setArrivalsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [resource]);

  function openMaps() {
    if (!resource.address) return;
    const encoded = encodeURIComponent(resource.address);
    const url = Platform.OS === 'ios'
      ? `maps:0,0?q=${encoded}`
      : `geo:0,0?q=${encoded}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${encoded}`)
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.colorBar, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.category}>{MARKER_LABELS[resource.category]}</Text>
            <Text style={styles.name}>{resource.name}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <FontAwesome name="times" size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <FontAwesome name="map-marker" size={14} color="#8E8E93" style={styles.icon} />
          <Text style={styles.detail}>{resource.address}</Text>
        </View>

        {resource.hours && (
          <View style={styles.row}>
            <FontAwesome name="clock-o" size={14} color="#8E8E93" style={styles.icon} />
            <Text style={styles.detail}>{resource.hours}</Text>
          </View>
        )}

        {resource.phone && (
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`tel:${resource.phone}`)}>
            <FontAwesome name="phone" size={14} color="#2C7A3A" style={styles.icon} />
            <Text style={[styles.detail, styles.link]}>{resource.phone}</Text>
          </TouchableOpacity>
        )}

        {resource.address && (
          <TouchableOpacity style={styles.row} onPress={openMaps} activeOpacity={0.75}>
            <FontAwesome name="map-o" size={13} color="#2C7A3A" style={styles.icon} />
            <Text style={[styles.detail, styles.link]}>Open in Maps</Text>
          </TouchableOpacity>
        )}

        {resource.nearestSeptaStops && resource.nearestSeptaStops.length > 0 && (
          <View style={styles.septaBlock}>
            <Text style={styles.septaLabel}>Nearest SEPTA</Text>
            {arrivalsLoading ? (
              <ActivityIndicator size="small" color="#8E8E93" style={styles.loadingIndicator} />
            ) : (
              resource.nearestSeptaStops.map((stop) => {
                const arrivals = arrivalsMap[stop.id] ?? [];
                return (
                  <View key={stop.id} style={styles.stopBlock}>
                    <Text style={styles.septaStop}>{stop.name}</Text>
                    {arrivals.length === 0 ? (
                      <Text style={styles.arrivalNone}>No arrivals data</Text>
                    ) : (
                      arrivals.slice(0, 3).map((arrival, index) => (
                        <Text key={index} style={styles.arrivalRow}>
                          {arrival.route} → {arrival.destination}: {arrival.minutes_away} min
                        </Text>
                      ))
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  colorBar: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 32,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleBlock: { flex: 1, marginRight: 12 },
  category: { fontSize: 11, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 16, textAlign: 'center' },
  detail: { fontSize: 14, color: '#3C3C43', flex: 1 },
  link: { color: '#2C7A3A', fontWeight: '500' },
  septaBlock: { marginTop: 4 },
  septaLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 4 },
  septaStop: { fontSize: 13, fontWeight: '600', color: '#3C3C43' },
  stopBlock: { marginBottom: 8 },
  arrivalRow: { fontSize: 13, color: '#3C3C43', marginTop: 2 },
  arrivalNone: { fontSize: 13, color: '#8E8E93', fontStyle: 'italic', marginTop: 2 },
  loadingIndicator: { alignSelf: 'flex-start', marginTop: 4 },
});
