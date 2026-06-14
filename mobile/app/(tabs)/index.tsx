import { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOffersStore } from '../../store/offers';
import { colors } from '../../constants/colors';

export default function HomeScreen() {
  const { offers, isLoading, fetchOffers, fetchMore } = useOffersStore();

  useEffect(() => {
    fetchOffers();
  }, []);

  const renderOffer = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/offer/${item._id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardPrice}>
          {item.sellingPrice === 0 ? 'FREE' : `₹${item.sellingPrice}`}
        </Text>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.categoryBadge}>
          <Ionicons name={getCategoryIcon(item.category)} size={12} color={colors.primary} />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.sellerText}>{item.seller?.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>CouponX</Text>
        <Text style={styles.subtitle}>Discover deals near you</Text>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item) => item._id}
        renderItem={renderOffer}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => fetchOffers()} />
        }
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="pricetags-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyText}>No offers yet</Text>
            </View>
          ) : null
        }
        ListFooterComponent={isLoading && offers.length > 0 ? <ActivityIndicator style={{ padding: 16 }} /> : null}
      />
    </View>
  );
}

function getCategoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    swiggy: 'fast-food', flipkart: 'cart', myntra: 'shirt',
    movie: 'film', train: 'train', bus: 'bus', other: 'gift',
  };
  return icons[category] || 'pricetag';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1, color: colors.text },
  cardPrice: { fontSize: 16, fontWeight: '700', color: colors.primary, marginLeft: 12 },
  cardDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 12, color: colors.primary, marginLeft: 4, textTransform: 'capitalize' },
  sellerText: { fontSize: 12, color: colors.gray },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: colors.gray, marginTop: 12 },
});
