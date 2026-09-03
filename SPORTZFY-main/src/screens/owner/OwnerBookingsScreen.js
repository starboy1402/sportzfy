// OwnerBookingsScreen — owner's "Bookings & Earnings" tab.
// Shows 3 revenue KPI cards, a 7-day mini bar chart, and a segmented
// Upcoming / Completed / Cancelled list of bookings.

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SegmentedControl from '../../components/SegmentedControl';
import SectionTitle from '../../components/SectionTitle';
import RevenueCard from '../../components/RevenueCard';
import MiniBarChart from '../../components/MiniBarChart';
import OwnerBookingCard from '../../components/OwnerBookingCard';

import {
  BOOKINGS_TABS,
  OWNER_ALL_BOOKINGS,
  OWNER_REVENUE,
  OWNER_WEEKLY_REVENUE,
} from '../../data/ownerMockData';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

export default function OwnerBookingsScreen() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const bookings = OWNER_ALL_BOOKINGS[activeTab] || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Bookings & Earnings</Text>
          <Text style={styles.sub}>Track every reservation and your revenue.</Text>
        </View>

        {/* Revenue KPI tiles */}
        <View style={styles.kpiRow}>
          <RevenueCard {...OWNER_REVENUE.total} />
          <View style={{ width: SPACING.sm }} />
          <RevenueCard {...OWNER_REVENUE.thisWeek} />
        </View>
        <View style={styles.kpiRow}>
          <RevenueCard {...OWNER_REVENUE.avgPerBooking} />
        </View>

        {/* 7-day revenue chart */}
        <SectionTitle title="This Week" />
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Revenue</Text>
            <Text style={styles.chartTotal}>
              ৳{' '}
              {OWNER_WEEKLY_REVENUE.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
            </Text>
          </View>
          <MiniBarChart data={OWNER_WEEKLY_REVENUE} />
        </View>

        {/* Bookings segmented control */}
        <SectionTitle title="All Bookings" />
        <View style={styles.section}>
          <SegmentedControl
            options={BOOKINGS_TABS}
            value={activeTab}
            onChange={setActiveTab}
          />
        </View>

        {/* Bookings list */}
        <View style={styles.section}>
          {bookings.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No {activeTab} bookings yet.</Text>
            </View>
          ) : (
            bookings.map((booking) => (
              <OwnerBookingCard key={booking.id} booking={booking} />
            ))
          )}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  sub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  chartTotal: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  empty: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
});
