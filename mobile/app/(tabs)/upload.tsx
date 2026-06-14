import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import CategoryPicker from '../../components/CategoryPicker';
import DatePickerModal from '../../components/DatePickerModal';
import client from '../../api/client';
import { useOffersStore } from '../../store/offers';
import { useAuthStore } from '../../store/auth';
import { colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen() {
  const token = useAuthStore((s) => s.token);
  const fetchOffers = useOffersStore((s) => s.fetchOffers);
  const scrollRef = useRef<ScrollView>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  if (!token) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
        <Ionicons name="add-circle-outline" size={72} color={colors.gray} />
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16 }}>Login to sell coupons</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          List your unused coupons and earn
        </Text>
        <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14 }} onPress={() => router.push('/(auth)/login')}>
          <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      Alert.alert('Error', 'Title, description and category are required');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];

      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((uri) => {
          const filename = uri.split('/').pop() || 'photo.jpg';
          const ext = filename.split('.').pop() || 'jpg';
          formData.append('images', {
            uri,
            name: filename,
            type: `image/${ext}`,
          } as any);
        });

        const { data } = await client.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrls = data.urls;
      }

      await client.post('/offers', {
        title,
        description,
        sellingPrice: parseFloat(sellingPrice) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        couponCode,
        category,
        expiryDate: expiryDate ? expiryDate.toISOString() : undefined,
        images: imageUrls,
      });
      fetchOffers();
      Alert.alert('Success', 'Offer created successfully!', [
        { text: 'OK', onPress: () => {
          setTitle(''); setDescription(''); setSellingPrice('');
          setOriginalPrice(''); setCouponCode(''); setCategory('');
          setExpiryDate(undefined); setImages([]);
          router.replace('/(tabs)');
        }},
      ]);
    } catch (err: any) {
      console.log('Create offer error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to create offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: 'height' })} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.title}>Create Offer</Text>
      <Text style={styles.subtitle}>Share your unused coupons & tickets</Text>

      <Text style={styles.label}>Images</Text>
      <View style={styles.imageRow}>
        {images.map((uri, i) => (
          <View key={i} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.thumbnail} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
              <Ionicons name="close-circle" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 5 && (
          <View style={styles.addImageRow}>
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color={colors.primary} />
              <Text style={styles.addImageText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addImageBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
              <Text style={styles.addImageText}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
      <TouchableOpacity style={styles.categoryPicker} onPress={() => setShowCategoryPicker(true)}>
        {category ? (
          <View style={styles.categoryPickerSelected}>
            <Text style={styles.categoryPickerText}>{category}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.gray} />
          </View>
        ) : (
          <View style={styles.categoryPickerPlaceholder}>
            <Text style={styles.categoryPickerPlaceholderText}>Select a category</Text>
            <Ionicons name="chevron-down" size={18} color={colors.gray} />
          </View>
        )}
      </TouchableOpacity>

      <CategoryPicker
        visible={showCategoryPicker}
        onSelect={(slug, name) => setCategory(slug)}
        onClose={() => setShowCategoryPicker(false)}
      />

      <Text style={styles.label}>Selling Price (₹) — 0 for free</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        value={sellingPrice}
        onChangeText={setSellingPrice}
        keyboardType="numeric"
        onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
      />

      <Text style={styles.label}>Coupon Code *</Text>
      <Text style={styles.hint}>For paid coupons, this will be hidden until you confirm the buyer's request. For free coupons, it's visible to everyone.</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. SAVE20-ABCD"
        value={couponCode}
        onChangeText={setCouponCode}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Original Price (₹) — optional</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 500"
        value={originalPrice}
        onChangeText={setOriginalPrice}
        keyboardType="numeric"
        onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
      />

      <Text style={styles.label}>Expiry Date — optional</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={expiryDate ? styles.dateText : styles.datePlaceholder}>
          {expiryDate ? expiryDate.toLocaleDateString() : 'Select date'}
        </Text>
      </TouchableOpacity>
      <DatePickerModal
        visible={showDatePicker}
        value={expiryDate || new Date()}
        onSelect={(date) => setExpiryDate(date)}
        onClose={() => setShowDatePicker(false)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Posting...' : 'Post Offer'}</Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 8 },
  hint: { fontSize: 12, color: colors.gray, marginBottom: 8, lineHeight: 16 },
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
  categoryPicker: {
    backgroundColor: colors.white, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  categoryPickerSelected: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryPickerText: { fontSize: 15, color: colors.text, textTransform: 'capitalize' },
  categoryPickerPlaceholder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryPickerPlaceholderText: { fontSize: 15, color: colors.gray },
  dateText: { fontSize: 15, color: colors.text },
  datePlaceholder: { fontSize: 15, color: colors.gray },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  imageWrapper: { position: 'relative' },
  thumbnail: { width: 80, height: 80, borderRadius: 12 },
  removeBtn: { position: 'absolute', top: -6, right: -6 },
  addImageRow: { flexDirection: 'row', gap: 8 },
  addImageBtn: {
    width: 80, height: 80, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white,
  },
  addImageText: { fontSize: 10, color: colors.primary, marginTop: 4 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
