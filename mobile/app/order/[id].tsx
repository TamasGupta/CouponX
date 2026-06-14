import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!token) { router.replace('/(auth)/login'); return; }
    client.get('/orders').then(({ data }) => {
      const all = [...data.bought, ...data.sold];
      setOrder(all.find((o: any) => o._id === id));
    });
  }, [id]);

  const startChat = async (participantId: string) => {
    try {
      const { data } = await client.post('/chat/conversations', { participantId });
      router.push(`/chat/${data._id}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to start chat');
    }
  };

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const otherParty = order.seller?._id === user?.id ? order.buyer : order.seller;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{order.offer?.title}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, { color: order.status === 'completed' ? colors.success : colors.warning }]}>
            {order.status}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{order.type === 'free' ? 'Free' : `Paid - ₹${order.amount}`}</Text>
        </View>
        {otherParty && (
          <View style={styles.row}>
            <Text style={styles.label}>{order.seller?._id === user?.id ? 'Buyer' : 'Seller'}</Text>
            <Text style={styles.value}>{otherParty.name}</Text>
          </View>
        )}
      </View>

      {otherParty?._id && (
        <TouchableOpacity style={styles.contactBtn} onPress={() => startChat(otherParty._id)}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.white} />
          <Text style={styles.contactText}>Contact {otherParty.name}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: 20 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 14, color: colors.gray },
  value: { fontSize: 14, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 20, backgroundColor: colors.primary,
    borderRadius: 12, padding: 16, gap: 8,
  },
  contactText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
