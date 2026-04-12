import { StyleSheet, ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { useMapStore } from '@/store/mapStore';
import { useUserStore } from '@/store/userStore';
import { ResourceCategory } from '@/constants/types';
import { MARKER_COLORS, MARKER_LABELS } from '@/constants/mapColors';

const CATEGORIES: ResourceCategory[] = [
  'food_bank',
  'shelter',
  'clinic',
  'mental_health',
  'septa',
  'support_group',
  'campus_resource',
];

export function LayerFilterPanel() {
  const visibleCategories = useMapStore((s) => s.visibleCategories);
  const crimeOverlayVisible = useMapStore((s) => s.crimeOverlayVisible);
  const toggleCategory = useMapStore((s) => s.toggleCategory);
  const toggleCrimeOverlay = useMapStore((s) => s.toggleCrimeOverlay);
  const isStudent = useUserStore((s) => s.isStudent);

  const showAllCategories = useMapStore((s) => s.showAllCategories);
  const categories = isStudent ? CATEGORIES : CATEGORIES.filter((c) => c !== 'campus_resource');
  const anyHidden = categories.some((c) => !visibleCategories[c]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {anyHidden && (
          <TouchableOpacity
            style={[styles.chip, { borderColor: '#1C1C1E', backgroundColor: '#1C1C1E' }]}
            onPress={showAllCategories}
            activeOpacity={0.7}
          >
            <Text style={styles.chipTextActive}>Show All</Text>
          </TouchableOpacity>
        )}
        {categories.map((cat) => {
          const active = visibleCategories[cat];
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, { borderColor: MARKER_COLORS[cat] }, active && { backgroundColor: MARKER_COLORS[cat] }]}
              onPress={() => toggleCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {MARKER_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.chip, { borderColor: '#F44336' }, crimeOverlayVisible && { backgroundColor: '#F44336' }]}
          onPress={toggleCrimeOverlay}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, crimeOverlayVisible && styles.chipTextActive]}>
            Crime Overlay
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
  },
  scroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
