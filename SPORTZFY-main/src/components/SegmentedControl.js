// Reusable segmented control.
// Props:
//   options or tabs: [{ id, label }]
//   value or activeTab: currently selected id
//   onChange: (id) => void

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function SegmentedControl({
  options,
  tabs,
  value,
  activeTab,
  onChange,
  style,
}) {
  const items = options || tabs || [];
  const selected = value !== undefined ? value : activeTab;

  return (
    <View style={[styles.container, style]}>
      {items.map((opt) => {
        const isSelected = opt.id === selected;
        return (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.8}
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
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    ...SHADOWS.sm,
  },
  label: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  labelSelected: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
  },
});
