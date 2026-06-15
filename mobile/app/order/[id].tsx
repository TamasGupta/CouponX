import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const fetchOrder = () => {
    if (!token) { router.replace('/(auth)/login'); return; }
    client.get('/orders').then(({ data }) => {
      const all = [...data.bought, ...data.sold];
      setOrder(all.find((o: any) => o._id === id));
    });
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const startChat = async (participantId: string) => {
    try {
      const { data } = await client.post('/chat/conversations', { participantId });
      router.push(`/chat/${data._id}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to start chat');
    }
  };

  const handleConfirm = async () => {
    setIsUpdating(true);
    try {
      await client.put(`/orders/${id}/status`, { status: 'confirmed' });
      Alert.alert('Confirmed', 'Coupon code has been sent to the buyer');
      fetchOrder();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to confirm');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async () => {
    setIsUpdating(true);
    try {
      await client.put(`/orders/${id}/status`, { status: 'completed' });
      Alert.alert('Completed', 'Order marked as completed');
      fetchOrder();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to complete');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert('Cancel Order', 'Are you sure? The offer will become available again.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          setIsUpdating(true);
          try {
            await client.put(`/orders/${id}/status`, { status: 'cancelled' });
            Alert.alert('Cancelled', 'Order has been cancelled');
            fetchOrder();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to cancel');
          } finally {
            setIsUpdating(false);
          }
        },
      },
    ]);
  };

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isSeller = order.seller?._id === user?.id || order.seller?.id === user?.id;
  const otherParty = isSeller ? order.buyer : order.seller;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{order.offer?.title}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <View style={[styles.badge, { backgroundColor: getStatusBg(order.status) }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{order.type === 'free' ? 'Free' : `Paid - ₹${order.amount}`}</Text>
        </View>
        {order.type === 'paid' && order.paymentId && (
          <View style={styles.row}>
            <Ionicons name="card-outline" size={16} color={colors.success} />
            <Text style={[styles.value, { color: colors.success, fontSize: 12 }]}>Payment completed</Text>
          </View>
        )}
        {otherParty && (
          <View style={styles.row}>
            <Text style={styles.label}>{isSeller ? 'Buyer' : 'Seller'}</Text>
            <Text style={styles.value}>{otherParty.name}</Text>
          </View>
        )}
      </View>

      {order.couponCode ? (
        <View style={styles.couponCard}>
          <View style={styles.couponHeader}>
            <Ionicons name="pricetag" size={20} color={colors.primary} />
            <Text style={styles.couponLabel}>Coupon Code</Text>
          </View>
          <TouchableOpacity style={styles.couponRow} onPress={() => {
            Clipboard.setString(order.couponCode);
            Alert.alert('Copied', 'Coupon code copied to clipboard');
          }}>
            <Text style={styles.couponCode}>{order.couponCode}</Text>
            <Ionicons name="copy-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.couponHint}>Tap to copy</Text>
        </View>
      ) : order.status === 'pending' && (
        <View style={styles.waitingCard}>
          <Ionicons name="time-outline" size={32} color={colors.warning} />
          <Text style={styles.waitingText}>
            {isSeller
              ? 'Confirm this order to send the coupon code to the buyer'
              : 'Waiting for the seller to confirm and provide the coupon code'}
          </Text>
        </View>
      )}

      {isSeller && order.status === 'pending' && (
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={isUpdating}>
          <Ionicons name="checkmark-circle" size={20} color={colors.white} />
          <Text style={styles.confirmBtnText}>{isUpdating ? 'Confirming...' : 'Confirm Order'}</Text>
        </TouchableOpacity>
      )}

      {isSeller && order.status === 'confirmed' && (
        <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} disabled={isUpdating}>
          <Ionicons name="checkmark-done" size={20} color={colors.white} />
          <Text style={styles.completeBtnText}>{isUpdating ? 'Completing...' : 'Mark as Completed'}</Text>
        </TouchableOpacity>
      )}

      {isSeller && (order.status === 'pending' || order.status === 'confirmed') && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={isUpdating}>
          <Ionicons name="close-circle" size={18} color={colors.error} />
          <Text style={styles.cancelBtnText}>Cancel Order</Text>
        </TouchableOpacity>
      )}

      {otherParty?._id && (
        <TouchableOpacity style={styles.contactBtn} onPress={() => startChat(otherParty._id)}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.white} />
          <Text style={styles.contactText}>Contact {otherParty.name}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function getStatusBg(status: string) {
  switch (status) {
    case 'confirmed': return colors.success + '20';
    case 'completed': return colors.primary + '20';
    case 'cancelled': return colors.error + '20';
    default: return colors.warning + '20';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed': return colors.success;
    case 'completed': return colors.primary;
    case 'cancelled': return colors.error;
    default: return colors.warning;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 14, color: colors.gray },
  value: { fontSize: 14, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  couponCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 20, marginTop: 16,
    borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed',
  },
  couponHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  couponLabel: { fontSize: 14, fontWeight: '600', color: colors.primary },
  couponRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.background, borderRadius: 10, padding: 16,
  },
  couponCode: { fontSize: 22, fontWeight: 'bold', color: colors.text, letterSpacing: 2 },
  couponHint: { fontSize: 12, color: colors.gray, textAlign: 'center', marginTop: 8 },
  waitingCard: {
    alignItems: 'center', backgroundColor: colors.white, borderRadius: 16,
    padding: 24, marginTop: 16, gap: 12,
  },
  waitingText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 16, backgroundColor: colors.success, borderRadius: 12, padding: 16, gap: 8,
  },
  confirmBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 16, backgroundColor: colors.primary, borderRadius: 12, padding: 16, gap: 8,
  },
  completeBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, padding: 14, gap: 6,
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: colors.error },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 16, backgroundColor: colors.primary,
    borderRadius: 12, padding: 16, gap: 8,
  },
  contactText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
