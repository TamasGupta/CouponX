import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuthStore } from '../../store/auth';
import { colors } from '../../constants/colors';

export default function ListingsScreen() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await client.get('/offers', { params: { seller: user?.id } });
      setListings(data.offers || data);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <View style={styles.container}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchListings} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/offer/${item._id}`)}>
            <View style={styles.cardRow}>
              {item.images?.length > 0 ? (
                <Image source={{ uri: item.images[0] }} style={styles.thumb} />
              ) : null}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardPrice}>
                  {item.sellingPrice === 0 ? 'FREE' : `₹${item.sellingPrice}`}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.cardFooter}>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? colors.success + '20' : colors.warning + '20' }]}>
                <Text style={[styles.statusText, { color: item.status === 'active' ? colors.success : colors.warning }]}>
                  {item.status}
                </Text>
              </View>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="pricetags-outline" size={48} color={colors.gray} />
            <Text style={styles.emptyText}>No listings yet</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(tabs)/upload')}>
              <Text style={styles.createBtnText}>Create Offer</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 48, height: 48, borderRadius: 10, marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardPrice: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 },
  cardDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  dateText: { fontSize: 12, color: colors.gray },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: colors.gray, marginTop: 12 },
  createBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});
