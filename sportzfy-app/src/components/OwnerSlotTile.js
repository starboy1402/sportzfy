// OwnerSlotTile — one slot in the owner's slot grid.
// Modernized with Sportzfy Stadium design system and active state feedback.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

function formatHour(hhmm) {
  const [h, m] = hhmm.split(':');
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return m === '00' ? `${display} ${period}` : `${display}:${m} ${period}`;
}

export default function OwnerSlotTile({ slot, onPress }) {
  const { startTime, endTime, status } = slot;
  const isBooked = status === 'booked';

  return (
    <Pressable
      onPress={isBooked ? null : onPress}
      style={({ pressed }) => [
        styles.tile,
        isBooked ? styles.tileBooked : styles.tileAvailable,
        pressed && !isBooked && styles.tilePressed,
      ]}
    >
      <View style={styles.timeWrap}>
        <Text style={[styles.time, isBooked && styles.timeBooked]}>
          {formatHour(startTime)}
        </Text>
        <Text style={[styles.timeMuted, isBooked && styles.timeBooked]}>
          – {formatHour(endTime)}
        </Text>
      </View>

      <View style={[styles.pill, isBooked ? styles.pillBooked : styles.pillAvailable]}>
        <Ionicons
          name={isBooked ? 'lock-closed' : 'checkmark-circle'}
          size={11}
          color={isBooked ? COLORS.textPlaceholder : COLORS.forest}
        />
        <Text style={[styles.pillText, isBooked ? styles.pillTextBooked : styles.pillTextAvailable]}>
          {isBooked ? 'Reserved / Locked' : 'Open for Booking'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    minHeight: 82,
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  tileAvailable: {
    borderColor: COLORS.cardBorder,
  },
  tileBooked: {
    backgroundColor: COLORS.surfaceSubtle,
    borderColor: COLORS.border,
  },
  tilePressed: {
    opacity: 0.8,
    borderColor: COLORS.field,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  time: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  timeMuted: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginLeft: 3,
  },
  timeBooked: {
    color: COLORS.textPlaceholder,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  pillAvailable: {
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  pillBooked: {
    backgroundColor: '#E2E8F0',
  },
  pillText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
  },
  pillTextAvailable: {
    color: COLORS.forest,
  },
  pillTextBooked: {
    color: COLORS.textMuted,
  },
});
