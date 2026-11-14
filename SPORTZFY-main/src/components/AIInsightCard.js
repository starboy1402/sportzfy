// AIInsightCard — Machine learning yield optimization banner.
// Aligned with Sportzfy Web's Random Forest dynamic pricing engine.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function AIInsightCard({ insight, onPress }) {
  const { title, body, cta = 'Apply Dynamic Rates', icon = 'sparkles' } = insight;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={15} color="#A7F3D0" />
          </View>
          <Text style={styles.badgeText}>SPORTZFY ML YIELD ENGINE</Text>
        </View>
        <View style={styles.confidenceTag}>
          <Text style={styles.confidenceText}>94% Match</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.bodyText}>{body}</Text>

      {/* Suggested Strategy Pill */}
      <View style={styles.strategyRow}>
        <View style={styles.strategyPill}>
          <Text style={styles.strategyLabel}>Current: ৳2,000</Text>
        </View>
        <Ionicons name="arrow-forward" size={12} color="#A7F3D0" />
        <View style={[styles.strategyPill, styles.strategyPillTarget]}>
          <Text style={styles.strategyTargetLabel}>Suggested: ৳2,400</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onPress}
        style={styles.ctaButton}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>{cta}</Text>
        <Ionicons name="flash" size={13} color={COLORS.forestDark} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.forestDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    ...SHADOWS.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    color: '#A7F3D0',
    letterSpacing: 0.8,
  },
  confidenceTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  confidenceText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FCD34D',
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    lineHeight: 20,
  },
  bodyText: {
    fontSize: FONT_SIZE.xs,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 17,
  },
  strategyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  strategyPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  strategyPillTarget: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  strategyLabel: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: FONT_WEIGHT.semibold,
  },
  strategyTargetLabel: {
    fontSize: 10,
    color: '#6EE7B7',
    fontWeight: FONT_WEIGHT.black,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A7F3D0',
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    gap: 6,
  },
  ctaText: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forestDark,
  },
});
