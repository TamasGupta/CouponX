import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth';

export default function Index() {
  const token = useAuthStore((s) => s.token);
  const isReady = useAuthStore((s) => s.isReady);

  if (!isReady) return null;

  return token ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
