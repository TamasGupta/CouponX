import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { colors } from '../../constants/colors';
import { useCategoriesStore } from '../../store/categories';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories();
    client.get('/offers').then(({ data }) => setResults(data.offers)).catch(() => {});
  }, []);

  const queryRef = useRef(query);
  const categoryRef = useRef(selectedCategory);
  queryRef.current = query;
  categoryRef.current = selectedCategory;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query && !selectedCategory) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setIsLoading(true);
      setHasSearched(true);
      const params: Record<string, string> = {};
      if (queryRef.current) params.search = queryRef.current;
      if (categoryRef.current) params.category = categoryRef.current;
      client.get('/offers', { params }).then(({ data }) => setResults(data.offers)).catch(() => setResults([])).finally(() => setIsLoading(false));
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.gray} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Search coupons, tickets..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            setIsLoading(true);
            setHasSearched(true);
            const params: Record<string, string> = {};
            if (query) params.search = query;
            if (selectedCategory) params.category = selectedCategory;
            client.get('/offers', { params }).then(({ data }) => setResults(data.offers)).catch(() => setResults([])).finally(() => setIsLoading(false));
          }}
          returnKeyType="search"
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.categoriesWrapper}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.slug}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => {
          const active = selectedCategory === item.slug;
          return (
          <TouchableOpacity
            style={[styles.categoryChip, { backgroundColor: active ? '#333' : (item.color || '#eee') }]}
            onPress={() => setSelectedCategory(active ? '' : item.slug)}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.chipBg} resizeMode="cover" />
            ) : null}
            <Ionicons
              name={item.icon as any}
              size={14}
              color={active ? '#fff' : '#333'}
            />
            <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
          );
        }}
      />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item: any) => item._id}
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }: any) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/offer/${item._id}`)}>
            <View style={styles.cardInner}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardPrice}>{item.sellingPrice === 0 ? 'FREE' : `₹${item.sellingPrice}`}</Text>
            </View>
            <Text style={styles.cardSeller}>{item.seller?.name} • {item.category}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty}>No offers found</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, fontSize: 15, color: colors.text },
  categoriesWrapper: { height: 25, marginBottom: 8, paddingLeft: 16 },
  categories: { paddingRight: 16 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 25,
    borderRadius: 12,
    marginRight: 8,
    overflow: 'hidden',
  },
  categoryChipActive: {},
  chipBg: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, resizeMode: 'cover' },
  categoryLabel: { fontSize: 12, color: '#333', marginLeft: 5, fontWeight: '600' },
  categoryLabelActive: { color: colors.white },
  list: { paddingHorizontal: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 72,
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', flex: 1, color: colors.text },
  cardPrice: { fontSize: 15, fontWeight: '700', color: colors.primary, marginLeft: 12 },
  cardSeller: { fontSize: 12, color: colors.gray, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.gray, marginTop: 40, fontSize: 15 },
});
