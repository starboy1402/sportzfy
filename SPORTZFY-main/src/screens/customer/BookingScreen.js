import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/PrimaryButton';
import PaymentMethodSelector from '../../components/PaymentMethodSelector';
import SuccessModal from '../../components/SuccessModal';

import { useBooking } from '../../context/BookingContext';
import { api } from '../../services/api';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../constants/theme';

export default function BookingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { turf, date, slot, holdId, expiresAt, price: passedPrice } = route.params || {};
  const { addBooking, refreshBookings } = useBooking();

  const [method, setMethod] = useState('bKash');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // 5-minute hold countdown ticker
  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();

    function updateTimer() {
      const remaining = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        Alert.alert('Hold Expired', 'Your 5-minute hold has expired. Please select a slot again.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    }

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, navigation]);

  if (!turf || !date || !slot) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Missing booking information.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const price = passedPrice || turf.pricePerHour;
  const timeLabel = slot.timeLabel || `${slot.startTime} – ${slot.endTime}`;

  function formatSeconds(sec) {
    if (sec === null) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  async function handleConfirm() {
    setProcessing(true);
    try {
      let finalReferenceCode = `SPZ-${Math.floor(1000 + Math.random() * 9000)}`;

      if (holdId) {
        const booking = await api.confirmBooking({
          holdId,
          paymentMethod: method === 'bKash' ? 'BKASH' : method === 'Nagad' ? 'NAGAD' : 'CARD',
        });
        if (booking?.referenceCode) {
          finalReferenceCode = booking.referenceCode;
        }
      }

      setBookingId(finalReferenceCode);

      // Add to local booking context
      addBooking({
        id: finalReferenceCode,
        referenceCode: finalReferenceCode,
        turfId: turf.id,
        turfName: turf.name,
        turfImage: turf.image,
        customerName: 'You (Booked Player)',
        customerInitials: 'ME',
        phone: '+880 1812-345678',
        date,
        time: timeLabel,
        price,
        totalPrice: price,
        status: 'confirmed',
        paymentMethod: method,
      });

      refreshBookings();
      setSuccess(true);
    } catch (err) {
      Alert.alert('Booking Failed', err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  function handleViewBookings() {
    setSuccess(false);
    navigation.navigate('MainTabs', { screen: 'Bookings' });
  }

  function handleDone() {
    setSuccess(false);
    navigation.navigate('MainTabs', { screen: 'Home' });
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hold Countdown Banner */}
        {timeLeft !== null && (
          <View style={styles.holdBanner}>
            <View style={styles.holdIconCircle}>
              <Ionicons name="timer-outline" size={18} color="#B45309" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.holdBannerTitle}>Slot Held Exclusively For You</Text>
              <Text style={styles.holdBannerSub}>
                Expires in <Text style={styles.holdCountdown}>{formatSeconds(timeLeft)}</Text>. Complete checkout before it releases.
              </Text>
            </View>
          </View>
        )}

        {/* Booking Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Match Schedule</Text>

          <View style={styles.turfRow}>
            <Image source={{ uri: turf.image }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.turfName} numberOfLines={1}>
                {turf.name}
              </Text>
              <View style={styles.locRow}>
                <Ionicons name="location-sharp" size={13} color={COLORS.textMuted} />
                <Text style={styles.turfLocation} numberOfLines={1}>
                  {turf.location}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <SummaryRow icon="calendar-outline" label="Match Date" value={date} />
          <SummaryRow icon="time-outline" label="Reserved Slot" value={timeLabel} />
          <SummaryRow icon="hourglass-outline" label="Duration" value="60 Minutes" />
        </View>

        {/* Price Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Breakdown</Text>
          <SummaryRow icon="pricetag-outline" label="Pitch Hourly Fee" value={`৳${price}`} />
          <SummaryRow icon="shield-checkmark-outline" label="Platform Assurance" value="৳0 (Free)" />
          <SummaryRow icon="flash-outline" label="Hold Reservation" value="৳0 (Waived)" />

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.taxSub}>All VAT & taxes included</Text>
            </View>
            <Text style={styles.totalAmount}>৳{price}</Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <PaymentMethodSelector selected={method} onSelect={setMethod} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
        <View style={styles.bottomPriceGroup}>
          <Text style={styles.bottomTotalText}>Payable Now</Text>
          <Text style={styles.bottomTotalNumber}>৳{price}</Text>
        </View>

        <View style={{ flex: 1.4 }}>
          <PrimaryButton
            title={processing ? 'Confirming...' : `Pay via ${method}`}
            onPress={handleConfirm}
            disabled={processing || (timeLeft !== null && timeLeft === 0)}
            loading={processing}
          />
        </View>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={success}
        bookingId={bookingId}
        turfName={turf.name}
        date={date}
        time={timeLabel}
        onViewBookings={handleViewBookings}
        onDone={handleDone}
      />
    </View>
  );
}

function SummaryRow({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={16} color={COLORS.textMuted} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  holdBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md - 2,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  holdIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdBannerTitle: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: '#92400E',
  },
  holdBannerSub: {
    fontSize: FONT_SIZE.xs,
    color: '#78350F',
    marginTop: 1,
  },
  holdCountdown: {
    fontWeight: FONT_WEIGHT.black,
    color: '#B45309',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  turfRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    backgroundColor: COLORS.surfaceSubtle,
  },
  turfName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  turfLocation: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm + 2,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rowLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  rowValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  taxSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  totalAmount: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.primary,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  bottomPriceGroup: {
    flex: 1,
  },
  bottomTotalText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: FONT_WEIGHT.semibold,
  },
  bottomTotalNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
  },
});
