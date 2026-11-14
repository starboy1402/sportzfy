// ProfileScreen — Player & Owner account overview and settings.

import React from 'react';
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

import Header from '../../components/Header';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { useAiChat } from '../../context/AiChatContext';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { userLocation, bookings } = useBooking();
  const { user, logout } = useAuth();
  const { openAi } = useAiChat();

  const profile = {
    name: user?.name || 'Sportzfy Player',
    phone: user?.phone || '+880 1800-000000',
    email: user?.email || 'player@sportzfy.com',
    role: user?.role === 'owner' ? 'Turf Owner' : 'Player',
  };

  const completedMatches = bookings.filter(
    (b) => (b.status || '').toLowerCase() === 'completed'
  ).length;
  const activeBookings = bookings.filter(
    (b) => (b.status || '').toLowerCase() === 'upcoming' || (b.status || '').toLowerCase() === 'confirmed'
  ).length;

  function confirmLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Sportzfy?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  }

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SP';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header location={userLocation} onAiPress={() => openAi()}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Player Profile</Text>
        </View>
      </Header>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.profileName}>{profile.name}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>{profile.role}</Text>
          </View>

          <View style={styles.contactDetails}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.contactText}>{profile.email}</Text>
            </View>
            {profile.phone ? (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.contactText}>{profile.phone}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeBookings}</Text>
            <Text style={styles.statLabel}>Active Games</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completedMatches}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total Passes</Text>
          </View>
        </View>

        {/* Quick Actions / Settings Menu */}
        <View style={styles.menuCard}>
          <MenuItem
            icon="ticket-outline"
            label="My Bookings & Match Passes"
            badge={activeBookings > 0 ? `${activeBookings} Active` : undefined}
            onPress={() => navigation.navigate('Bookings')}
          />
          <MenuDivider />
          <MenuItem
            icon="people-outline"
            label="My Squads & Matches"
            onPress={() => navigation.navigate('Matches')}
          />
          <MenuDivider />
          <MenuItem
            icon="compass-outline"
            label="Explore Arenas & Pitches"
            onPress={() => navigation.navigate('Explore')}
          />
          <MenuDivider />
          <MenuItem
            icon="sparkles"
            label="Sportzfy AI Concierge"
            badge="LIVE"
            onPress={() => openAi()}
          />
          <MenuDivider />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Security & Privacy"
            onPress={() => Alert.alert('Security', 'Your session is encrypted with Bearer token authentication.')}
          />
          <MenuDivider />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Alert.alert('Support', 'Sportzfy 24/7 Hotline: +880 1800-SPORTZ')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.85}
          onPress={confirmLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Sportzfy Mobile App • v2.0 (SDK 58)</Text>
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, badge, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.75} style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={18} color={COLORS.forest} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {badge ? (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

function MenuDivider() {
  return <View style={styles.menuDivider} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  headerTitleRow: {
    marginTop: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.md,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.forestDark,
    borderWidth: 2.5,
    borderColor: COLORS.field,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  avatarText: {
    color: '#A7F3D0',
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.black,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.field,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  profileName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  rolePill: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
    marginTop: SPACING.xs,
  },
  rolePillText: {
    color: COLORS.forest,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  contactDetails: {
    marginTop: SPACING.md,
    gap: 4,
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    height: '70%',
    alignSelf: 'center',
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  menuBadge: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.forest,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceSubtle,
    marginLeft: 62,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
    ...SHADOWS.sm,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  versionText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textPlaceholder,
    marginTop: SPACING.lg,
  },
});
