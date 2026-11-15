// Modern perforated ticket-style booking card with Digital QR Pass for BookingsScreen.
// Aligned with Sportzfy Web and top turf venue apps.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

const STATUS_THEMES = {
  upcoming: {
    bg: '#DCFCE7',
    text: '#064E3B',
    border: '#A7F3D0',
    label: 'Upcoming',
    icon: 'checkmark-circle',
  },
  confirmed: {
    bg: '#DCFCE7',
    text: '#064E3B',
    border: '#A7F3D0',
    label: 'Confirmed',
    icon: 'checkmark-circle',
  },
  completed: {
    bg: '#F1F5F9',
    text: '#475569',
    border: '#E2E8F0',
    label: 'Completed',
    icon: 'trophy-outline',
  },
  cancelled: {
    bg: '#FEE2E2',
    text: '#DC2626',
    border: '#FECACA',
    label: 'Cancelled',
    icon: 'close-circle',
  },
};

export default function BookingCard({ booking, onPress, style }) {
  const [showQrPass, setShowQrPass] = useState(false);

  const normStatus = (booking.status || 'upcoming').toLowerCase();
  const theme = STATUS_THEMES[normStatus] || STATUS_THEMES.upcoming;
  const refCode = booking.referenceCode || booking.id || 'SPZ-LIVE';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SPORTZFY:${refCode}:${booking.turfId || 'arena'}`;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => (onPress ? onPress(booking) : setShowQrPass(true))}
        style={[styles.card, style]}
      >
        {/* Top Header Row: Reference code & Status pill */}
        <View style={styles.topRow}>
          <View style={styles.refRow}>
            <Ionicons name="ticket" size={14} color={COLORS.forest} />
            <Text style={styles.refText}>PASS #{refCode}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* 1-Tap QR Pass Icon */}
            <TouchableOpacity
              style={styles.qrIconBtn}
              onPress={() => setShowQrPass(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="qr-code" size={14} color={COLORS.forest} />
            </TouchableOpacity>

            <View style={[styles.statusBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              <Ionicons name={theme.icon} size={11} color={theme.text} />
              <Text style={[styles.statusText, { color: theme.text }]}>
                {theme.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Content Row: Image + Details */}
        <View style={styles.bodyRow}>
          <Image
            source={{
              uri:
                booking.turfImage ||
                'https://images.unsplash.com/photo-1529900245534-47fbf02a44dd?auto=format&fit=crop&w=400&q=80',
            }}
            style={styles.image}
          />

          <View style={styles.details}>
            <Text style={styles.name} numberOfLines={1}>
              {booking.turfName || 'Arena Turf'}
            </Text>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={13} color={COLORS.forest} />
              <Text style={styles.infoText} numberOfLines={1}>
                {booking.date}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={13} color={COLORS.forest} />
              <Text style={styles.infoText} numberOfLines={1}>
                {booking.time}
              </Text>
            </View>
          </View>
        </View>

        {/* Perforated Divider Strip */}
        <View style={styles.perforatedLine} />

        {/* Footer: Price + View Pass CTA */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>PAID AMOUNT</Text>
            <Text style={styles.priceValue}>৳{booking.totalPrice || 2000}</Text>
          </View>

          <TouchableOpacity
            style={styles.viewPassBtn}
            onPress={() => setShowQrPass(true)}
          >
            <Ionicons name="qr-code-outline" size={13} color={COLORS.white} />
            <Text style={styles.viewPassText}>Gate Pass</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* MATCH ENTRANCE DIGITAL QR PASS MODAL */}
      <Modal
        visible={showQrPass}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQrPass(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowQrPass(false)}>
          <View style={styles.passCard}>
            {/* Pass Brand Header */}
            <View style={styles.passHeader}>
              <View style={styles.passBadge}>
                <Ionicons name="football" size={14} color={COLORS.white} />
                <Text style={styles.passBadgeText}>SPORTZFY STADIUM PASS</Text>
              </View>
              <Text style={styles.passRefText}>REF #{refCode}</Text>
            </View>

            {/* QR Code Container */}
            <View style={styles.qrContainer}>
              <Image source={{ uri: qrUrl }} style={styles.qrImage} />
              <Text style={styles.scanHint}>Present this digital pass at the entrance turnstile</Text>
            </View>

            {/* Match Information */}
            <View style={styles.passInfo}>
              <Text style={styles.passTurfName}>{booking.turfName || 'Arena Turf'}</Text>
              <View style={styles.passRow}>
                <Ionicons name="calendar" size={13} color={COLORS.forest} />
                <Text style={styles.passDetailText}>{booking.date} • {booking.time}</Text>
              </View>
              <View style={styles.passRow}>
                <Ionicons name="shield-checkmark" size={13} color={COLORS.field} />
                <Text style={styles.verifiedText}>OFFICIALLY VERIFIED PASS</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowQrPass(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm + 2,
    paddingBottom: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  refText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
    letterSpacing: 0.6,
  },
  qrIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceSubtle,
    marginRight: SPACING.md,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 5,
  },
  infoText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  perforatedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginVertical: SPACING.sm + 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 8,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  priceValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  viewPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.forest,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    gap: 4,
    ...SHADOWS.sm,
  },
  viewPassText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },

  // Modal QR Pass
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 44, 34, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  passCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...SHADOWS.floating,
  },
  passHeader: {
    backgroundColor: COLORS.forestDark,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 0.8,
  },
  passRefText: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  qrImage: {
    width: 170,
    height: 170,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
  },
  scanHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 220,
  },
  passInfo: {
    padding: SPACING.lg,
    gap: 6,
  },
  passTurfName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textPrimary,
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passDetailText: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.field,
    letterSpacing: 0.6,
  },
  closeBtn: {
    backgroundColor: COLORS.forest,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  closeBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
