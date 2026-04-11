import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { CRISIS_RESOURCES } from '@/services/rockyIntent';

export function CrisisPanel() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Immediate Help Available</Text>
      {CRISIS_RESOURCES.map((r) => (
        <TouchableOpacity
          key={r.phone}
          style={styles.row}
          onPress={() => Linking.openURL(`tel:${r.phone}`)}
        >
          <View style={styles.info}>
            <Text style={styles.name}>{r.name}</Text>
            <Text style={styles.desc}>{r.description}</Text>
          </View>
          <Text style={styles.phone}>{r.phone}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFF3F3', borderRadius: 12, margin: 16, padding: 16 },
  title: { fontSize: 14, fontWeight: '700', color: '#C0392B', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#FADADD' },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  desc: { fontSize: 12, color: '#6C6C70', marginTop: 2 },
  phone: { fontSize: 14, fontWeight: '700', color: '#C0392B' },
});
