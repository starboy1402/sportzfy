// OwnerSlotTile — one slot in the owner's slot grid.
// Shows start–end time, a status pill, and a tap-to-toggle affordance.
// Booked slots are visually locked (grey + "Booked" label) and not tappable.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

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
        isBooked && styles.tileBooked,
        pressed && !isBooked && styles.tilePressed,
      ]}
    >
      <View style={styles.timeWrap}>
        <Text style={[styles.time, isBooked && styles.timeBooked]}>
          {formatHour(startTime)}
        </Text>
        <Text style={[styles.timeMuted, isBooked && styles.timeBooked]}>
          to {formatHour(endTime)}
        </Text>
      </View>

      <View style={[styles.pill, isBooked ? styles.pillBooked : styles.pillAvailable]}>
        <Ionicons
          name={isBooked ? 'lock-closed' : 'checkmark-circle'}
          size={12}
          color={isBooked ? COLORS.textMuted : COLORS.primary}
        />
        <Text style={[styles.pillText, isBooked ? styles.pillTextBooked : styles.pillTextAvailable]}>
          {isBooked ? 'Booked' : 'Available'}
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
    borderColor: COLORS.border,
    minHeight: 86,
    justifyContent: 'space-between',
  },
  tileBooked: {
    backgroundColor: COLORS.slotBookedBg,
    borderColor: COLORS.divider,
  },
  tilePressed: {
    opacity: 0.7,
    borderColor: COLORS.primary,
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
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  timeBooked: {
    color: COLORS.textMuted,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.sm,
  },
  pillAvailable: {
    backgroundColor: '#E8F4EC',
  },
  pillBooked: {
    backgroundColor: COLORS.background,
  },
  pillText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    marginLeft: 4,
  },
  pillTextAvailable: {
    color: COLORS.primary,
  },
  pillTextBooked: {
    color: COLORS.textMuted,
  },
});
