// Onboarding Step 4 — Mental health support?
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function OnboardingStep4() {
  const router = useRouter();
  const setMentalHealthSupport = useUserStore((s) => s.setMentalHealthSupport);

  function select(val: boolean) {
    setMentalHealthSupport(val);
    router.push('/onboarding/preferences');
  }

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.dot, i <= 3 && styles.dotDone, i === 3 && styles.dotActive]} />
        ))}
      </View>

      <Text style={styles.title}>Are you looking for mental health support?</Text>
      <Text style={styles.subtitle}>
        We'll surface mental health clinics and crisis lines nearby. This stays on your device only.
      </Text>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => select(true)}>
        <Text style={styles.btnPrimaryText}>Yes, include these</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSecondary} onPress={() => select(false)}>
        <Text style={styles.btnSecondaryText}>No thanks</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 32, justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 8, marginBottom: 48, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5EA' },
  dotActive: { backgroundColor: '#2C7A3A', width: 24 },
  dotDone: { backgroundColor: '#2C7A3A' },
  title: { fontSize: 26, fontWeight: '700', color: '#1C1C1E', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6C6C70', lineHeight: 22, marginBottom: 40 },
  btnPrimary: { backgroundColor: '#2C7A3A', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  btnSecondary: { borderRadius: 12, padding: 16, alignItems: 'center' },
  btnSecondaryText: { color: '#6C6C70', fontSize: 16 },
});
