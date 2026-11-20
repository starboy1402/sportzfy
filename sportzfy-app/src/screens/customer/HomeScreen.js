import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import SectionTitle from '../../components/SectionTitle';
import TurfCard from '../../components/TurfCard';

import {
  POPULAR_TURFS,
  NEARBY_TURFS,
  RECOMMENDED_TURFS,
} from '../../data/mockData';
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

const HORIZONTAL_CARD_WIDTH = 280;

const CATEGORIES = [
  { id: 'all', label: 'All Arenas', icon: 'apps-outline' },
  { id: 'football', label: '⚽ Football', icon: 'football-outline' },
  { id: 'cricket', label: '🏏 Cricket', icon: 'baseball-outline' },
  { id: 'badminton', label: '🏸 Badminton', icon: 'tennisball-outline' },
  { id: 'padel', label: '🎾 Padel', icon: 'trophy-outline' },
];

export default function HomeScreen({ navigation }) {
  const { userLocation } = useBooking();
  const { openAi } = useAiChat();
  const [popularTurfs, setPopularTurfs] = useState(POPULAR_TURFS);
  const [nearbyTurfs, setNearbyTurfs] = useState(NEARBY_TURFS);
  const [recommendedTurfs, setRecommendedTurfs] = useState(RECOMMENDED_TURFS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadTurfs = useCallback(async () => {
    try {
      const liveTurfs = await api.getTurfs();
      if (liveTurfs && liveTurfs.length > 0) {
        const formatted = liveTurfs.map(formatTurfForMobile);
        setPopularTurfs(formatted.slice(0, 6));
        setNearbyTurfs(formatted.slice(6, 12));
        setRecommendedTurfs(formatted.slice(12, 18));
      }
    } catch (err) {
      console.warn('Could not load live turfs, using local catalog:', err.message);
    }
  }, []);

  useEffect(() => {
    loadTurfs();
  }, [loadTurfs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTurfs();
    setRefreshing(false);
  };

  const filterByCat = useCallback((list) => {
    if (selectedCategory === 'all') return list;
    return list.filter((t) =>
      (t.sport || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (t.pitchFormats || '').toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [selectedCategory]);

  const displayedPopular = useMemo(() => filterByCat(popularTurfs), [filterByCat, popularTurfs]);
  const displayedNearby = useMemo(() => filterByCat(nearbyTurfs), [filterByCat, nearbyTurfs]);
  const displayedRecommended = useMemo(() => filterByCat(recommendedTurfs), [filterByCat, recommendedTurfs]);

  function HorizontalCarousel({ data }) {
    if (!data || data.length === 0) {
      return (
        <View style={styles.emptyCarousel}>
          <Text style={styles.emptyCarouselText}>No pitches found for this category.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hListContent}
        snapToInterval={HORIZONTAL_CARD_WIDTH + SPACING.md}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <View style={{ width: HORIZONTAL_CARD_WIDTH, marginRight: SPACING.md }}>
            <TurfCard
              turf={item}
              onPress={() => navigation.navigate('TurfDetails', { turf: item, turfId: item.id })}
            />
          </View>
        )}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Stadium Canopy Header with Integrated Search */}
      <Header
        location={userLocation}
        onAiPress={() => openAi()}
      >
        <SearchBar
          placeholder="Search 7v7, 5v5 turfs in Chattogram, Dhaka..."
          onPress={() => navigation.navigate('Explore')}
          editable={false}
          style={styles.headerSearchBar}
        />
      </Header>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.field]}
            tintColor={COLORS.field}
          />
        }
      >
        {/* Quick Sports Categories Carousel */}
        <View style={styles.categoriesRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* AI Concierge Teaser Hero Card */}
        <TouchableOpacity
          style={styles.aiHeroBanner}
          activeOpacity={0.88}
          onPress={() => openAi('⚽ 7v7 Turfs in Chattogram with open evening slots')}
        >
          <View style={styles.aiHeroIconWrap}>
            <Ionicons name="sparkles" size={24} color="#A7F3D0" />
          </View>
          <View style={styles.aiHeroContent}>
            <View style={styles.aiHeroBadgeRow}>
              <Text style={styles.aiHeroBadge}>SPORTZFY AI CONCIERGE</Text>
              <View style={styles.liveTag}>
                <Text style={styles.liveTagText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.aiHeroTitle}>Need a turf or squad tonight?</Text>
            <Text style={styles.aiHeroSubtitle}>
              Tap to find instant 5-min holds, open squads, and off-peak rates.
            </Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={26} color={COLORS.field} />
        </TouchableOpacity>

        {/* Trending Turfs Carousel */}
        <SectionTitle
          title="⚡ Trending Pitches"
          onSeeAll={() => navigation.navigate('Explore')}
        />
        <HorizontalCarousel data={displayedPopular} />

        {/* Squad Recruitment Banner Teaser */}
        <TouchableOpacity
          style={styles.squadTeaserCard}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Matches')}
        >
          <View style={styles.squadTeaserLeft}>
            <View style={styles.squadBadge}>
              <Text style={styles.squadBadgeText}>SQUADS & MATCHMAKING</Text>
            </View>
            <Text style={styles.squadTitle}>Missing players for tonight?</Text>
            <Text style={styles.squadSubtitle}>
              Find open spots for Goalkeepers, Strikers, or post your own match!
            </Text>
            <View style={styles.squadCtaRow}>
              <Text style={styles.squadCtaText}>Explore Open Squads</Text>
              <Ionicons name="arrow-forward" size={13} color={COLORS.field} />
            </View>
          </View>
          <View style={styles.squadTeaserIconWrap}>
            <Ionicons name="people" size={36} color={COLORS.forest} />
          </View>
        </TouchableOpacity>

        {/* Nearby Turfs Vertical List */}
        <SectionTitle
          title="📍 Nearby Arenas"
          onSeeAll={() => navigation.navigate('Explore')}
        />
        <View style={styles.verticalList}>
          {displayedNearby.slice(0, 4).map((turf) => (
            <TurfCard
              key={turf.id}
              turf={turf}
              onPress={() =>
                navigation.navigate('TurfDetails', { turf, turfId: turf.id })
              }
            />
          ))}
        </View>

        {/* Top Rated Arenas Carousel */}
        <SectionTitle
          title="⭐ Top Rated by Players"
          onSeeAll={() => navigation.navigate('Explore')}
        />
        <HorizontalCarousel data={displayedRecommended} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  headerSearchBar: {
    marginTop: 2,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.pill,
    ...SHADOWS.sm,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },

  // Sports Categories
  categoriesRow: {
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.forest,
    borderColor: COLORS.forest,
    ...SHADOWS.sm,
  },
  categoryText: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.white,
  },

  // AI Hero Teaser
  aiHeroBanner: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.forestDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    ...SHADOWS.md,
  },
  aiHeroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  aiHeroContent: {
    flex: 1,
  },
  aiHeroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  aiHeroBadge: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    color: '#A7F3D0',
    letterSpacing: 0.8,
  },
  liveTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: RADIUS.pill,
  },
  liveTagText: {
    fontSize: 8,
    fontWeight: FONT_WEIGHT.bold,
    color: '#6EE7B7',
  },
  aiHeroTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  aiHeroSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },

  // Squad Teaser Banner
  squadTeaserCard: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
    ...SHADOWS.sm,
  },
  squadTeaserLeft: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  squadBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    marginBottom: 4,
  },
  squadBadgeText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
    letterSpacing: 0.5,
  },
  squadTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  squadSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  squadCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  squadCtaText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.field,
  },
  squadTeaserIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },

  // Carousels & Lists
  hListContent: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  verticalList: {
    paddingHorizontal: SPACING.lg,
  },
  emptyCarousel: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  emptyCarouselText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
});
