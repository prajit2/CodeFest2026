// Onboarding Step 1 — Are you a student?
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function OnboardingStep1() {
  const router = useRouter();
  const setIsStudent = useUserStore((s) => s.setIsStudent);

  function select(isStudent: boolean) {
    setIsStudent(isStudent);
    router.push(isStudent ? '/onboarding/school' : '/onboarding/substance');
  }

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Text style={styles.title}>Are you a student?</Text>
      <Text style={styles.subtitle}>
        We'll show campus free food events and resources from your university.
      </Text>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => select(true)}>
        <Text style={styles.btnPrimaryText}>Yes, I'm a student</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSecondary} onPress={() => select(false)}>
        <Text style={styles.btnSecondaryText}>No, skip this</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 32, justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 8, marginBottom: 48, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5EA' },
  dotActive: { backgroundColor: '#2C7A3A', width: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#6C6C70', lineHeight: 24, marginBottom: 40 },
  btnPrimary: { backgroundColor: '#2C7A3A', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  btnSecondary: { borderRadius: 12, padding: 16, alignItems: 'center' },
  btnSecondaryText: { color: '#6C6C70', fontSize: 16 },
});
