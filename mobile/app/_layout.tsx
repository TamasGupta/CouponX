import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/auth';
import { connectSocket, disconnectSocket } from '../api/socket';
import { colors } from '../constants/colors';

export default function RootLayout() {
  const isReady = useAuthStore((s) => s.isReady);
  const loadStoredToken = useAuthStore((s) => s.loadStoredToken);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    loadStoredToken();
  }, []);

  useEffect(() => {
    if (token) {
      useAuthStore.getState().loadUser();
      connectSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token]);

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
        <Text style={styles.title}>CouponX</Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen
          name="offer/[id]"
          options={{ headerShown: true, title: 'Offer Details', headerTintColor: colors.primary }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ headerShown: true, title: 'Chat', headerTintColor: colors.primary }}
        />
        <Stack.Screen
          name="order/[id]"
          options={{ headerShown: true, title: 'Order Details', headerTintColor: colors.primary }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  logo: { width: 80, height: 80, borderRadius: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginTop: 12 },
});
