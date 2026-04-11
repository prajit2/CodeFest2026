import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="school" />
      <Stack.Screen name="substance" />
      <Stack.Screen name="mental" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
