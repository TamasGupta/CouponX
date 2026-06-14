import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuthStore } from '../../store/auth';
import { colors } from '../../constants/colors';

export default function ReviewsScreen() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data } = await client.get(`/reviews/user/${user.id}`);
      setReviews(data);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={14} color={colors.warning} />
    ));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchReviews} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={18} color={colors.white} />
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.reviewerName}>{item.reviewer?.name || 'Anonymous'}</Text>
                <View style={styles.stars}>{renderStars(item.rating)}</View>
              </View>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="star-outline" size={48} color={colors.gray} />
            <Text style={styles.emptyText}>No reviews yet</Text>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  cardMeta: { flex: 1, marginLeft: 10 },
  reviewerName: { fontSize: 15, fontWeight: '600', color: colors.text },
  stars: { flexDirection: 'row', marginTop: 4, gap: 2 },
  date: { fontSize: 12, color: colors.gray },
  comment: { fontSize: 14, color: colors.textSecondary, marginTop: 12, lineHeight: 20 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: colors.gray, marginTop: 12 },
});
