import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/auth';
import { colors } from '../constants/colors';

export default function RootLayout() {
  const loadStoredToken = useAuthStore((s) => s.loadStoredToken);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    loadStoredToken();
  }, []);

  useEffect(() => {
    if (token) useAuthStore.getState().loadUser();
  }, [token]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="offer/[id]"
          options={{ headerShown: true, title: 'Offer Details', headerTintColor: colors.primary }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ headerShown: true, title: 'Chat', headerTintColor: colors.primary }}
        />
      </Stack>
    </>
  );
}
