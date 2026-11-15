// TurfInfoCard — Pro card showing the owner's managed turf snapshot.
// High-res stadium banner, live occupancy progress, rating, and quick actions.

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function TurfInfoCard({ turf, onLockSlot, onManageSchedule }) {
  const {
    name,
    location,
    rating = 4.9,
    reviewCount = 128,
    pricePerHour = 2200,
    bookedSlots = 14,
    totalSlots = 18,
    image,
    format = '7v7 Astroturf',
  } = turf;

  const percent = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

  return (
    <View style={styles.card}>
      {/* Stadium Cover Image with Floating Badges */}
      <View style={styles.imageWrap}>
        <Image
          source={{
            uri:
              image ||
              'https://images.unsplash.com/photo-1529900245534-47fbf02a44dd?auto=format&fit=crop&w=800&q=80',
          }}
          style={styles.image}
        />
        <View style={styles.imageOverlay} />

        {/* Format Badge */}
        <View style={styles.formatBadge}>
          <Ionicons name="football" size={11} color={COLORS.white} />
          <Text style={styles.formatText}>{format}</Text>
        </View>

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.ratingText}>{rating}</Text>
          <Text style={styles.reviewText}>({reviewCount})</Text>
        </View>
      </View>

      {/* Card Content Body */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.liveTag}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveTagText}>ACTIVE</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={COLORS.field} />
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>

        {/* Occupancy Progress Bar */}
        <View style={styles.occupancySection}>
          <View style={styles.occupancyHeader}>
            <Text style={styles.occupancyLabel}>TODAY'S OCCUPANCY</Text>
            <Text style={styles.occupancyValue}>
              {bookedSlots}/{totalSlots} Slots ({percent}%)
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer: Price + Quick Actions */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>BASE RATE</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>৳{pricePerHour}</Text>
              <Text style={styles.priceUnit}>/hr</Text>
            </View>
          </View>

          <View style={styles.actionBtns}>
            {onLockSlot && (
              <TouchableOpacity
                style={styles.lockBtn}
                onPress={onLockSlot}
                activeOpacity={0.8}
              >
                <Ionicons name="lock-closed-outline" size={13} color="#92400E" />
                <Text style={styles.lockBtnText}>Lock Slot</Text>
              </TouchableOpacity>
            )}

            {onManageSchedule && (
              <TouchableOpacity
                style={styles.scheduleBtn}
                onPress={onManageSchedule}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={13} color={COLORS.white} />
                <Text style={styles.scheduleBtnText}>Schedule</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.md,
  },
  imageWrap: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.surfaceSubtle,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    gap: 4,
  },
  formatText: {
    color: COLORS.white,
    fontSize: 10,
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
    fontSize: 11,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textPrimary,
  },
  reviewText: {
    fontSize: 10,
    color: COLORS.textMuted,
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
    fontSize: FONT_SIZE.md + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.field,
  },
  liveTagText: {
    fontSize: 8,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
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
  },
  occupancySection: {
    marginTop: 10,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  occupancyLabel: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  occupancyValue: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  progressBg: {
    height: 6,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.field,
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 0.6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  priceUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  lockBtnText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: '#92400E',
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.forest,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    gap: 4,
    ...SHADOWS.sm,
  },
  scheduleBtnText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
});
