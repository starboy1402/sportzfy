// Time-slot button with three visual states:
// - status === 'available' + selected: green filled
// - status === 'available' + not selected: white with green border
// - status === 'booked': gray, disabled

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function SlotButton({ slot, isSelected, onPress, style }) {
  const isAvailable = slot.status === 'available';
  const isBooked = slot.status === 'booked';

  // Visual state tokens
  let containerStyle = styles.available;
  let textStyle = styles.availableText;

  if (isBooked) {
    containerStyle = styles.booked;
    textStyle = styles.bookedText;
  } else if (isSelected) {
    containerStyle = styles.selected;
    textStyle = styles.selectedText;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isBooked}
      onPress={() => isAvailable && onPress && onPress(slot)}
      style={[styles.base, containerStyle, style]}
    >
      <Text style={[styles.time, textStyle]}>
        {slot.startTime} – {slot.endTime}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 130,
  },

  // Available
  available: {
    backgroundColor: COLORS.slotAvailableBg,
    borderColor: COLORS.slotAvailableBorder,
  },
  availableText: {
    color: COLORS.slotAvailableText,
  },

  // Booked
  booked: {
    backgroundColor: COLORS.slotBookedBg,
    borderColor: COLORS.slotBookedBg,
  },
  bookedText: {
    color: COLORS.slotBookedText,
  },

  // Selected
  selected: {
    backgroundColor: COLORS.slotSelectedBg,
    borderColor: COLORS.slotSelectedBg,
  },
  selectedText: {
    color: COLORS.slotSelectedText,
  },

  time: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
});