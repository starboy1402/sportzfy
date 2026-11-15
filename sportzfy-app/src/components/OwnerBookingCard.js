// OwnerBookingCard — Operator view of a match booking.
// Matches the customer ticket design with customer avatar, phone, pass ref, and 1-tap check-in.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function OwnerBookingCard({ booking, onCheckIn, style }) {
  const {
    id,
    customerName,
    customerInitials,
    date,
    time,
    price,
    paymentMethod,
    status = 'upcoming',
    phone = '+880 1812-345678',
  } = booking;

  const isCheckedIn = status.toLowerCase() === 'completed' || status.toLowerCase() === 'checked-in';
  const refCode = booking.referenceCode || id || 'SPZ-8821';

  return (
    <View style={[styles.card, style]}>
      {/* Top Header Row: Reference code & Status */}
      <View style={styles.topRow}>
        <View style={styles.refRow}>
          <Ionicons name="ticket" size={13} color={COLORS.forest} />
          <Text style={styles.refText}>PASS #{refCode}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isCheckedIn ? styles.statusBadgeDone : styles.statusBadgePending,
          ]}
        >
          <Ionicons
            name={isCheckedIn ? 'checkmark-circle' : 'time'}
            size={11}
            color={isCheckedIn ? COLORS.forest : '#92400E'}
          />
          <Text
            style={[
              styles.statusText,
              isCheckedIn ? styles.statusTextDone : styles.statusTextPending,
            ]}
          >
            {isCheckedIn ? 'Checked-In' : 'Ready for Entry'}
          </Text>
        </View>
      </View>

      {/* Main Body: Avatar, Name, Phone, and Slot Time */}
      <View style={styles.bodyRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{customerInitials || customerName?.[0] || 'P'}</Text>
        </View>

        <View style={styles.customerDetails}>
          <Text style={styles.name} numberOfLines={1}>
            {customerName}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.phoneText}>{phone}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={12} color={COLORS.forest} />
            <Text style={styles.timeText}>{date} • {time}</Text>
          </View>
        </View>

        <View style={styles.priceColumn}>
          <Text style={styles.priceLabel}>PAID</Text>
          <Text style={styles.priceValue}>৳{price}</Text>
          <View style={styles.paymentMethodPill}>
            <Text style={styles.paymentMethodText}>{paymentMethod || 'bKash'}</Text>
          </View>
        </View>
      </View>

      {/* Action Divider & Check-in CTA */}
      {!isCheckedIn && onCheckIn && (
        <>
          <View style={styles.dashedDivider} />
          <TouchableOpacity
            style={styles.checkInBtn}
            onPress={() => onCheckIn(booking)}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code-outline" size={15} color={COLORS.white} />
            <Text style={styles.checkInBtnText}>Check In & Admit Player</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
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
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
    letterSpacing: 0.6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusBadgeDone: {
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  statusText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    textTransform: 'uppercase',
  },
  statusTextPending: {
    color: '#92400E',
  },
  statusTextDone: {
    color: COLORS.forest,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.forestDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.field,
  },
  avatarText: {
    color: '#A7F3D0',
    fontWeight: FONT_WEIGHT.black,
    fontSize: FONT_SIZE.md,
  },
  customerDetails: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.forest,
    fontWeight: FONT_WEIGHT.semibold,
  },
  priceColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  priceLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 0.6,
  },
  priceValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  paymentMethodPill: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  paymentMethodText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginVertical: SPACING.sm + 2,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.field,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    gap: 6,
    ...SHADOWS.sm,
  },
  checkInBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
  },
});
