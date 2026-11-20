import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function SlotButton({ slot, isSelected, onPress, style }) {
  const normalizedStatus = (slot.status || 'available').toLowerCase();
  const isAvailable = normalizedStatus === 'available';
  const isBooked =
    normalizedStatus === 'booked' ||
    normalizedStatus === 'blocked' ||
    normalizedStatus === 'held';

  let containerStyle = styles.available;
  let textStyle = styles.availableText;

  if (isBooked) {
    containerStyle = styles.booked;
    textStyle = styles.bookedText;
  } else if (isSelected) {
    containerStyle = styles.selected;
    textStyle = styles.selectedText;
  }

  const timeLabel =
    slot.timeLabel ||
    (slot.startTime && slot.endTime
      ? `${slot.startTime} – ${slot.endTime}`
      : slot.startTime || 'Slot');

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isBooked}
      onPress={() => isAvailable && onPress && onPress(slot)}
      style={[
        styles.base,
        containerStyle,
        isSelected && SHADOWS.md,
        style,
      ]}
    >
      <Text style={[styles.time, textStyle]} numberOfLines={1}>
        {timeLabel}
      </Text>

      <View style={styles.priceRow}>
        {slot.price ? (
          <Text
            style={[
              styles.priceTag,
              isSelected
                ? styles.priceTagSelected
                : isBooked
                ? styles.priceTagBooked
                : styles.priceTagAvailable,
            ]}
          >
            ৳{slot.price}
          </Text>
        ) : null}

        {isBooked ? (
          <View style={styles.bookedPill}>
            <Ionicons name="lock-closed" size={8} color={COLORS.textPlaceholder} />
            <Text style={styles.bookedPillText}>Booked</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    minHeight: 58,
  },

  // Available State
  available: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
  },
  availableText: {
    color: COLORS.forest,
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
  },

  // Booked State
  booked: {
    backgroundColor: COLORS.surfaceSubtle,
    borderColor: COLORS.border,
  },
  bookedText: {
    color: COLORS.textPlaceholder,
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.medium,
  },

  // Selected State
  selected: {
    backgroundColor: COLORS.field,
    borderColor: COLORS.fieldHover,
  },
  selectedText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.black,
  },

  time: {
    textAlign: 'center',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  priceTag: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },
  priceTagAvailable: {
    color: COLORS.field,
  },
  priceTagSelected: {
    color: '#ECFDF5',
  },
  priceTagBooked: {
    color: COLORS.textPlaceholder,
  },
  bookedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  bookedPillText: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
  },
});
