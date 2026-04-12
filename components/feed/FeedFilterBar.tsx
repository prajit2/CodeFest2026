// FeedFilterBar — Dev 3
// Filter chips at top of Feed screen: All, Food, Shelters, Health, Recovery, Campus, Support Groups

import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native'

const ALL_FILTERS = ['All', 'Food', 'Shelters', 'Health', 'Recovery', 'Campus', 'Support Groups'] as const

interface FeedFilterBarProps {
  activeFilter: string
  setActiveFilter: (filter: string) => void
  isStudent: boolean
}

export function FeedFilterBar({ activeFilter, setActiveFilter, isStudent }: FeedFilterBarProps) {
  const filters = ALL_FILTERS.filter((f) => f !== 'Campus' || isStudent)

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filters.map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
            accessibilityRole="button"
            accessibilityState={{ selected: activeFilter === f }}
          >
            <Text style={[styles.label, activeFilter === f && styles.labelActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { borderBottomWidth: 1, borderBottomColor: '#E5E5EA', backgroundColor: '#F2F2F7' },
  scroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E5E5EA', backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#E8F5E9', borderColor: '#2C7A3A' },
  label: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  labelActive: { color: '#2C7A3A' },
})
