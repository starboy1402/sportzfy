// OwnerDashboardScreen — Turf Owner's main control center.
// High-energy stadium operator console with KPI metrics, wallet overview, AI yield insights, and live bookings.

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import OwnerHeader from '../../components/OwnerHeader';
import SectionTitle from '../../components/SectionTitle';
import OwnerStatCard from '../../components/OwnerStatCard';
import OwnerBookingCard from '../../components/OwnerBookingCard';
import TurfInfoCard from '../../components/TurfInfoCard';
import AIInsightCard from '../../components/AIInsightCard';
import BlockSlotModal from '../../components/BlockSlotModal';

import { useBooking } from '../../context/BookingContext';
import {
  OWNER_PROFILE,
  OWNER_TURF_CARD,
  OWNER_AI_INSIGHT,
} from '../../data/ownerMockData';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../../constants/theme';

export default function OwnerDashboardScreen({ navigation }) {
  const { bookings, checkInBooking } = useBooking();
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Active upcoming bookings directly from single source of truth
  const upcomingBookings = useMemo(() => {
    return bookings.filter((b) => {
      const s = (b.status || '').toLowerCase();
      return s === 'upcoming' || s === 'confirmed';
    });
  }, [bookings]);

  async function handleCheckIn(booking) {
    const code = booking.referenceCode || booking.id;
    const res = await checkInBooking(code);
    if (res.success) {
      Alert.alert(
        '✅ Verified Entry',
        `${booking.customerName || 'Player'} (Pass #${code}) marked as checked in! Admitted to pitch.`
      );
    }
  }

  function handleRequestPayout() {
    Alert.alert(
      'Withdraw Payout',
      'Available balance: ৳76,200\n\nYour payout will be disbursed to your registered bKash/Bank account within 2-6 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request ৳76,200',
          onPress: () => Alert.alert('Success', 'Withdrawal request submitted to Finance desk.'),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Stadium Operator Canopy Header */}
      <OwnerHeader
        badge="VENUE OPERATOR CONSOLE"
        title={`Welcome, ${OWNER_PROFILE.name}`}
        subtitle="Manage your turf schedules, monitor online bookings, and optimize slot rates."
        rightAction={
          <TouchableOpacity
            style={styles.payoutHeaderBtn}
            onPress={handleRequestPayout}
            activeOpacity={0.85}
          >
            <Ionicons name="wallet-outline" size={14} color={COLORS.forestDark} />
            <Text style={styles.payoutHeaderBtnText}>Withdraw</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* KPI Grid: 2x2 of stat tiles */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <OwnerStatCard
              label="Recorded Revenue"
              value="৳84,500"
              sublabel="Gross Online Bookings"
              icon="cash-outline"
              tint={COLORS.mint}
              iconColor={COLORS.forest}
            />
            <View style={{ width: SPACING.sm }} />
            <OwnerStatCard
              label="Confirmed Matches"
              value="24"
              sublabel="Zero double-bookings"
              icon="calendar-outline"
              tint="#EFF6FF"
              iconColor="#2563EB"
            />
          </View>

          <View style={styles.kpiRow}>
            <OwnerStatCard
              label="Managed Pitches"
              value="3"
              sublabel="All Published & Live"
              icon="shield-outline"
              tint="#F3E8FF"
              iconColor="#7C3AED"
            />
            <View style={{ width: SPACING.sm }} />
            <OwnerStatCard
              label="Evening Occupancy"
              value="88%"
              sublabel="Peak Prime (8–11 PM)"
              icon="trending-up-outline"
              tint="#FEF3C7"
              iconColor="#D97706"
            />
          </View>
        </View>

        {/* Financial Settlement Station Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletHeaderLeft}>
              <View style={styles.walletIconWrap}>
                <Ionicons name="wallet" size={18} color={COLORS.forest} />
              </View>
              <View>
                <Text style={styles.walletTitle}>Financial Settlement</Text>
                <Text style={styles.walletSub}>Sportzfy Payout Station</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.walletBtn}
              onPress={handleRequestPayout}
              activeOpacity={0.8}
            >
              <Text style={styles.walletBtnText}>Request Payout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletBalances}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceAmount}>৳76,200</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>TOTAL DISBURSED</Text>
              <Text style={styles.disbursedAmount}>৳52,000</Text>
            </View>
          </View>
        </View>

        {/* AI Yield Dynamic Pricing Banner */}
        <View style={styles.section}>
          <AIInsightCard
            insight={OWNER_AI_INSIGHT}
            onPress={() =>
              Alert.alert(
                'ML Dynamic Pricing',
                'AI rates applied! Off-peak slots adjusted to ৳1,500 and prime weekend nights adjusted to ৳2,400.'
              )
            }
          />
        </View>

        {/* Managed Turf Card */}
        <SectionTitle
          title="🏟️ Primary Managed Pitch"
          onSeeAll={() => navigation.navigate('Turf')}
        />
        <View style={styles.section}>
          <TurfInfoCard
            turf={OWNER_TURF_CARD}
            onLockSlot={() => setShowBlockModal(true)}
            onManageSchedule={() => navigation.navigate('Turf')}
          />
        </View>

        {/* Today's Reserved Matches */}
        <SectionTitle
          title="⚽ Today's Reserved Matches"
          onSeeAll={() => navigation.navigate('Bookings')}
        />
        <View style={styles.section}>
          {upcomingBookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="checkmark-done-circle" size={36} color={COLORS.forest} />
              </View>
              <Text style={styles.emptyTitle}>All Matches Admitted</Text>
              <Text style={styles.emptySub}>
                All scheduled players have been checked in and admitted to the pitch.
              </Text>
            </View>
          ) : (
            upcomingBookings.slice(0, 5).map((booking) => (
              <OwnerBookingCard
                key={booking.id || booking.referenceCode}
                booking={booking}
                onCheckIn={handleCheckIn}
              />
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Block Slot Modal for walk-ins */}
      <BlockSlotModal
        visible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onBlock={({ date, slotId, reason }) => {
          setShowBlockModal(false);
          Alert.alert('✅ Slot Blocked', `Slot ${slotId} on ${date} locked for walk-in (${reason}).`);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  payoutHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  payoutHeaderBtnText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forestDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 110,
  },
  kpiGrid: {
    marginBottom: SPACING.md,
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  walletCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  walletHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletIconWrap: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  walletSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  walletBtn: {
    backgroundColor: COLORS.forest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  walletBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
  },
  walletBalances: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm + 2,
  },
  balanceItem: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 8,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  balanceAmount: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
    marginTop: 2,
  },
  disbursedAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
