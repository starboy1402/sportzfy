// App header used across customer tab screens.
// Stadium Forest canopy header with brand badge, location picker pill, and AI concierge trigger.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAiChat } from '../context/AiChatContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function Header({
  location,
  onLocationPress,
  onAiPress,
  rightComponent,
  children,
  style,
}) {
  const { openAi } = useAiChat();

  const handleAiPress = () => {
    if (onAiPress) {
      onAiPress();
    } else {
      openAi();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Top App Bar Row */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="football" size={19} color={COLORS.forest} />
          </View>
          <View>
            <Text style={styles.brand}>SPORTZFY</Text>
            <Text style={styles.tagline}>STADIUM & MATCH ARENA</Text>
          </View>
        </View>

        {rightComponent || (
          <View style={styles.rightActions}>
            {/* AI Assistant Pill Button */}
            <TouchableOpacity
              style={styles.aiPill}
              activeOpacity={0.8}
              onPress={handleAiPress}
            >
              <Ionicons name="sparkles" size={13} color="#A7F3D0" />
              <Text style={styles.aiText}>AI</Text>
              <View style={styles.aiDot} />
            </TouchableOpacity>

            {/* Location Pill */}
            <TouchableOpacity
              style={styles.locationPill}
              activeOpacity={0.75}
              onPress={onLocationPress}
            >
              <Ionicons name="location-sharp" size={13} color={COLORS.field} />
              <Text style={styles.locationText} numberOfLines={1}>
                {location || 'Chattogram'}
              </Text>
              <Ionicons name="chevron-down" size={11} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Optional Child content, like Search Bar or Subheaders */}
      {children ? <View style={styles.childrenWrap}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.forestDark,
    paddingTop: SPACING.lg + 4,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xxl + 4,
    borderBottomRightRadius: RADIUS.xxl + 4,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(16, 185, 129, 0.15)',
    ...SHADOWS.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.mint,
    borderWidth: 1.5,
    borderColor: COLORS.field,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm + 2,
    ...SHADOWS.sm,
  },
  brand: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 1.2,
  },
  tagline: {
    color: '#6EE7B7',
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.8,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  aiText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 0.5,
  },
  aiDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.field,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    maxWidth: 140,
    gap: 4,
  },
  locationText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  childrenWrap: {
    marginTop: SPACING.md,
  },
});
