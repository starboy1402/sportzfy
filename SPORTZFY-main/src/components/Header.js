// App header used inside tab screens (Home, Explore, Bookings/Profile).
// Shows the Sportzfy brand, current user location, and a location icon.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function Header({ location, onLocationPress, style }) {
  return (
    <View style={[styles.container, style]}>
      <View>
        <Text style={styles.brand}>Sportzfy</Text>
        <TouchableOpacity
          style={styles.locationRow}
          activeOpacity={0.7}
          onPress={onLocationPress}
        >
          <Ionicons name="location-sharp" size={14} color={COLORS.white} />
          <Text style={styles.location} numberOfLines={1}>
            {location || 'Select location'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={COLORS.white}
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  brand: {
    color: COLORS.textOnPrimary,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  location: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginLeft: SPACING.xs,
    maxWidth: 220,
  },
});