import { Stack } from 'expo-router';
import { colors } from '../../constants/colors';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="listings" options={{ title: 'My Listings' }} />
      <Stack.Screen name="reviews" options={{ title: 'My Reviews' }} />
      <Stack.Screen name="conversations" options={{ title: 'Messages' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
    </Stack>
  );
}
