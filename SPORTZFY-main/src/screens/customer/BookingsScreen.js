import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';
import SegmentedControl from '../../components/SegmentedControl';
import BookingCard from '../../components/BookingCard';

import { useBooking } from '../../context/BookingContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

// Inner status tabs (Upcoming / Completed / Cancelled).
const STATUS_OPTIONS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

// Top-level Bookings vs Profile toggle (same screen, two views).
const VIEW_OPTIONS = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'profile', label: 'Profile' },
];

export default function BookingsScreen() {
  const { bookings, userLocation } = useBooking();

  // Top-level toggle inside the Bookings tab.
  const [view, setView] = useState('bookings');

  // Inner: which booking status tab is showing.
  const [statusTab, setStatusTab] = useState('upcoming');

  // Filter bookings by status tab.
  const filteredBookings = useMemo(
    () => bookings.filter((b) => b.status === statusTab),
    [bookings, statusTab]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header location={userLocation} />

      {/* Top-level toggle: Bookings | Profile */}
      <View style={styles.toggleRow}>
        <SegmentedControl options={VIEW_OPTIONS} value={view} onChange={setView} />
      </View>

      {view === 'bookings' ? (
        <BookingsView
          statusTab={statusTab}
          setStatusTab={setStatusTab}
          bookings={filteredBookings}
        />
      ) : (
        <ProfileQuickLink />
      )}
    </SafeAreaView>
  );
}

// --- Sub-view: Bookings list ------------------------------------------------
function BookingsView({ statusTab, setStatusTab, bookings }) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.innerToggleRow}>
        <SegmentedControl
          options={STATUS_OPTIONS}
          value={statusTab}
          onChange={setStatusTab}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {bookings.length === 0 ? (
          <EmptyState statusTab={statusTab} />
        ) : (
          bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        )}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

function EmptyState({ statusTab }) {
  const labels = {
    upcoming: 'You have no upcoming bookings.',
    completed: 'No completed bookings yet.',
    cancelled: 'No cancelled bookings.',
  };
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="calendar-outline" size={36} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Nothing here yet</Text>
      <Text style={styles.emptySub}>{labels[statusTab]}</Text>
    </View>
  );
}

// --- Sub-view: Profile quick link -------------------------------------------
// Profile lives in its own tab; from here we just nudge the user.
function ProfileQuickLink() {
  return (
    <View style={styles.hintWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons name="person-outline" size={36} color={COLORS.textMuted} />
      </View>
      <Text style={styles.hintTitle}>Your profile lives in the Profile tab</Text>
      <Text style={styles.hintSub}>
        Tap the "Profile" tab at the bottom to view your info, settings, and logout.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  // Top-level toggle (Bookings | Profile)
  toggleRow: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginTop: -SPACING.lg,
  },

  // Inner tabs (Upcoming / Completed / Cancelled)
  innerToggleRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },

  listContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Profile quick-link panel
  hintWrap: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  hintTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  hintSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
});