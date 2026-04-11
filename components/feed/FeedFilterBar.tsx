// FeedFilterBar — Dev 3
// Filter chips at top of Feed screen: All, Food, Shelters, Health, Recovery, Campus

import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native'

const ALL_FILTERS = ['All', 'Food', 'Shelters', 'Health', 'Recovery', 'Support Groups', 'Campus']

interface FeedFilterBarProps {
  active: string
  onSelect: (filter: string) => void
  showCampus: boolean
}

export function FeedFilterBar({ active, onSelect, showCampus }: FeedFilterBarProps) {
  const filters = showCampus ? ALL_FILTERS : ALL_FILTERS.filter(f => f !== 'Campus')

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filters.map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, active === f && styles.chipActive]}
            onPress={() => onSelect(f)}
          >
            <Text style={[styles.label, active === f && styles.labelActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { borderBottomWidth: 1, borderBottomColor: '#E5E5EA', backgroundColor: '#F2F2F7' },
  scroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E5E5EA', backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#E8F5E9', borderColor: '#2C7A3A' },
  label: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  labelActive: { color: '#2C7A3A' },
})
