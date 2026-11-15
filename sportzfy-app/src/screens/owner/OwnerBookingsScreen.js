// OwnerBookingsScreen — Owner's Check-in & Revenue tab.
// Digital pass verifier, earnings analytics, 7-day mini bar chart, and live player admission controls.

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import OwnerHeader from '../../components/OwnerHeader';
import SegmentedControl from '../../components/SegmentedControl';
import SectionTitle from '../../components/SectionTitle';
import RevenueCard from '../../components/RevenueCard';
import MiniBarChart from '../../components/MiniBarChart';
import OwnerBookingCard from '../../components/OwnerBookingCard';

import { useBooking } from '../../context/BookingContext';
import {
  BOOKINGS_TABS,
  OWNER_WEEKLY_REVENUE,
} from '../../data/ownerMockData';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../../constants/theme';

export default function OwnerBookingsScreen() {
  const { bookings, checkInBooking } = useBooking();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [ticketInput, setTicketInput] = useState('');

  // 1. Upcoming / Confirmed passes awaiting admission
  const upcomingList = useMemo(() => {
    return bookings.filter((b) => {
      const s = (b.status || '').toLowerCase();
      return s === 'upcoming' || s === 'confirmed';
    });
  }, [bookings]);

  // 2. Completed / Checked-In passes
  const completedList = useMemo(() => {
    return bookings.filter((b) => {
      const s = (b.status || '').toLowerCase();
      return s === 'completed' || s === 'checked-in';
    });
  }, [bookings]);

  // 3. Cancelled passes
  const cancelledList = useMemo(() => {
    return bookings.filter((b) => {
      const s = (b.status || '').toLowerCase();
      return s === 'cancelled';
    });
  }, [bookings]);

  const currentBookings =
    activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'completed'
      ? completedList
      : cancelledList;

  // Calculates dynamic revenue from completed bookings
  const completedRevenue = useMemo(() => {
    const rawSum = completedList.reduce((acc, b) => acc + (Number(b.price) || 1200), 0);
    return rawSum + 38000; // Baseline stadium revenue
  }, [completedList]);

  // Handle checking in a pass via code input or QR scan
  async function handleVerifyTicket(codeToVerify) {
    const code = (codeToVerify || ticketInput).trim();
    if (!code) {
      Alert.alert('Required', 'Please enter a ticket reference code (e.g. SPZ-1024 or SPZ-1025).');
      return;
    }

    const res = await checkInBooking(code);

    if (res.success) {
      setShowScannerModal(false);
      setTicketInput('');

      Alert.alert(
        '✅ Gate Pass Verified & Admitted!',
        `Pass #${res.booking?.referenceCode || code}\nPlayer: ${res.booking?.customerName || 'Verified Player'}\nPitch: ${res.booking?.turfName || 'Chittagong Sports Arena'}\nSlot: ${res.booking?.time || 'Active Slot'}\n\nPlayer is admitted to the pitch!`
      );
    } else {
      Alert.alert('Check-In Error', res.message || 'Pass could not be verified.');
    }
  }

  // Handle checking in directly from a card in the Upcoming list
  async function handleCheckIn(booking) {
    const code = booking.referenceCode || booking.id;
    const res = await checkInBooking(code);

    if (res.success) {
      Alert.alert(
        '✅ Player Admitted',
        `${booking.customerName || 'Player'} (Pass #${code}) has been verified and admitted to the pitch!`
      );
    } else {
      Alert.alert('Check-In Error', res.message || 'Could not admit player.');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Stadium Operator Canopy Header */}
      <OwnerHeader
        badge="CHECK-IN & GATE PASS"
        title="Check-In & Bookings"
        subtitle="Verify player entrance QR codes, track daily match turnout, and inspect earnings."
        rightAction={
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => setShowScannerModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code" size={14} color={COLORS.forestDark} />
            <Text style={styles.scanBtnText}>Verify Pass</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Reference Code Bar */}
        <View style={styles.quickCodeBar}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.quickCodeInput}
            placeholder="Type Pass Ref # (e.g. SPZ-1024, SPZ-1025)..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={ticketInput}
            onChangeText={setTicketInput}
            onSubmitEditing={() => handleVerifyTicket()}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.quickCodeBtn}
            onPress={() => handleVerifyTicket()}
            activeOpacity={0.85}
          >
            <Text style={styles.quickCodeBtnText}>Admit</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Revenue KPI Cards */}
        <View style={styles.kpiRow}>
          <RevenueCard
            label="This Week"
            value={`৳${(completedRevenue / 1000).toFixed(1)}k`}
            icon="wallet-outline"
            tint={COLORS.mint}
            iconColor={COLORS.forest}
          />
          <View style={{ width: SPACING.sm }} />
          <RevenueCard
            label="Today"
            value="৳12.0k"
            icon="cash-outline"
            tint="#EFF6FF"
            iconColor="#2563EB"
          />
          <View style={{ width: SPACING.sm }} />
          <RevenueCard
            label="Pending In"
            value={`${upcomingList.length} Passes`}
            icon="people-outline"
            tint="#FEF3C7"
            iconColor="#D97706"
          />
        </View>

        {/* 7-Day Revenue Trend Chart */}
        <SectionTitle title="📊 7-Day Revenue Performance" />
        <View style={styles.chartCard}>
          <MiniBarChart data={OWNER_WEEKLY_REVENUE} />
        </View>

        {/* Segmented Tabs: Upcoming vs Completed vs Cancelled */}
        <SectionTitle title="🎫 Match Passes" />
        <View style={styles.tabsWrap}>
          <SegmentedControl
            options={BOOKINGS_TABS}
            value={activeTab}
            onChange={setActiveTab}
          />
        </View>

        {/* Bookings Feed */}
        {currentBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="ticket-outline" size={36} color={COLORS.forest} />
            </View>
            <Text style={styles.emptyTitle}>No passes in this category</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'upcoming'
                ? 'All reserved players have been admitted to the pitch!'
                : activeTab === 'completed'
                ? 'Checked-in records will appear here once players are admitted.'
                : 'No cancelled bookings.'}
            </Text>
          </View>
        ) : (
          currentBookings.map((booking) => (
            <OwnerBookingCard
              key={booking.id || booking.referenceCode}
              booking={booking}
              onCheckIn={handleCheckIn}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* QR Ticket Verification Modal */}
      <Modal
        visible={showScannerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowScannerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalBadge}>
                <Ionicons name="qr-code" size={16} color={COLORS.white} />
                <Text style={styles.modalBadgeText}>SPORTZFY ENTRANCE SCANNER</Text>
              </View>
              <TouchableOpacity onPress={() => setShowScannerModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.scannerViewport}>
              <Ionicons name="scan-outline" size={72} color={COLORS.field} />
              <Text style={styles.scannerInstructions}>
                Point camera at player's QR Pass or enter their pass reference:
              </Text>

              {/* Quick Sample Test Chips */}
              <View style={styles.sampleChipsRow}>
                <Text style={styles.sampleChipsLabel}>Quick Test:</Text>
                {['SPZ-1024', 'SPZ-1025', 'SPZ-1026'].map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={styles.sampleChip}
                    onPress={() => setTicketInput(code)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sampleChipText}>{code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalInput}
                placeholder="Pass Reference (e.g. SPZ-1024)"
                placeholderTextColor={COLORS.textPlaceholder}
                value={ticketInput}
                onChangeText={setTicketInput}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={styles.modalVerifyBtn}
              onPress={() => handleVerifyTicket()}
              activeOpacity={0.88}
            >
              <Ionicons name="shield-checkmark" size={16} color={COLORS.white} />
              <Text style={styles.modalVerifyBtnText}>Verify & Check In Player</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  scanBtnText: {
    color: COLORS.forestDark,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
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
  quickCodeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.pill,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    gap: 8,
    ...SHADOWS.sm,
  },
  quickCodeInput: {
    flex: 1,
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textPrimary,
  },
  quickCodeBtn: {
    backgroundColor: COLORS.field,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
  },
  quickCodeBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONT_WEIGHT.black,
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  tabsWrap: {
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 44, 34, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl,
    ...SHADOWS.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.forestDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    gap: 6,
  },
  modalBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 0.8,
  },
  scannerViewport: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.borderEmerald,
    borderStyle: 'dashed',
    gap: 10,
  },
  scannerInstructions: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 16,
  },
  sampleChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sampleChipsLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },
  sampleChip: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  sampleChipText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.forest,
  },
  modalInputRow: {
    marginVertical: SPACING.lg,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
    fontWeight: FONT_WEIGHT.bold,
  },
  modalVerifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.field,
    paddingVertical: 14,
    borderRadius: RADIUS.pill,
    gap: 8,
    ...SHADOWS.md,
  },
  modalVerifyBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
