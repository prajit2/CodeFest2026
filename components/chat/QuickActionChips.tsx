import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CHIPS = [
  'I need free food near me',
  'Show me shelters',
  'Mental health support',
  'NA/AA meetings nearby',
  'Health clinic near me',
  'SEPTA stops near me',
];

interface Props {
  onSelect: (prompt: string) => void;
}

export function QuickActionChips({ onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CHIPS.map((chip) => (
        <TouchableOpacity key={chip} style={styles.chip} onPress={() => onSelect(chip)} activeOpacity={0.7}>
          <Text style={styles.chipText}>{chip}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: { backgroundColor: '#F2F2F7', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13, color: '#2C7A3A', fontWeight: '600' },
});
