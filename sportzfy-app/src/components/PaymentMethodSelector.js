// Reusable payment method selector with three visual options: bKash, Nagad, Card.
// High-contrast, brand-accented payment option cards.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

const METHODS = [
  { id: 'bKash', label: 'bKash Wallet', sub: 'Instant payment via bKash PIN', color: '#E2136E', icon: 'wallet-outline' },
  { id: 'Nagad', label: 'Nagad Account', sub: 'Instant mobile recharge & payment', color: '#F6921E', icon: 'cash-outline' },
  { id: 'Card', label: 'Visa / Mastercard / Amex', sub: 'Debit or Credit Card', color: '#16A34A', icon: 'card-outline' },
];

export default function PaymentMethodSelector({ selected, onSelect, style }) {
  return (
    <View style={style}>
      {METHODS.map((m) => {
        const isSelected = selected === m.id;
        return (
          <TouchableOpacity
            key={m.id}
            activeOpacity={0.85}
            onPress={() => onSelect && onSelect(m.id)}
            style={[
              styles.row,
              isSelected && styles.rowSelected,
              isSelected ? SHADOWS.md : SHADOWS.sm,
            ]}
          >
            {/* Color stripe on left */}
            <View style={[styles.brandStripe, { backgroundColor: m.color }]} />

            {/* Icon & Label */}
            <View style={styles.labelWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.label}>{m.label}</Text>
              </View>
              <Text style={styles.sub}>{m.sub}</Text>
            </View>

            {/* Radio / Check circle */}
            <View
              style={[
                styles.radio,
                isSelected && { backgroundColor: m.color, borderColor: m.color },
              ]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={13} color={COLORS.white} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm + 4,
    overflow: 'hidden',
  },
  rowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  brandStripe: {
    width: 6,
    alignSelf: 'stretch',
  },
  labelWrap: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  sub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
});
