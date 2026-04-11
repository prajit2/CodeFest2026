import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Resource } from '@/constants/types';
import { MARKER_COLORS, MARKER_LABELS } from '@/constants/mapColors';

interface Props {
  resource: Resource;
  onClose: () => void;
}

export function ResourceDetailPanel({ resource, onClose }: Props) {
  const accentColor = MARKER_COLORS[resource.category];

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

        {resource.nearestSeptaStops && resource.nearestSeptaStops.length > 0 && (
          <View style={styles.septaBlock}>
            <Text style={styles.septaLabel}>Nearest SEPTA</Text>
            {resource.nearestSeptaStops.map((stop) => (
              <Text key={stop.id} style={styles.septaStop}>
                {stop.name} — {stop.routes.join(', ')}
              </Text>
            ))}
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
  septaStop: { fontSize: 13, color: '#3C3C43' },
});
