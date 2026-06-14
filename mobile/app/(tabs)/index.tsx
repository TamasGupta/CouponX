import { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image, Dimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useOffersStore } from '../../store/offers';
import { useCategoriesStore } from '../../store/categories';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { offers, isLoading, fetchOffers, fetchMore } = useOffersStore();
  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const [banners, setBanners] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const bannerRef = useRef<FlatList>(null);
  const bannerIndex = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offersFetched = useRef(false);

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      client.get('/banners').then(({ data }) => setBanners(data)).catch(() => {}),
    ]).then(() => {
      if (offersFetched.current) setInitialLoading(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOffers().then(() => {
        offersFetched.current = true;
        setInitialLoading(false);
      });
    }, [])
  );

  useEffect(() => {
    if (banners.length < 2) return;
    timerRef.current = setInterval(() => {
      bannerIndex.current = (bannerIndex.current + 1) % banners.length;
      bannerRef.current?.scrollToIndex({ index: bannerIndex.current, animated: true });
    }, 2000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length]);

  const onScrollToIndexFailed = () => {
    bannerIndex.current = 0;
    bannerRef.current?.scrollToIndex({ index: 0, animated: true });
  };

  const getCategoryIcon = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    return (cat?.icon || 'pricetag') as keyof typeof Ionicons.glyphMap;
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const renderOffer = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/offer/${item._id}`)}>
      <View style={styles.cardHeader}>
        {item.images?.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.thumb} />
        ) : null}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardPrice}>{item.sellingPrice === 0 ? 'FREE' : `₹${item.sellingPrice}`}</Text>
        </View>
        {item.expiryDate && (
          <View style={styles.expiryBadge}>
            <Ionicons name="calendar-outline" size={11} color={colors.gray} />
            <Text style={styles.expiryText}>{formatDate(item.expiryDate)}</Text>
          </View>
        )}
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

  if (initialLoading) {
    return (
      <View style={styles.splash}>
        <Image source={require('../../assets/icon.png')} style={styles.splashLogo} />
        <Text style={styles.splashText}>CouponX</Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const ListHeader = () => (
    <>
      {banners.length > 0 && (
        <FlatList
          ref={bannerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={banners}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.bannerList}
          onScrollToIndexFailed={onScrollToIndexFailed}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.bannerCard} onPress={() => item.link && router.push(item.link)}>
              <Image source={{ uri: item.image }} style={styles.bannerImage} />
            </TouchableOpacity>
          )}
        />
      )}

      {categories.length > 0 && (
        <View style={styles.brandsSection}>
          <Text style={styles.sectionTitle}>Popular Brands</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.slug}
            contentContainerStyle={styles.brandsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.brandChip, { backgroundColor: item.color || colors.white }]}
                onPress={() => router.push(`/(tabs)/search?category=${item.slug}`)}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.chipBg} />
                ) : null}
                <Ionicons name={item.icon as any} size={16} color="#333" />
                <Text style={styles.brandName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={offers}
        keyExtractor={(item) => item._id}
        renderItem={renderOffer}
        contentContainerStyle={styles.list}
        ListHeaderComponent={ListHeader}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchOffers()} />}
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

const BANNER_HEIGHT = width * 0.42;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: 20 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  splashLogo: { width: 80, height: 80, borderRadius: 20 },
  splashText: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginTop: 12 },

  bannerList: { marginBottom: 8 },
  bannerCard: {
    width, height: BANNER_HEIGHT,
  },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  brandsSection: { marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginHorizontal: 20, marginBottom: 12 },
  brandsList: { paddingHorizontal: 16, gap: 10 },
  brandChip: {
    alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14,
    overflow: 'hidden',
  },
  chipBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 14 },
  brandName: { fontSize: 12, fontWeight: '600', color: '#333', marginTop: 4 },
  card: {
    marginHorizontal: 20,
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 48, height: 48, borderRadius: 10, marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardPrice: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 },
  cardDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 12, color: colors.primary, marginLeft: 4, textTransform: 'capitalize' },
  sellerText: { fontSize: 12, color: colors.gray },
  expiryBadge: { alignItems: 'center', marginLeft: 8 },
  expiryText: { fontSize: 11, color: colors.gray, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: colors.gray, marginTop: 12 },
});
