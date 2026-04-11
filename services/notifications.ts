import * as Notifications from 'expo-notifications';

export async function scheduleEventReminder(
  eventId: string,
  title: string,
  startTime: string,
): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const triggerDate = new Date(new Date(startTime).getTime() - 30 * 60 * 1000);
  if (triggerDate <= new Date()) return null; // event already past

  return Notifications.scheduleNotificationAsync({
    content: { title: 'Coming up in 30 min', body: title, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function cancelEventReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
