import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';

export default function OrdersScreen() {
  const [tab, setTab] = useState<'bought' | 'sold'>('bought');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const startChat = async (participantId: string) => {
    try {
      const { data } = await client.post('/chat/conversations', { participantId });
      router.push(`/chat/${data._id}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to start chat');
    }
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await client.get('/orders');
      const list = tab === 'bought' ? data.bought : data.sold;
      setOrders(list);
    } finally {
      setIsLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'completed': return colors.primary;
      case 'cancelled': return colors.error;
      default: return colors.warning;
    }
  };

  return (
    <View style={styles.container}>
      {!token ? (
        <View style={styles.center}>
          <Ionicons name="receipt-outline" size={72} color={colors.gray} />
          <Text style={styles.loginTitle}>Login to view your orders</Text>
          <Text style={styles.loginSub}>Track your bought and sold coupons</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <> 
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'bought' && styles.tabActive]} onPress={() => setTab('bought')}>
          <Text style={[styles.tabText, tab === 'bought' && styles.tabTextActive]}>Bought</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'sold' && styles.tabActive]} onPress={() => setTab('sold')}>
          <Text style={[styles.tabText, tab === 'sold' && styles.tabTextActive]}>Sold</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchOrders} />}
        renderItem={({ item }) => {
          const otherParty = tab === 'bought' ? item.seller : item.buyer;
          return (
            <View style={styles.card}>
              <TouchableOpacity style={styles.cardContent} onPress={() => router.push(`/order/${item._id}`)}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.offer?.title || 'Offer'}</Text>
                  <View style={styles.badgesRow}>
                    {item.couponCode && (
                      <View style={[styles.badge, { backgroundColor: colors.primary + '20', marginRight: 6 }]}>
                        <Ionicons name="pricetag" size={12} color={colors.primary} />
                      </View>
                    )}
                    <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                      <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.cardDetail}>
                  {tab === 'bought' ? `From: ${item.seller?.name}` : `To: ${item.buyer?.name}`}
                  {' • '}{item.type === 'free' ? 'FREE' : `₹${item.amount}`}
                </Text>
              </TouchableOpacity>
              {otherParty?._id && otherParty._id !== user?.id && (
                <TouchableOpacity style={styles.contactBtn} onPress={() => startChat(otherParty._id)}>
                  <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                  <Text style={styles.contactText}>Contact</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.gray} />
            <Text style={styles.emptyText}>No {tab} orders yet</Text>
          </View>
        }
      />
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: 'row', margin: 16, backgroundColor: colors.white, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.gray },
  tabTextActive: { color: colors.white },
  list: { paddingHorizontal: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardContent: { padding: 16 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgesRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', flex: 1, color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 8 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  cardDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 8 },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 10, borderTopWidth: 1, borderTopColor: colors.border, gap: 6,
  },
  contactText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: colors.gray, marginTop: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  loginTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16 },
  loginSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  loginBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14 },
  loginBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
