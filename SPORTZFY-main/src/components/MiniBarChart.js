// MiniBarChart — pure-RN bar chart (no SVG dependency).
// Renders one vertical bar per data point, scaled to the chart height.
// The tallest bar is highlighted in green; shorter bars use a light tint.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function MiniBarChart({ data, height = 120 }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View>
      <View style={[styles.row, { height }]}>
        {data.map((point, idx) => {
          // Leave 8px headroom so the tallest bar isn't flush with the top.
          const barHeight = Math.max(8, Math.round((point.value / max) * (height - 24)));
          const isMax = point.value === max;
          return (
            <View key={idx} style={styles.col}>
              <Text style={[styles.barValue, isMax && styles.barValueMax]}>
                ৳{(point.value / 1000).toFixed(1)}k
              </Text>
              <View style={[styles.bar, { height: barHeight, backgroundColor: isMax ? COLORS.primary : '#D6E8DC' }]} />
            </View>
          );
        })}
      </View>

      {/* Day labels row */}
      <View style={styles.row}>
        {data.map((point, idx) => (
          <View key={idx} style={styles.col}>
            <Text style={styles.dayLabel}>{point.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    borderTopLeftRadius: RADIUS.sm,
    borderTopRightRadius: RADIUS.sm,
  },
  barValue: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  barValueMax: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  dayLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});