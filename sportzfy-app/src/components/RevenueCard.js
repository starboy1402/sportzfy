// RevenueCard — single KPI tile used on the Bookings & Earnings screen.
// Styled with Sportzfy Stadium card elevation and emerald icons.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function RevenueCard({ label, value, icon, tint, iconColor }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <View style={[styles.iconWrap, { backgroundColor: tint || COLORS.mint }]}>
          <Ionicons name={icon} size={17} color={iconColor || COLORS.forest} />
        </View>
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 96,
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
    marginTop: SPACING.xs,
  },
  label: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 4,
  },
});
