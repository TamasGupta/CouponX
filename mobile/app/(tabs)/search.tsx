import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  useEffect(() => { fetchCategories(); }, []);

  const search = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (query) params.search = query;
      if (selectedCategory) params.category = selectedCategory;
      const { data } = await client.get('/offers', { params });
      setResults(data.offers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.gray} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Search coupons, tickets..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => { setQuery(''); search(); }}>
            <Ionicons name="close-circle" size={20} color={colors.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.slug}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, { backgroundColor: item.color || colors.white }, selectedCategory === item.slug && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(selectedCategory === item.slug ? '' : item.slug)}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.chipBg} />
            ) : null}
            <Ionicons
              name={item.icon as any}
              size={14}
              color={selectedCategory === item.slug ? colors.white : '#333'}
            />
            <Text style={[styles.categoryLabel, selectedCategory === item.slug && styles.categoryLabelActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={results}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }: any) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/offer/${item._id}`)}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardPrice}>{item.sellingPrice === 0 ? 'FREE' : `₹${item.sellingPrice}`}</Text>
            </View>
            <Text style={styles.cardSeller}>{item.seller?.name} • {item.category}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>No results found</Text> : null
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
  categories: { paddingHorizontal: 16, marginBottom: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    overflow: 'hidden',
  },
  categoryChipActive: { opacity: 0.8 },
  chipBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 14 },
  categoryLabel: { fontSize: 12, color: '#333', marginLeft: 5, fontWeight: '600' },
  categoryLabelActive: { color: colors.white },
  list: { paddingHorizontal: 16 },
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
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48 },
  cardTitle: { fontSize: 15, fontWeight: '600', flex: 1, color: colors.text },
  cardPrice: { fontSize: 15, fontWeight: '700', color: colors.primary, marginLeft: 12 },
  cardSeller: { fontSize: 12, color: colors.gray, marginTop: 6 },
  empty: { textAlign: 'center', color: colors.gray, marginTop: 40, fontSize: 15 },
});
