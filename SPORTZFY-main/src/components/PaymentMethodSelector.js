// Reusable payment method selector with three visual options: bKash, Nagad, Card.
// Each option is a horizontal card with a colored brand strip + label + radio.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

const METHODS = [
  { id: 'bKash', label: 'bKash', color: '#E2136E' },
  { id: 'Nagad', label: 'Nagad', color: '#F6921E' },
  { id: 'Card', label: 'Credit / Debit Card', color: '#1B8A3A' },
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
            style={[styles.row, isSelected && styles.rowSelected]}
          >
            <View style={[styles.brandStripe, { backgroundColor: m.color }]} />
            <View style={styles.labelWrap}>
              <Text style={styles.label}>{m.label}</Text>
            </View>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && (
                <Ionicons name="checkmark" size={14} color={COLORS.textOnPrimary} />
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  rowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F1F9F3',
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
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
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
  radioSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});