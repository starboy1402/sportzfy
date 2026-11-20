import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import TurfCard from '../../components/TurfCard';
import FilterModal from '../../components/FilterModal';

import { TURFS, PRICE_RANGE } from '../../data/mockData';
import { useBooking } from '../../context/BookingContext';
import { useAiChat } from '../../context/AiChatContext';
import { api, formatTurfForMobile } from '../../services/api';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
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

const CATEGORIES = [
  { id: 'all', label: 'All Arenas' },
  { id: 'football', label: '⚽ Football' },
  { id: 'cricket', label: '🏏 Cricket' },
  { id: 'badminton', label: '🏸 Badminton' },
  { id: 'padel', label: '🎾 Padel' },
];

export default function ExploreScreen({ navigation }) {
  const { userLocation } = useBooking();
  const { openAi } = useAiChat();

  const [turfList, setTurfList] = useState(TURFS);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [quickSport, setQuickSport] = useState('all');

  useEffect(() => {
    async function fetchLiveTurfs() {
      setLoading(true);
      try {
        const live = await api.getTurfs();
        if (live && live.length > 0) {
          setTurfList(live.map(formatTurfForMobile));
        }
      } catch (e) {
        console.warn('Using fallback turfs in Explore:', e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveTurfs();
  }, []);

  function parseRating(value) {
    if (!value || value === 'Any') return 0;
    return parseFloat(value) || 0;
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minRating = parseRating(filters.minRating);

    return turfList.filter((t) => {
      // Quick sport pill
      if (quickSport !== 'all') {
        const sportMatch =
          (t.sport || '').toLowerCase().includes(quickSport.toLowerCase()) ||
          (t.pitchFormats || '').toLowerCase().includes(quickSport.toLowerCase());
        if (!sportMatch) return false;
      }

      // Query filter
      if (
        q &&
        !t.name.toLowerCase().includes(q) &&
        !(t.location || '').toLowerCase().includes(q) &&
        !(t.area || '').toLowerCase().includes(q)
      ) {
        return false;
      }

      // Modal filters
      if (
        filters.location !== 'All' &&
        !(t.location || '').toLowerCase().includes(filters.location.toLowerCase()) &&
        !(t.area || '').toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.sport !== 'All' &&
        !(t.sport || '').toLowerCase().includes(filters.sport.toLowerCase())
      ) {
        return false;
      }
      if (t.pricePerHour < filters.minPrice || t.pricePerHour > filters.maxPrice) {
        return false;
      }
      if (t.rating < minRating) {
        return false;
      }
      return true;
    });
  }, [turfList, query, filters, quickSport]);

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
      {/* Stadium Header with Search + Filter Trigger + AI */}
      <Header
        location={userLocation}
        onAiPress={() => openAi()}
      >
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search by arena, area (GEC, Halishahar)..."
              style={styles.headerSearchBar}
            />
          </View>

          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setShowFilters(true)}
            activeOpacity={0.8}
            accessibilityLabel="Filter options"
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={activeFilterCount > 0 ? COLORS.white : COLORS.forest}
            />
            {activeFilterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Header>

      {/* Quick Sport Category Chips */}
      <View style={styles.sportChipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sportChipsScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = quickSport === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.sportChip, active && styles.sportChipActive]}
                onPress={() => setQuickSport(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.sportChipText, active && styles.sportChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Count & Reset Row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCountRow}>
          <Text style={styles.summaryText}>
            {loading ? 'Scanning venues...' : `${results.length} Pitches Available`}
          </Text>
          <View style={styles.liveSlotDot} />
        </View>
        {(activeFilterCount > 0 || quickSport !== 'all' || query.length > 0) && (
          <TouchableOpacity
            onPress={() => {
              setFilters(DEFAULT_FILTERS);
              setQuickSport('all');
              setQuery('');
            }}
          >
            <Text style={styles.clearText}>Reset filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Venues List */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.field} />
            <Text style={styles.loadingText}>Fetching available arenas...</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="search-outline" size={36} color={COLORS.forest} />
            </View>
            <Text style={styles.emptyTitle}>No matching pitches found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your price range, sport format, or ask our AI concierge to recommend alternative venues.
            </Text>
            <TouchableOpacity
              style={styles.aiAskButton}
              onPress={() => openAi('Suggest turfs in Chattogram under 2000 BDT')}
            >
              <Ionicons name="sparkles" size={16} color={COLORS.white} />
              <Text style={styles.aiAskButtonText}>Ask AI to Find Turfs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          results.map((item) => (
            <TurfCard
              key={item.id}
              turf={item}
              onPress={() =>
                navigation.navigate('TurfDetails', { turf: item, turfId: item.id })
              }
            />
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Filter Bottom Sheet Modal */}
      <FilterModal
        visible={showFilters}
        filters={filters}
        onApply={(next) => {
          setFilters(next);
          setShowFilters(false);
        }}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setShowFilters(false);
        }}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  headerSearchBar: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.pill,
    ...SHADOWS.sm,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.mint,
    borderWidth: 1.5,
    borderColor: COLORS.field,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...SHADOWS.sm,
  },
  filterBtnActive: {
    backgroundColor: COLORS.field,
    borderColor: COLORS.field,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: COLORS.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
  },
  sportChipsWrap: {
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sportChipsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  sportChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sportChipActive: {
    backgroundColor: COLORS.forest,
    borderColor: COLORS.forest,
  },
  sportChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  sportChipTextActive: {
    color: COLORS.white,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  summaryCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  liveSlotDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.field,
  },
  clearText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.field,
    fontWeight: FONT_WEIGHT.bold,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: 110,
  },
  loadingWrap: {
    paddingVertical: SPACING.xxxl,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  aiAskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.forest,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.pill,
    gap: 6,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  aiAskButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
  },
});
