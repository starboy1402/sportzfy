import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/PrimaryButton';
import PaymentMethodSelector from '../../components/PaymentMethodSelector';
import SuccessModal from '../../components/SuccessModal';

import { useBooking } from '../../context/BookingContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

// Generates a fake SPZ-#### booking ID.
function generateBookingId() {
  const num = Math.floor(1024 + Math.random() * 9000);
  return `SPZ-${num}`;
}

export default function BookingScreen({ route, navigation }) {
  // Read what TurfDetails passed us.
  const { turf, date, slot } = route.params || {};
  const { addBooking } = useBooking();

  // Payment method + processing + success modal state.
  const [method, setMethod] = useState('bKash');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // Safe guard for missing params.
  if (!turf || !date || !slot) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Missing booking information.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const price = turf.pricePerHour;
  const timeLabel = `${slot.startTime} – ${slot.endTime}`;

  function handleConfirm() {
    setProcessing(true);
    // Mock network delay (1.2s) — replace with real payment API later.
    setTimeout(() => {
      const id = generateBookingId();
      setBookingId(id);
      addBooking({
        id,
        turfId: turf.id,
        turfName: turf.name,
        turfImage: turf.image,
        date,
        time: timeLabel,
        price,
        status: 'upcoming',
        paymentMethod: method,
      });
      setProcessing(false);
      setSuccess(true);
    }, 1200);
  }

  function handleViewBookings() {
    setSuccess(false);
    // Pop back to root tabs and switch to the Bookings tab.
    navigation.navigate('MainTabs', { screen: 'Bookings' });
  }

  function handleDone() {
    setSuccess(false);
    // Pop back to the root tabs Home.
    navigation.navigate('MainTabs', { screen: 'Home' });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Booking summary card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Summary</Text>

          <View style={styles.turfRow}>
            <Image source={{ uri: turf.image }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.turfName} numberOfLines={1}>
                {turf.name}
              </Text>
              <Text style={styles.turfLocation} numberOfLines={1}>
                 {turf.location}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Row icon="calendar-outline" label="Date" value={date} />
          <Row icon="time-outline" label="Time" value={timeLabel} />
          <Row icon="hourglass-outline" label="Duration" value="1 hour" />
        </View>

        {/* Price breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Details</Text>
          <Row icon="pricetag-outline" label="Price" value={`৳${price}`} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>৳{price}</Text>
          </View>
        </View>

        {/* Payment methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <PaymentMethodSelector selected={method} onSelect={setMethod} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title={
            processing
              ? 'Processing...'
              : `Confirm & Pay ৳${price}`
          }
          loading={processing}
          onPress={handleConfirm}
        />
      </View>

      <SuccessModal
        visible={success}
        bookingId={bookingId}
        turfName={turf.name}
        date={date}
        time={timeLabel}
        onViewBookings={handleViewBookings}
        onDone={handleDone}
      />
    </SafeAreaView>
  );
}

// Small reusable summary row used in summary & price cards.
function Row({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={COLORS.textSecondary} />
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
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  turfRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
    backgroundColor: COLORS.divider,
  },
  turfName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  turfLocation: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  rowValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.semibold,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.xs,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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