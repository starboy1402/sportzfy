import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import {
  COLORS,
  SPACING,
} from '../../constants/theme';

// Header bar height in the horizontal carousels. Used as `snapToInterval`
// so cards align nicely when the user scrolls.
const HORIZONTAL_CARD_WIDTH = 260;

export default function HomeScreen({ navigation }) {
  const { userLocation } = useBooking();

  // Reusable horizontal carousel row for "Popular" and "Recommended" turfs.
  function HorizontalCarousel({ data }) {
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hListContent}
        snapToInterval={HORIZONTAL_CARD_WIDTH + SPACING.md}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <View style={{ width: HORIZONTAL_CARD_WIDTH, marginRight: SPACING.md }}>
            <TurfCard
              turf={item}
              onPress={() => navigation.navigate('TurfDetails', { turfId: item.id })}
            />
          </View>
        )}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Green header with brand + location */}
      <Header location={userLocation} />

      {/* Scrollable content area */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search bar (sits right under the green header on white surface) */}
        <View style={styles.searchWrapper}>
          <SearchBar placeholder="Search turfs in Chattogram..." />
        </View>

        {/* Popular Turfs — horizontal carousel */}
        <SectionTitle
          title="Popular Turfs"
          onSeeAll={() => navigation.navigate('Explore')}
        />
        <HorizontalCarousel data={POPULAR_TURFS} />

        {/* Nearby Turfs — vertical list */}
        <SectionTitle
          title="Nearby Turfs"
          onSeeAll={() => navigation.navigate('Explore')}
        />
        <View style={styles.verticalList}>
          {NEARBY_TURFS.map((turf) => (
            <TurfCard
              key={turf.id}
              turf={turf}
              onPress={() =>
                navigation.navigate('TurfDetails', { turfId: turf.id })
              }
            />
          ))}
        </View>

        {/* Recommended Turfs — horizontal carousel */}
        <SectionTitle
          title="Recommended For You"
          onSeeAll={() => navigation.navigate('Explore')}
        />
        <HorizontalCarousel data={RECOMMENDED_TURFS} />

        {/* Bottom padding so the last card clears the tab bar */}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.primary, // matches header behind safe area
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginTop: -SPACING.lg, // pull it up so it overlaps the header edge slightly
  },
  hListContent: {
    paddingHorizontal: SPACING.lg,
  },
  verticalList: {
    paddingHorizontal: SPACING.lg,
  },
});