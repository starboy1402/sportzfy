// MiniBarChart — pure-RN weekly revenue bar chart.
// Renders vertical bars scaled to chart height, with peak day highlighted in Field Emerald.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function MiniBarChart({ data, height = 120 }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.row, { height }]}>
        {data.map((point, idx) => {
          const barHeight = Math.max(10, Math.round((point.value / max) * (height - 28)));
          const isMax = point.value === max;
          return (
            <View key={idx} style={styles.col}>
              <Text style={[styles.barValue, isMax && styles.barValueMax]}>
                ৳{(point.value / 1000).toFixed(1)}k
              </Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isMax ? COLORS.field : '#D1FAE5',
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* Day labels row */}
      <View style={styles.daysRow}>
        {data.map((point, idx) => {
          const isMax = point.value === max;
          return (
            <View key={idx} style={styles.col}>
              <Text style={[styles.dayLabel, isMax && styles.dayLabelMax]}>
                {point.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
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
    width: '58%',
    borderTopLeftRadius: RADIUS.sm,
    borderTopRightRadius: RADIUS.sm,
  },
  barValue: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  barValueMax: {
    color: COLORS.forest,
    fontWeight: FONT_WEIGHT.black,
  },
  daysRow: {
    flexDirection: 'row',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.medium,
  },
  dayLabelMax: {
    color: COLORS.forest,
    fontWeight: FONT_WEIGHT.black,
  },
});
