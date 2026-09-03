// OwnerBookingCard — row showing an upcoming booking from the owner's perspective.
// Avatar with initials, customer name, time/date, payment method, price.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function OwnerBookingCard({ booking }) {
  const { customerName, customerInitials, date, time, price, paymentMethod } = booking;

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{customerInitials}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>{customerName}</Text>
        <Text style={styles.meta}>
          {date} · {time}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="card-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>৳ {price}</Text>
        <Text style={styles.status}>Upcoming</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.textOnPrimary,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  meta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  status: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: 2,
  },
});
