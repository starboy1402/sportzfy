// ProfileScreen — opens directly when the user taps the "Profile" tab.
//
// Behavior model (option b): Switch Role was removed. To change roles,
// the user taps Logout, which clears the auth user and bounces back to
// the Login screen. From there they can Sign Up again with a different
// role.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';
import SegmentedControl from '../../components/SegmentedControl';

import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

const VIEW_OPTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'bookings', label: 'Bookings' },
];

export default function ProfileScreen() {
  const { userLocation } = useBooking();
  const { user, logout } = useAuth();
  const [view, setView] = useState('profile');

  // Profile data comes from the real signed-in user. Fall back to
  // sensible defaults so the screen still renders if user is briefly null.
  const profile = {
    name: user?.name || 'Sportzfy User',
    phone: user?.phone || '',
    email: user?.email || '',
  };

  function handleLogout() {
    // Option (b): clear the user — RootNavigator will swap back to AuthStack.
    logout();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header location={userLocation} />

      <View style={styles.toggleRow}>
        <SegmentedControl options={VIEW_OPTIONS} value={view} onChange={setView} />
      </View>

      {view === 'profile' ? (
        <ScrollView
          style={{ flex: 1, backgroundColor: COLORS.background }}
          contentContainerStyle={styles.profileScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* User card */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.name
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'S'}
              </Text>
            </View>
            <Text style={styles.profileName}>{profile.name}</Text>
            {profile.phone ? (
              <Text style={styles.profilePhone}>{profile.phone}</Text>
            ) : null}
            {profile.email ? (
              <Text style={styles.profileEmail}>{profile.email}</Text>
            ) : null}
          </View>

          {/* Menu */}
          <View style={styles.menuCard}>
            <MenuItem icon="calendar-outline" label="My Bookings" />
            <MenuDivider />
            <MenuItem icon="settings-outline" label="Settings" />
            <MenuDivider />
            <MenuItem icon="help-circle-outline" label="Help & Support" />
            <MenuDivider />
            <MenuItem icon="information-circle-outline" label="About Sportzfy" />
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Sportzfy v1.0.0</Text>
          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      ) : (
        // Tapping "Bookings" in the toggle just nudges the user to the Bookings tab.
        <View style={styles.hintWrap}>
          <Ionicons name="calendar-outline" size={36} color={COLORS.textMuted} />
          <Text style={styles.hintTitle}>Go to the Bookings tab</Text>
          <Text style={styles.hintSub}>
            Tap "Bookings" at the bottom to view your upcoming, completed and cancelled bookings.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.menuRow} onPress={onPress}>
      <Ionicons name={icon} size={20} color={COLORS.textSecondary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

function MenuDivider() {
  return <View style={styles.menuDivider} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  toggleRow: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginTop: -SPACING.lg,
  },
  profileScroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
  },
  profileName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  profilePhone: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  profileEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
    marginLeft: SPACING.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: SPACING.lg + 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.danger,
    marginLeft: SPACING.sm,
  },
  versionText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
  },

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
  },
  hintSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
});