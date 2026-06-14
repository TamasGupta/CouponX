import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import { colors } from '../constants/colors';

interface Suggestion {
  name: string;
  slug: string;
  icon: string;
  source: 'db' | 'web';
}

interface Props {
  visible: boolean;
  onSelect: (slug: string, name: string) => void;
  onClose: () => void;
}

export default function CategoryPicker({ visible, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [allCategories, setAllCategories] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setSuggestions([]);
      setAllCategories([]);
      return;
    }
    client.get('/categories').then(({ data }) => {
      setAllCategories((data || []).map((c: any) => ({ ...c, source: 'db' as const })));
    }).catch(() => {});
  }, [visible]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await client.get('/categories/search', { params: { q: query } });
        setSuggestions(data.suggestions || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const displayList = query.length >= 2 ? suggestions : allCategories;
  const isSearchingActive = query.length >= 2;

  const handleSelect = (item: Suggestion) => {
    onSelect(item.slug, item.name);
    onClose();
  };

  const handleCreateNew = async () => {
    const slug = query.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) return;
    try {
      const { data } = await client.post('/categories', { name: query, slug, icon: 'pricetag' });
      onSelect(data.slug, data.name);
    } catch {
      onSelect(slug, query);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Select Category</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="Type a brand or category..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray} />
            </TouchableOpacity>
          ) : null}
        </View>

        {isSearching && <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />}

        <FlatList
          data={displayList}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            displayList.length > 0 ? (
              <Text style={styles.sectionTitle}>{isSearchingActive ? 'Results' : 'All Categories'}</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
              <Ionicons name={item.icon as any} size={22} color={colors.primary} />
              <View style={styles.itemBody}>
                <Text style={styles.itemName}>{item.name}</Text>
                {isSearchingActive && (
                  <Text style={styles.itemSource}>{item.source === 'web' ? 'Suggested' : 'Available'}</Text>
                )}
              </View>
              <Ionicons name="add-circle-outline" size={22} color={colors.gray} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !isSearching ? (
              <View style={styles.empty}>
                <Ionicons name={isSearchingActive ? 'search-outline' : 'pricetags-outline'} size={40} color={colors.gray} />
                <Text style={styles.emptyText}>
                  {isSearchingActive ? `No results for "${query}"` : 'No categories yet'}
                </Text>
                {isSearchingActive && (
                  <TouchableOpacity style={styles.createBtn} onPress={handleCreateNew}>
                    <Ionicons name="add" size={18} color={colors.white} />
                    <Text style={styles.createBtnText}>Create "{query}"</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, margin: 16, marginTop: 8,
    borderRadius: 12, paddingHorizontal: 14, height: 46,
    borderWidth: 1, borderColor: colors.border, gap: 8,
  },
  input: { flex: 1, fontSize: 15, color: colors.text },
  list: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.gray, marginBottom: 8, textTransform: 'uppercase' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 12,
    padding: 14, marginBottom: 8,
  },
  itemBody: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.text },
  itemSource: { fontSize: 12, color: colors.gray, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 15, color: colors.gray, marginTop: 12, textAlign: 'center' },
  createBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 16, backgroundColor: colors.primary,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8,
  },
  createBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});
