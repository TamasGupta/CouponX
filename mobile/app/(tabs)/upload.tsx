import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import client from '../../api/client';
import { colors } from '../../constants/colors';
import { categories } from '../../constants/categories';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      Alert.alert('Error', 'Title, description and category are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await client.post('/offers', {
        title,
        description,
        sellingPrice: parseFloat(sellingPrice) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      });
      Alert.alert('Success', 'Offer created successfully!', [
        { text: 'OK', onPress: () => {
          setTitle(''); setDescription(''); setSellingPrice('');
          setOriginalPrice(''); setCategory(''); setExpiryDate('');
          router.push('/(tabs)');
        }},
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Offer</Text>
      <Text style={styles.subtitle}>Share your unused coupons & tickets</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} placeholder="e.g. Swiggy ₹200 off" value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the offer details, expiry, terms..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
            onPress={() => setCategory(cat.id)}
          >
            <Ionicons name={cat.icon as any} size={16} color={category === cat.id ? colors.white : colors.primary} />
            <Text style={[styles.categoryText, category === cat.id && styles.categoryTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Selling Price (₹) — 0 for free</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        value={sellingPrice}
        onChangeText={setSellingPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Original Price (₹) — optional</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 500"
        value={originalPrice}
        onChangeText={setOriginalPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Expiry Date — optional</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={expiryDate}
        onChangeText={setExpiryDate}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Posting...' : 'Post Offer'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { fontSize: 13, color: colors.primary, marginLeft: 6 },
  categoryTextActive: { color: colors.white },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
