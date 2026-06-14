import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { colors } from '../../constants/colors';
import { categories } from '../../constants/categories';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === item.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(selectedCategory === item.id ? '' : item.id)}
          >
            <Ionicons
              name={item.icon as any}
              size={16}
              color={selectedCategory === item.id ? colors.white : colors.primary}
            />
            <Text style={[styles.categoryLabel, selectedCategory === item.id && styles.categoryLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={results}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.list}
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
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryLabel: { fontSize: 13, color: colors.primary, marginLeft: 6 },
  categoryLabelActive: { color: colors.white },
  list: { paddingHorizontal: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', flex: 1, color: colors.text },
  cardPrice: { fontSize: 15, fontWeight: '700', color: colors.primary, marginLeft: 12 },
  cardSeller: { fontSize: 12, color: colors.gray, marginTop: 6 },
  empty: { textAlign: 'center', color: colors.gray, marginTop: 40, fontSize: 15 },
});
