// Onboarding Step 5 — All set
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function OnboardingStep5() {
  const router = useRouter();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const isStudent = useUserStore((s) => s.isStudent);
  const substanceSupport = useUserStore((s) => s.substanceSupport);
  const mentalHealthSupport = useUserStore((s) => s.mentalHealthSupport);

  function finish() {
    completeOnboarding();
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.dot, styles.dotDone]} />
        ))}
      </View>

      <View style={styles.checkmark}>
        <FontAwesome name="check-circle" size={64} color="#2C7A3A" />
      </View>

      <Text style={styles.title}>You're all set.</Text>
      <Text style={styles.subtitle}>
        Rocky is ready to help you find food, shelter, transit, and support across Philadelphia.
      </Text>

      <View style={styles.summary}>
        <SummaryRow label="Student resources" active={isStudent} />
        <SummaryRow label="Recovery support" active={substanceSupport} />
        <SummaryRow label="Mental health resources" active={mentalHealthSupport} />
      </View>

      <Text style={styles.privacy}>
        Your preferences are saved only on this device and never sent to a server.
      </Text>

      <TouchableOpacity style={styles.btn} onPress={finish}>
        <Text style={styles.btnText}>Open Rocky</Text>
      </TouchableOpacity>
    </View>
  );
}

function SummaryRow({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <FontAwesome name={active ? 'check' : 'times'} size={14} color={active ? '#2C7A3A' : '#C7C7CC'} style={styles.summaryIcon} />
      <Text style={[styles.summaryText, !active && styles.summaryTextOff]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 32, justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 8, marginBottom: 40, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5EA' },
  dotDone: { backgroundColor: '#2C7A3A' },
  checkmark: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6C6C70', lineHeight: 24, marginBottom: 32, textAlign: 'center' },
  summary: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 16, gap: 12, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { width: 16, textAlign: 'center' },
  summaryText: { fontSize: 15, color: '#1C1C1E' },
  summaryTextOff: { color: '#C7C7CC' },
  privacy: { fontSize: 12, color: '#8E8E93', textAlign: 'center', marginBottom: 32 },
  btn: { backgroundColor: '#2C7A3A', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
