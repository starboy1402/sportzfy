import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import SlotButton from '../../components/SlotButton';
import PrimaryButton from '../../components/PrimaryButton';

import { getTurfById } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { api, formatTurfForMobile } from '../../services/api';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../constants/theme';
import { getUpcomingDates, formatShortDate, formatLongDate } from '../../utils/dateUtils';

const FACILITY_ICONS = {
  parking: 'car-outline',
  floodlights: 'bulb-outline',
  lighting: 'bulb-outline',
  'locker room': 'shirt-outline',
  washroom: 'water-outline',
  water: 'water-outline',
  'free water': 'water-outline',
  'turf boots': 'footsteps-outline',
  cafeteria: 'cafe-outline',
  default: 'checkmark-circle-outline',
};

export default function TurfDetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { turfId, turf: initialTurf } = route.params || {};
  const { isAuthed } = useAuth();

  const [turf, setTurf] = useState(initialTurf || getTurfById(turfId) || null);
  const [loadingTurf, setLoadingTurf] = useState(!initialTurf);

  const dates = useMemo(() => getUpcomingDates(7), []);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [holding, setHolding] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch complete turf details if only ID passed
  useEffect(() => {
    if (initialTurf) {
      setTurf(initialTurf);
      setLoadingTurf(false);
    } else if (turfId) {
      setLoadingTurf(true);
      api.getTurfById(turfId)
        .then((remote) => {
          if (remote) setTurf(formatTurfForMobile(remote));
        })
        .catch(() => {})
        .finally(() => setLoadingTurf(false));
    }
  }, [initialTurf, turfId]);

  const selectedDate = dates[selectedDateIndex];
  const selectedDateISO = useMemo(() => {
    const d = selectedDate || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  // Load live slots from backend
  const loadAvailability = useCallback(async () => {
    if (!turf?.id) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await api.getTurfAvailability(turf.id, selectedDateISO);
      if (res?.slots && res.slots.length > 0) {
        const mapped = res.slots.map((s, idx) => ({
          id: s.slotId || `slot_${idx}`,
          timeLabel: s.timeLabel,
          startTime: s.timeLabel ? s.timeLabel.split(' - ')[0] : 'Time',
          endTime: s.timeLabel ? s.timeLabel.split(' - ')[1] : '',
          rawStartTime: s.startTime,
          rawEndTime: s.endTime,
          price: s.price,
          badgeText: s.badgeText,
          status: s.status === 'AVAILABLE' ? 'available' : 'booked',
        }));
        setSlots(mapped);
      } else {
        setSlots(turf.availableSlots || []);
      }
    } catch {
      setSlots(turf?.availableSlots || []);
    } finally {
      setLoadingSlots(false);
    }
  }, [turf?.id, turf?.availableSlots, selectedDateISO]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  async function handleShare() {
    if (!turf) return;
    try {
      await Share.share({
        message: `Book a match at ${turf.name} on Sportzfy! Location: ${turf.location}.`,
      });
    } catch (e) {
      // ignore
    }
  }

  async function handleBookNow() {
    if (!selectedSlot) return;

    if (!isAuthed) {
      Alert.alert(
        'Login Required',
        'Please sign in to place a 5-minute hold on this slot.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('AuthStack', { screen: 'Login' }) },
        ]
      );
      return;
    }

    setHolding(true);
    try {
      let holdId = null;
      let expiresAt = null;

      // Create atomic hold if raw timestamp is available
      if (selectedSlot.rawStartTime && selectedSlot.rawEndTime) {
        try {
          const hold = await api.createHold({
            turfId: turf.id,
            startTime: selectedSlot.rawStartTime,
            endTime: selectedSlot.rawEndTime,
          });
          if (hold) {
            holdId = hold.id;
            expiresAt = hold.expiresAt;
          }
        } catch (holdErr) {
          console.warn('Backend hold warning:', holdErr.message);
          expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        }
      } else {
        expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      }

      navigation.navigate('Booking', {
        turf,
        date: formatLongDate(selectedDate),
        slot: selectedSlot,
        holdId,
        expiresAt,
        price: selectedSlot.price || turf.pricePerHour,
      });
    } catch (err) {
      Alert.alert('Slot Notice', err.message || 'Could not lock slot. Please try another.');
    } finally {
      setHolding(false);
    }
  }

  if (loadingTurf) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textMuted }}>Loading pitch details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!turf) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Turf arena not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activePrice = selectedSlot?.price || turf.pricePerHour;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image with Floating Controls */}
        <View style={styles.heroWrap}>
          <Image
            source={{
              uri:
                turf.image ||
                'https://images.unsplash.com/photo-1529900245534-47fbf02a44dd?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.hero}
          />

          {/* Floating Back Button */}
          <TouchableOpacity
            style={[styles.floatingActionBtn, styles.floatingBack, { top: insets.top + 8 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Floating Right Actions (Share + Favorite) */}
          <View style={[styles.floatingRightRow, { top: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.floatingActionBtn}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={19} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.floatingActionBtn, { marginLeft: 8 }]}
              onPress={() => setIsFavorited((v) => !v)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorited ? COLORS.danger : COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Sport Format Pill on bottom-left of hero */}
          <View style={styles.heroPill}>
            <Ionicons name="football" size={13} color={COLORS.white} />
            <Text style={styles.heroPillText}>{turf.sport || 'Football 7v7'}</Text>
          </View>
        </View>

        {/* Turf Header Section */}
        <View style={styles.section}>
          <Text style={styles.name}>{turf.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={15} color="#EAB308" />
              <Text style={styles.ratingNumber}>
                {typeof turf.rating === 'number' ? turf.rating.toFixed(1) : '4.8'}
              </Text>
              <Text style={styles.reviewCount}>({turf.reviewCount || 128} reviews)</Text>
            </View>

            <View style={styles.instantBadge}>
              <View style={styles.pulsingDot} />
              <Text style={styles.instantText}>Instant Confirmation</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color={COLORS.primary} />
            <Text style={styles.locationText}>{turf.location || 'Chattogram, Bangladesh'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Facilities / Amenities */}
        {turf.facilities && turf.facilities.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Arena Facilities</Text>
              <View style={styles.facilitiesRow}>
                {turf.facilities.map((facility, index) => {
                  const norm = facility.toLowerCase();
                  const iconName = FACILITY_ICONS[norm] || FACILITY_ICONS.default;
                  return (
                    <View key={index} style={styles.facilityChip}>
                      <Ionicons name={iconName} size={15} color={COLORS.primary} />
                      <Text style={styles.facilityText}>{facility}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* About the Pitch */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Pitch</Text>
          <Text style={styles.description}>
            {turf.description ||
              'High quality FIFA certified artificial turf ground equipped with floodlights, player dugout, locker room, and purified drinking water.'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Date Selector */}
        <View style={styles.section}>
          <View style={styles.dateHeaderRow}>
            <Text style={styles.sectionTitle}>Select Match Date</Text>
            <Text style={styles.selectedMonthText}>{formatLongDate(selectedDate)}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {dates.map((date, index) => {
              const isSelected = index === selectedDateIndex;
              const formatted = formatShortDate(date);

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                  onPress={() => setSelectedDateIndex(index)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateWeekday, isSelected && styles.dateWeekdaySelected]}>
                    {formatted.weekday}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                    {formatted.day}
                  </Text>
                  <Text style={[styles.dateMonth, isSelected && styles.dateMonthSelected]}>
                    {formatted.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* Available Time Slots */}
        <View style={styles.section}>
          <View style={styles.slotHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Available Slots</Text>
              <Text style={styles.slotSub}>Select an open 1-hour slot to reserve</Text>
            </View>
            {loadingSlots && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>

          {slots.length === 0 && !loadingSlots ? (
            <View style={styles.noSlotsWrap}>
              <Ionicons name="time-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptySlotsText}>All slots booked for this date.</Text>
            </View>
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <View key={slot.id} style={styles.slotItem}>
                    <SlotButton
                      slot={slot}
                      isSelected={isSelected}
                      onPress={() => setSelectedSlot(slot)}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Bottom padding to clear fixed CTA */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Booking Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomPriceLabel}>Total Price</Text>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPriceAmount}>৳{activePrice}</Text>
            <Text style={styles.bottomPriceUnit}>/ hour</Text>
          </View>
          {selectedSlot && (
            <Text style={styles.bottomSlotLabel}>{selectedSlot.timeLabel}</Text>
          )}
        </View>

        <View style={styles.bottomButtonWrap}>
          <PrimaryButton
            title={
              holding
                ? 'Locking...'
                : selectedSlot
                ? 'Hold Slot (5 min)'
                : 'Select a Slot'
            }
            onPress={handleBookNow}
            disabled={!selectedSlot || holding}
            loading={holding}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  heroWrap: {
    width: '100%',
    height: 260,
    position: 'relative',
    backgroundColor: COLORS.surfaceSubtle,
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  floatingActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  floatingBack: {
    position: 'absolute',
    left: SPACING.lg,
  },
  floatingRightRow: {
    position: 'absolute',
    right: SPACING.lg,
    flexDirection: 'row',
  },
  heroPill: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroPillText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  reviewCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 5,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },
  instantText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md + 2,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    borderRadius: RADIUS.pill,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  facilityText: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  description: {
    fontSize: FONT_SIZE.sm + 1,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedMonthText: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  dateRow: {
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  dateChip: {
    width: 64,
    height: 78,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  dateChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateWeekday: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
  },
  dateWeekdaySelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dateNumber: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  dateNumberSelected: {
    color: COLORS.white,
  },
  dateMonth: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.medium,
  },
  dateMonthSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  slotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  slotSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
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
  noSlotsWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  emptySlotsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.lg,
  },
  bottomPriceInfo: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: FONT_WEIGHT.semibold,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPriceAmount: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.primary,
  },
  bottomPriceUnit: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginLeft: 3,
  },
  bottomSlotLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  bottomButtonWrap: {
    flex: 1.3,
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
