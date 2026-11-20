// Star rating + numeric value, optionally with review count.
// Example: ⭐ 4.7 (128)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function Rating({ rating, reviewCount, style }) {
  return (
    <View style={[styles.row, style]}>
      <Ionicons name="star" size={16} color="#F5B400" />
      <Text style={styles.rating}>{rating.toFixed(1)}</Text>
      {reviewCount !== undefined && (
        <Text style={styles.reviews}>({reviewCount})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  reviews: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
});