import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';
import BookingCard from '../../components/BookingCard';
import { useBooking } from '../../context/BookingContext';
import { useAiChat } from '../../context/AiChatContext';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../constants/theme';

const STATUS_TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen({ navigation }) {
  const { bookings, userLocation, refreshBookings, loadingBookings } = useBooking();
  const { openAi } = useAiChat();
  const [statusTab, setStatusTab] = useState('upcoming');

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const s = (b.status || '').toLowerCase();
      if (statusTab === 'upcoming') {
        return s === 'upcoming' || s === 'confirmed';
      }
      return s === statusTab;
    });
  }, [bookings, statusTab]);

  const upcomingCount = useMemo(() => {
    return bookings.filter(
      (b) => (b.status || '').toLowerCase() === 'upcoming' || (b.status || '').toLowerCase() === 'confirmed'
    ).length;
  }, [bookings]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Stadium Header with Passes Title */}
      <Header
        location={userLocation}
        onAiPress={() => openAi('⏱️ Explain 5-minute slot hold and cancellation policy')}
      >
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>Match Passes & Bookings</Text>
            <Text style={styles.headerSub}>Digital entrance QR codes for your booked pitches</Text>
          </View>
          {upcomingCount > 0 && (
            <View style={styles.activePill}>
              <View style={styles.pulseDot} />
              <Text style={styles.activePillText}>{upcomingCount} Active</Text>
            </View>
          )}
        </View>
      </Header>

      {/* Modern Status Switcher Tabs */}
      <View style={styles.tabBar}>
        {STATUS_TABS.map((tab) => {
          const isActive = statusTab === tab.id;
          const count = bookings.filter((b) => {
            const s = (b.status || '').toLowerCase();
            if (tab.id === 'upcoming') return s === 'upcoming' || s === 'confirmed';
            return s === tab.id;
          }).length;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setStatusTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                  <Text style={[styles.countText, isActive && styles.countTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingBookings}
            onRefresh={refreshBookings}
            colors={[COLORS.field]}
            tintColor={COLORS.field}
          />
        }
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="ticket-outline" size={42} color={COLORS.forest} />
            </View>
            <Text style={styles.emptyTitle}>
              {statusTab === 'upcoming'
                ? 'No upcoming matches scheduled'
                : `No ${statusTab} reservations found`}
            </Text>
            <Text style={styles.emptySub}>
              {statusTab === 'upcoming'
                ? 'Find your next pitch, grab a 5-minute atomic hold, and generate your digital entrance pass!'
                : 'Your reservation history will appear here once matches are concluded.'}
            </Text>

            {statusTab === 'upcoming' && (
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Explore')}
                activeOpacity={0.85}
              >
                <Ionicons name="compass" size={16} color={COLORS.white} />
                <Text style={styles.browseButtonText}>Browse Available Turfs</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBookings.map((b) => (
            <BookingCard
              key={b.id || b.referenceCode}
              booking={b}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 1,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderColor: '#34D399',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.field,
  },
  activePillText: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: COLORS.mint,
    borderWidth: 1.5,
    borderColor: COLORS.field,
  },
  tabLabel: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.forest,
  },
  countBadge: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.pill,
  },
  countBadgeActive: {
    backgroundColor: COLORS.field,
  },
  countText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  countTextActive: {
    color: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.field,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: RADIUS.pill,
    gap: 6,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
