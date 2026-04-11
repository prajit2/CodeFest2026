import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { University } from '@/constants/types';

const UNIVERSITIES: { value: University; label: string }[] = [
  { value: 'drexel', label: 'Drexel University' },
  { value: 'temple', label: 'Temple University' },
  { value: 'upenn', label: 'University of Pennsylvania' },
  { value: 'ccp', label: 'Community College of Philadelphia' },
  { value: 'saint_josephs', label: "Saint Joseph's University" },
  { value: 'lasalle', label: 'La Salle University' },
  { value: 'other', label: 'Other' },
];

function SettingRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E5EA', true: '#2C7A3A' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    isStudent, university,
    substanceSupport, mentalHealthSupport,
    setIsStudent, setUniversity,
    setSubstanceSupport, setMentalHealthSupport,
    reset,
  } = useUserStore();

  function confirmReset() {
    Alert.alert(
      'Reset preferences?',
      'This will restart the onboarding flow and clear all saved preferences.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive', onPress: () => {
            reset();
            router.replace('/onboarding');
          },
        },
      ],
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="STUDENT" />
      <View style={styles.card}>
        <SettingRow label="I'm a student" value={isStudent} onToggle={setIsStudent} />
        {isStudent && (
          <View style={styles.uniSection}>
            <Text style={styles.uniLabel}>My university</Text>
            {UNIVERSITIES.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={styles.uniOption}
                onPress={() => setUniversity(u.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.uniOptionText, university === u.value && styles.uniOptionSelected]}>
                  {u.label}
                </Text>
                {university === u.value && (
                  <FontAwesome name="check" size={14} color="#2C7A3A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <SectionHeader title="SUPPORT RESOURCES" />
      <View style={styles.card}>
        <SettingRow
          label="Recovery & substance support"
          value={substanceSupport}
          onToggle={setSubstanceSupport}
        />
        <View style={styles.divider} />
        <SettingRow
          label="Mental health resources"
          value={mentalHealthSupport}
          onToggle={setMentalHealthSupport}
        />
      </View>
      <Text style={styles.hint}>
        These preferences personalize the Feed and Rocky suggestions. All data stays on your device.
      </Text>

      <SectionHeader title="ACCOUNT" />
      <View style={styles.card}>
        <TouchableOpacity style={styles.destructiveRow} onPress={confirmReset}>
          <Text style={styles.destructiveText}>Reset preferences & redo onboarding</Text>
          <FontAwesome name="chevron-right" size={12} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Rocky — Philadelphia Resource Assistant{'\n'}Built for CodeFest 2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { paddingBottom: 40 },
  sectionHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel: { fontSize: 15, color: '#1C1C1E' },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginLeft: 16 },
  uniSection: { borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingBottom: 8 },
  uniLabel: { fontSize: 13, color: '#8E8E93', paddingHorizontal: 16, paddingVertical: 10 },
  uniOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
  uniOptionText: { fontSize: 15, color: '#1C1C1E' },
  uniOptionSelected: { color: '#2C7A3A', fontWeight: '600' },
  hint: { fontSize: 12, color: '#8E8E93', marginHorizontal: 20, marginTop: 8, lineHeight: 18 },
  destructiveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  destructiveText: { fontSize: 15, color: '#C0392B' },
  footer: { textAlign: 'center', fontSize: 12, color: '#C7C7CC', marginTop: 40, lineHeight: 18 },
});
