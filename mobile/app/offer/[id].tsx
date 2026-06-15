import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Dimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth';
import { usePayment } from '../../services/payment';

const { width } = Dimensions.get('window');

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams();
  const [offer, setOffer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const { initiatePayment, RazorpayUI } = usePayment();

  useEffect(() => {
    client.get(`/offers/${id}`)
      .then(({ data }) => setOffer(data))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleClaim = () => {
    if (isFree) {
      claimFree();
    } else {
      setIsClaiming(true);
      initiatePayment(id as string, {
        onSuccess: async (paymentData) => {
          try {
            await client.post('/orders', {
              offerId: id,
              razorpayPaymentId: paymentData.razorpay_payment_id,
              razorpayOrderId: paymentData.razorpay_order_id,
              razorpaySignature: paymentData.razorpay_signature,
            });
            Alert.alert('Success', 'Offer claimed! Check your orders.', [
              { text: 'OK', onPress: () => router.push('/(tabs)/orders') },
            ]);
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to create order');
          } finally {
            setIsClaiming(false);
          }
        },
        onFailure: (error) => {
          Alert.alert('Payment Failed', error);
          setIsClaiming(false);
        },
      });
    }
  };

  const claimFree = async () => {
    setIsClaiming(true);
    try {
      await client.post('/orders', { offerId: id });
      Alert.alert('Success', 'Offer claimed! Check your orders.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/orders') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to claim');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!offer) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.gray }}>Offer not found</Text>
      </View>
    );
  }

  const isOwner = user?.id === offer.seller?._id;
  const canClaim = token && !isOwner && offer.status === 'active';
  const isFree = offer.sellingPrice === 0;

  const startChat = async () => {
    if (!offer.seller?._id) {
      Alert.alert('Error', 'Seller information not available');
      return;
    }
    try {
      const { data } = await client.post('/chat/conversations', {
        participantId: offer.seller._id,
      });
      router.push(`/chat/${data._id}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to start chat');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {offer.images?.length > 0 ? (
        <Image source={{ uri: offer.images[0] }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="pricetags-outline" size={64} color={colors.grayLight} />
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{offer.title}</Text>
          <Text style={styles.price}>
            {offer.sellingPrice === 0 ? 'FREE' : `₹${offer.sellingPrice}`}
          </Text>
        </View>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Ionicons name="pricetag" size={14} color={colors.primary} />
            <Text style={styles.badgeText}>{offer.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: offer.status === 'active' ? colors.success + '20' : colors.grayLight }]}>
            <Text style={[styles.badgeText, { color: offer.status === 'active' ? colors.success : colors.gray }]}>
              {offer.status}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{offer.description}</Text>

        <View style={styles.details}>
          {offer.originalPrice ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Original Price</Text>
              <Text style={styles.detailValue}>₹{offer.originalPrice}</Text>
            </View>
          ) : null}
          {offer.expiryDate ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expires</Text>
              <Text style={styles.detailValue}>{new Date(offer.expiryDate).toLocaleDateString()}</Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Seller</Text>
            <Text style={styles.detailValue}>{offer.seller?.name}</Text>
          </View>
        </View>
      </View>

      {isFree && offer.status === 'active' && offer.couponCode && (
        <View style={styles.freeCouponCard}>
          <View style={styles.freeCouponHeader}>
            <Ionicons name="pricetag" size={20} color={colors.success} />
            <Text style={styles.freeCouponLabel}>Free Coupon Code</Text>
          </View>
          <TouchableOpacity
            style={styles.freeCouponRow}
            onPress={() => {
              Clipboard.setString(offer.couponCode);
              Alert.alert('Copied', 'Coupon code copied to clipboard');
            }}
          >
            <Text style={styles.freeCouponCode}>{offer.couponCode}</Text>
            <Ionicons name="copy-outline" size={22} color={colors.success} />
          </TouchableOpacity>
          <Text style={styles.freeCouponHint}>Tap to copy</Text>
        </View>
      )}

      {canClaim && (
        <>
          <TouchableOpacity style={styles.claimButton} onPress={handleClaim} disabled={isClaiming}>
            <Text style={styles.claimText}>
              {isClaiming ? 'Claiming...' : isFree ? 'Claim for Free' : `Buy for ₹${offer.sellingPrice}`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton} onPress={startChat}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            <Text style={styles.messageButtonText}>Message Seller</Text>
          </TouchableOpacity>
        </>
      )}

      {isOwner && (
        <View style={styles.ownerSection}>
          <View style={styles.ownerNotice}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.ownerText}>This is your listing</Text>
          </View>
          {offer.couponCode && (
            <View style={styles.ownerCouponCard}>
              <Text style={styles.ownerCouponLabel}>Your Coupon Code</Text>
              <TouchableOpacity
                style={styles.ownerCouponRow}
                onPress={() => {
                  Clipboard.setString(offer.couponCode);
                  Alert.alert('Copied', 'Coupon code copied to clipboard');
                }}
              >
                <Text style={styles.ownerCouponCode}>{offer.couponCode}</Text>
                <Ionicons name="copy-outline" size={20} color={colors.gray} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {RazorpayUI}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  image: {
    width, height: 260,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  imagePlaceholder: {
    height: 200, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  section: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 22, fontWeight: 'bold', flex: 1, color: colors.text },
  price: { fontSize: 22, fontWeight: '700', color: colors.primary, marginLeft: 12 },
  badges: { flexDirection: 'row', marginTop: 12, gap: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    backgroundColor: colors.background,
  },
  badgeText: { fontSize: 12, color: colors.primary, marginLeft: 4, textTransform: 'capitalize' },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginTop: 16 },
  details: { marginTop: 20, backgroundColor: colors.white, borderRadius: 12, padding: 16 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  detailLabel: { fontSize: 14, color: colors.gray },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  claimButton: {
    marginHorizontal: 20, backgroundColor: colors.primary,
    borderRadius: 12, padding: 16, alignItems: 'center',
  },
  claimText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  messageButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginTop: 12,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.primary, gap: 8,
  },
  messageButtonText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  ownerSection: { marginTop: 20, marginHorizontal: 20 },
  ownerNotice: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ownerText: { fontSize: 14, color: colors.primary },
  ownerCouponCard: { marginTop: 12, backgroundColor: colors.white, borderRadius: 12, padding: 14 },
  ownerCouponLabel: { fontSize: 12, fontWeight: '600', color: colors.gray, marginBottom: 8 },
  ownerCouponRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.background, borderRadius: 8, padding: 12,
  },
  ownerCouponCode: { fontSize: 16, fontWeight: 'bold', color: colors.text, letterSpacing: 1 },
  freeCouponCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: colors.white, borderRadius: 16, padding: 20,
    borderWidth: 2, borderColor: colors.success, borderStyle: 'dashed',
  },
  freeCouponHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  freeCouponLabel: { fontSize: 14, fontWeight: '600', color: colors.success },
  freeCouponRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.background, borderRadius: 10, padding: 16,
  },
  freeCouponCode: { fontSize: 22, fontWeight: 'bold', color: colors.text, letterSpacing: 2 },
  freeCouponHint: { fontSize: 12, color: colors.gray, textAlign: 'center', marginTop: 8 },
});
