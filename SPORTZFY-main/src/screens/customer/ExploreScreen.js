import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
// ScrollView used below for the results list.
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import TurfCard from '../../components/TurfCard';
import FilterModal from '../../components/FilterModal';

import {
  TURFS,
  getAllLocations,
  getAllSports,
  PRICE_RANGE,
} from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
} from '../../constants/theme';

const DEFAULT_FILTERS = {
  location: 'All',
  date: 'Any',
  sport: 'All',
  minPrice: PRICE_RANGE.min,
  maxPrice: PRICE_RANGE.max,
  minRating: 'Any',
  availability: 'Any',
};

export default function ExploreScreen({ navigation }) {
  const { userLocation } = useBooking();

  // Search query
  const [query, setQuery] = useState('');

  // Filters (applied). The draft copy lives inside FilterModal.
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Modal visibility
  const [showFilters, setShowFilters] = useState(false);

  // Helper: parse a rating threshold like "4.0+" into a number (4.0).
  function parseRating(value) {
    if (!value || value === 'Any') return 0;
    return parseFloat(value) || 0;
  }

  // Filtering logic — runs whenever query or filters change.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minRating = parseRating(filters.minRating);

    return TURFS.filter((t) => {
      // Search match: name OR location
      if (q && !t.name.toLowerCase().includes(q) && !t.location.toLowerCase().includes(q)) {
        return false;
      }
      // Location
      if (filters.location !== 'All' && t.location !== filters.location) {
        return false;
      }
      // Sport
      if (filters.sport !== 'All' && t.sport !== filters.sport) {
        return false;
      }
      // Price
      if (t.pricePerHour < filters.minPrice || t.pricePerHour > filters.maxPrice) {
        return false;
      }
      // Rating
      if (t.rating < minRating) {
        return false;
      }
      // Availability — mock check: turf has at least one 'available' slot.
      if (filters.availability === 'Available today') {
        const hasOpen = t.availableSlots.some((s) => s.status === 'available');
        if (!hasOpen) return false;
      }
      return true;
    });
  }, [query, filters]);

  // Count of active filters (used for the badge on the Filters button).
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location !== 'All') count++;
    if (filters.sport !== 'All') count++;
    if (filters.minRating !== 'Any') count++;
    if (filters.availability !== 'Any') count++;
    if (filters.minPrice !== PRICE_RANGE.min || filters.maxPrice !== PRICE_RANGE.max) count++;
    if (filters.date !== 'Any') count++;
    return count;
  }, [filters]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header location={userLocation} />

      {/* Search + filter row */}
      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search turfs..."
          />
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          activeOpacity={0.8}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.textOnPrimary} />
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Result count + active filters summary */}
      <View style={styles.summaryRow}>
        <Text style={styles.summary}>
          {results.length} {results.length === 1 ? 'turf' : 'turfs'} found
        </Text>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {results.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No turfs found</Text>
            <Text style={styles.emptySubtitle}>
              Try changing your filters or search keywords.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {results.map((turf) => (
              <TurfCard
                key={turf.id}
                turf={turf}
                onPress={() =>
                  navigation.navigate('TurfDetails', { turfId: turf.id })
                }
              />
            ))}
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={(next) => {
          setFilters(next);
          setShowFilters(false);
        }}
        onReset={(cleared) => setFilters(cleared)}
        locations={getAllLocations()}
        sports={getAllSports()}
        priceRange={PRICE_RANGE}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    marginTop: -SPACING.lg,
  },
  filterBtn: {
    marginLeft: SPACING.md,
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.textOnPrimary,
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },
  summaryRow: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  summary: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  list: {
    paddingHorizontal: SPACING.lg,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});