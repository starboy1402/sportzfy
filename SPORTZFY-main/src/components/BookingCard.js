// Booking card shown in BookingsScreen lists.
// Displays turf image, name, date/time, price, and a status badge.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

const STATUS_COLORS = {
  upcoming: { bg: '#E8F5EE', text: COLORS.success },
  completed: { bg: '#EEF1F4', text: '#3B82F6' },
  cancelled: { bg: '#FDECEC', text: COLORS.danger },
};

export default function BookingCard({ booking, onPress, style }) {
  const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS.upcoming;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress && onPress(booking)}
      style={[styles.card, style]}
    >
      <Image source={{ uri: booking.turfImage }} style={styles.image} />

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {booking.turfName}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>
              {booking.status}
            </Text>
          </View>
        </View>

        <Text style={styles.line}>📅 {booking.date}</Text>
        <Text style={styles.line}>⏰ {booking.time}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.price}>৳{booking.price}</Text>
          <Text style={styles.method}>Paid via {booking.paymentMethod}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: 100,
    height: '100%',
    backgroundColor: COLORS.divider,
  },
  body: {
    flex: 1,
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    textTransform: 'capitalize',
  },
  line: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  method: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
});