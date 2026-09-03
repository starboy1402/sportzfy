// Reusable turf card used in Home (sections) and Explore (results).
// Vertical layout: image -> name + rating -> location -> price + availability -> Book button.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Rating from './Rating';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function TurfCard({ turf, onPress, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress && onPress(turf)}
      style={[styles.card, style]}
    >
      <Image source={{ uri: turf.image }} style={styles.image} />

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {turf.name}
          </Text>
          <Rating rating={turf.rating} />
        </View>

        <Text style={styles.location} numberOfLines={1}>
          📍 {turf.location}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.sportTag}>
            <Text style={styles.sportText}>{turf.sport}</Text>
          </View>
          <Text style={styles.price}>৳{turf.pricePerHour}/hour</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.availableDot}>
            <View style={styles.greenDot} />
            <Text style={styles.availableText}>Available</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress && onPress(turf)}
            style={styles.bookButton}
          >
            <Text style={styles.bookButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.divider,
  },
  body: {
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  location: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sportTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
  },
  sportText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  price: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableDot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.xs,
  },
  availableText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.success,
    fontWeight: FONT_WEIGHT.medium,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  bookButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
});