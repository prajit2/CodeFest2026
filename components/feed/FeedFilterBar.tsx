// FeedFilterBar — Dev 3
// Filter chips at top of Feed screen: All, Food, Shelters, Health, Recovery, Campus

import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native'
import { useState } from 'react'
const FILTERS = ['All', 'Food', 'Shelters', 'Health', 'Recovery', 'Campus', 'Support Groups']

// TODO: Dev 3 — active filter drives what feed items are shown
// TODO: Dev 3 — hide 'Campus' filter if user is not a student (check useOnboardingStore)

export function FeedFilterBar() {
  const [active, setActive] = useState('All')

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, active === f && styles.chipActive]}
            onPress={() => setActive(f)}
          >
            <Text style={[styles.label, active === f && styles.labelActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { paddingTop: 56, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', backgroundColor: '#F2F2F7' },
  scroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E5E5EA', backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#E8F5E9', borderColor: '#2C7A3A' },
  label: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  labelActive: { color: '#2C7A3A' },
})
