// Onboarding Step 3 — Substance abuse support?
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function OnboardingStep3() {
  const router = useRouter();
  const isStudent = useUserStore((s) => s.isStudent);
  const setSubstanceSupport = useUserStore((s) => s.setSubstanceSupport);

  const stepIndex = isStudent ? 3 : 2;

  function select(val: boolean) {
    setSubstanceSupport(val);
    router.push('/onboarding/mental');
  }

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < stepIndex && styles.dotDone,
              i === stepIndex - 1 && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <Text style={styles.title}>Are you looking for substance use recovery support?</Text>
      <Text style={styles.subtitle}>
        We'll include AA/NA meeting schedules and recovery center locations near you. This stays on your device only.
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
