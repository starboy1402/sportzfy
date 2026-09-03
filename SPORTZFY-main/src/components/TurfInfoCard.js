// TurfInfoCard — compact card showing the owner's turf snapshot.
// Image header + body with name, location, rating, price, and a slot progress bar.

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function TurfInfoCard({ turf }) {
  const { name, location, rating, reviewCount, pricePerHour, bookedSlots, totalSlots, image } = turf;
  const percent = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />

      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.meta}>{location}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.meta}>
            {rating} ({reviewCount} reviews)
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Per hour</Text>
            <Text style={styles.price}>৳ {pricePerHour}</Text>
          </View>
          <View style={styles.progressWrap}>
            <Text style={styles.slotsText}>
              {bookedSlots}/{totalSlots} slots booked
            </Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
  },
  body: {
    padding: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  meta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  price: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  progressWrap: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: SPACING.md,
  },
  slotsText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  progressBg: {
    width: 110,
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});
