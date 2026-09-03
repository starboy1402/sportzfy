import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Rating from '../../components/Rating';
import SlotButton from '../../components/SlotButton';
import PrimaryButton from '../../components/PrimaryButton';

import { getTurfById } from '../../data/mockData';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
} from '../../constants/theme';
import { getUpcomingDates, formatShortDate, formatLongDate } from '../../utils/dateUtils';

export default function TurfDetailsScreen({ route, navigation }) {
  // The Home/Explore screen passes { turfId } when navigating here.
  const { turfId } = route.params || {};
  const turf = getTurfById(turfId);

  // Local state: which date is selected, which slot is selected.
  const dates = useMemo(() => getUpcomingDates(4), []);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Guard: if someone opens this screen without a valid turfId.
  if (!turf) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Turf not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedDate = dates[selectedDateIndex];

  function handleBookNow() {
    if (!selectedSlot) return;
    // Move to the Booking & Payment screen with everything we need.
    navigation.navigate('Booking', {
      turf,
      date: formatLongDate(selectedDate),
      slot: selectedSlot,
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero image */}
        <Image source={{ uri: turf.image }} style={styles.hero} />

        {/* Top section: name, rating, location, price */}
        <View style={styles.section}>
          <Text style={styles.name}>{turf.name}</Text>

          <View style={styles.metaRow}>
            <Rating rating={turf.rating} reviewCount={turf.reviewCount} />
            <Text style={styles.price}>৳{turf.pricePerHour}/hour</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color={COLORS.textSecondary} />
            <Text style={styles.location}>{turf.location}</Text>
          </View>

          <View style={styles.sportTag}>
            <Text style={styles.sportText}>{turf.sport}</Text>
          </View>
        </View>

        {/* Facilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.facilitiesRow}>
            {turf.facilities.map((f) => (
              <View key={f} style={styles.facilityChip}>
                <Text style={styles.facilityText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this turf</Text>
          <Text style={styles.description}>{turf.description}</Text>
        </View>

        {/* Date selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {dates.map((d, idx) => {
              const isSelected = idx === selectedDateIndex;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDateIndex(idx)}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                >
                  <Text
                    style={[styles.dateWeekday, isSelected && styles.dateChipTextSelected]}
                  >
                    {idx === 0
                      ? 'Today'
                      : idx === 1
                      ? 'Tomorrow'
                      : `Day ${idx + 1}`}
                  </Text>
                  <Text
                    style={[styles.dateNumber, isSelected && styles.dateChipTextSelected]}
                  >
                    {formatShortDate(d)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Available time slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <View style={styles.slotsGrid}>
            {turf.availableSlots.map((slot) => (
              <SlotButton
                key={slot.id}
                slot={slot}
                isSelected={selectedSlot && selectedSlot.id === slot.id}
                onPress={setSelectedSlot}
                style={styles.slotItem}
              />
            ))}
          </View>
        </View>

        {/* Bottom padding so content clears the sticky CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title={selectedSlot ? 'Book Now' : 'Select a slot to continue'}
          disabled={!selectedSlot}
          onPress={handleBookNow}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  hero: {
    width: '100%',
    height: 240,
    backgroundColor: COLORS.divider,
  },

  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    marginTop: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  location: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  sportTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
  },
  sportText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },

  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  facilityText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },

  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  dateRow: {
    paddingVertical: SPACING.xs,
  },
  dateChip: {
    width: 80,
    height: 70,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  dateChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateWeekday: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  dateChipTextSelected: {
    color: COLORS.textOnPrimary,
  },

  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotItem: {
    width: '48%',
    marginBottom: SPACING.md,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
  },
});