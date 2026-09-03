// OwnerDashboardScreen — Turf Owner's home tab.
// Shows a greeting, KPI grid, AI insight, My Turf card, and upcoming bookings.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import SectionTitle from '../../components/SectionTitle';
import OwnerStatCard from '../../components/OwnerStatCard';
import OwnerBookingCard from '../../components/OwnerBookingCard';
import TurfInfoCard from '../../components/TurfInfoCard';
import AIInsightCard from '../../components/AIInsightCard';

import {
  OWNER_PROFILE,
  OWNER_STATS,
  OWNER_UPCOMING_BOOKINGS,
  OWNER_TURF_CARD,
  OWNER_AI_INSIGHT,
} from '../../data/ownerMockData';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

export default function OwnerDashboardScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Green header: avatar + greeting + bell */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{OWNER_PROFILE.initials}</Text>
            </View>
            <View>
              <Text style={styles.welcome}>Welcome back,</Text>
              <Text style={styles.name}>{OWNER_PROFILE.name}</Text>
            </View>
          </View>
          <View style={styles.bell}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.textOnPrimary} />
          </View>
        </View>

        {/* KPI grid: 2x2 of stat tiles */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <OwnerStatCard {...OWNER_STATS[0]} />
            <View style={{ width: SPACING.sm }} />
            <OwnerStatCard {...OWNER_STATS[1]} />
          </View>
          <View style={styles.kpiRow}>
            <OwnerStatCard {...OWNER_STATS[2]} />
            <View style={{ width: SPACING.sm }} />
            <OwnerStatCard {...OWNER_STATS[3]} />
          </View>
        </View>

        {/* AI insight banner */}
        <View style={styles.section}>
          <AIInsightCard insight={OWNER_AI_INSIGHT} onPress={() => {}} />
        </View>

        {/* My Turf */}
        <SectionTitle title="My Turf" />
        <View style={styles.section}>
          <TurfInfoCard turf={OWNER_TURF_CARD} />
        </View>

        {/* Upcoming Bookings */}
        <SectionTitle title="Upcoming Bookings" />
        <View style={styles.section}>
          {OWNER_UPCOMING_BOOKINGS.map((booking) => (
            <OwnerBookingCard key={booking.id} booking={booking} />
          ))}
        </View>

        {/* Bottom padding so the last card clears the tab bar */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.textOnPrimary,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
  welcome: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textOnPrimary,
    opacity: 0.8,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textOnPrimary,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiGrid: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
});
