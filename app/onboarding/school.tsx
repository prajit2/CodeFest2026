// Onboarding Step 2 — Which school?
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { University } from '@/constants/types';

const SCHOOLS: { label: string; value: University }[] = [
  { label: 'Drexel University', value: 'drexel' },
  { label: 'Temple University', value: 'temple' },
  { label: 'University of Pennsylvania', value: 'upenn' },
  { label: 'Community College of Philadelphia', value: 'ccp' },
  { label: "Saint Joseph's University", value: 'saint_josephs' },
  { label: 'La Salle University', value: 'lasalle' },
  { label: 'Other', value: 'other' },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const setUniversity = useUserStore((s) => s.setUniversity);

  function select(university: University) {
    setUniversity(university);
    router.push('/onboarding/substance');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.progress}>
        <View style={styles.dotDone} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Text style={styles.title}>Which school?</Text>
      <Text style={styles.subtitle}>We'll surface free food events specific to your campus.</Text>

      <View style={styles.list}>
        {SCHOOLS.map((school) => (
          <TouchableOpacity key={school.value} style={styles.option} onPress={() => select(school.value)}>
            <Text style={styles.optionText}>{school.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', padding: 32, paddingTop: 64 },
  progress: { flexDirection: 'row', gap: 8, marginBottom: 48, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5EA' },
  dotActive: { backgroundColor: '#2C7A3A', width: 24 },
  dotDone: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2C7A3A' },
  title: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#6C6C70', lineHeight: 24, marginBottom: 32 },
  list: { gap: 12 },
  option: { borderWidth: 1.5, borderColor: '#E5E5EA', borderRadius: 12, padding: 16 },
  optionText: { fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
});
