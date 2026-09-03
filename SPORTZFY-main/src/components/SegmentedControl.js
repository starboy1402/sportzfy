// Reusable segmented control used by Bookings tabs (Upcoming / Completed / Cancelled)
// and by BookingsScreen to switch between "Bookings" and "Profile" views.
//
// Props:
//   options: [{ id, label }]
//   value: currently selected id
//   onChange: (id) => void

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function SegmentedControl({ options, value, onChange, style }) {
  return (
    <View style={[styles.container, style]}>
      {options.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.85}
            onPress={() => onChange && onChange(opt.id)}
            style={[styles.segment, isSelected && styles.segmentSelected]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.pill,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  labelSelected: {
    color: COLORS.textOnPrimary,
  },
});