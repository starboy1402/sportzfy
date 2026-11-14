// Reusable turf card with stadium aesthetic, live badges, amenities, and slot preview.
// Used across Home, Explore, and Search results.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function TurfCard({ turf, onPress, style }) {
  const sportName = turf.sport || turf.pitchFormats?.split(',')[0] || 'Football';
  const formatName = turf.pitchFormats || '7v7 Astroturf';

  const defaultImg =
    'https://images.unsplash.com/photo-1529900245534-47fbf02a44dd?auto=format&fit=crop&w=800&q=80';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress && onPress(turf)}
      style={[styles.card, style]}
    >
      {/* Stadium Hero Image & Badges */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: turf.image || turf.coverImage || defaultImg }}
          style={styles.image}
        />

        {/* Gradient / Dark overlay */}
        <View style={styles.imageOverlay} />

        {/* Sport & Format Badge (Top-Left) */}
        <View style={styles.formatBadge}>
          <Ionicons name="football" size={11} color={COLORS.white} />
          <Text style={styles.formatBadgeText}>{formatName}</Text>
        </View>

        {/* Rating Pill (Top-Right) */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.ratingText}>
            {typeof turf.rating === 'number' ? turf.rating.toFixed(1) : '4.8'}
          </Text>
        </View>

        {/* Live Slot Status Pill (Bottom-Left over image) */}
        <View style={styles.availabilityPill}>
          <View style={styles.greenPulseDot} />
          <Text style={styles.availabilityText}>Available Slots Today</Text>
        </View>
      </View>

      {/* Card Content Body */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {turf.name}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={COLORS.field} />
          <Text style={styles.location} numberOfLines={1}>
            {turf.area ? `${turf.area}, ${turf.city || 'Chattogram'}` : (turf.location || 'Chattogram')}
          </Text>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.distanceText}>1.2 km</Text>
        </View>

        {/* Amenities Icons Row */}
        <View style={styles.amenitiesRow}>
          <View style={styles.amenityItem}>
            <Ionicons name="flash" size={11} color={COLORS.forest} />
            <Text style={styles.amenityText}>Floodlit</Text>
          </View>
          <View style={styles.amenityItem}>
            <Ionicons name="car" size={11} color={COLORS.forest} />
            <Text style={styles.amenityText}>Parking</Text>
          </View>
          <View style={styles.amenityItem}>
            <Ionicons name="shield-checkmark" size={11} color={COLORS.forest} />
            <Text style={styles.amenityText}>Verified</Text>
          </View>
        </View>

        {/* Price & CTA Divider */}
        <View style={styles.cardDivider} />

        {/* Footer: Price & Book Button */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>Starting from</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceCurrency}>৳</Text>
              <Text style={styles.priceValue}>{turf.pricePerHour || turf.basePricePerHour || 2000}</Text>
              <Text style={styles.priceUnit}>/hour</Text>
            </View>
          </View>

          <View style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Book Slot</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.md,
  },
  imageWrapper: {
    width: '100%',
    height: 165,
    backgroundColor: COLORS.surfaceSubtle,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 44, 34, 0.25)',
  },
  formatBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 44, 34, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    gap: 5,
  },
  formatBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    gap: 3,
    ...SHADOWS.sm,
  },
  ratingText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: FONT_WEIGHT.black,
  },
  availabilityPill: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 5,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.field,
  },
  availabilityText: {
    color: COLORS.forest,
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },
  body: {
    padding: SPACING.md + 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  location: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    maxWidth: '65%',
  },
  bulletDot: {
    color: COLORS.textPlaceholder,
    fontSize: 10,
  },
  distanceText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.forest,
    fontWeight: FONT_WEIGHT.semibold,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  amenityText: {
    fontSize: 10,
    color: COLORS.forest,
    fontWeight: FONT_WEIGHT.medium,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginTop: 10,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  priceCurrency: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.forest,
    marginRight: 1,
  },
  priceValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  priceUnit: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginLeft: 2,
    fontWeight: FONT_WEIGHT.medium,
  },
  bookButton: {
    backgroundColor: COLORS.field,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...SHADOWS.sm,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
