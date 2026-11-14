// OwnerHeader — Stadium canopy header for all Turf Owner workspace screens.
// Provides visual parity with Customer Header and Sportzfy Web Venue Console.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function OwnerHeader({
  badge = 'VENUE OPERATOR CONSOLE',
  title = 'Overview',
  subtitle,
  rightAction,
  children,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      {/* Top App Bar Row */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.forest} />
          </View>
          <View>
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeText}>{badge}</Text>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.consoleText}>SPORTZFY PRO</Text>
          </View>
        </View>

        {rightAction ? <View style={styles.rightActionWrap}>{rightAction}</View> : null}
      </View>

      {/* Screen Title & Subtitle */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {/* Optional Child content */}
      {children ? <View style={styles.childrenWrap}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.forestDark,
    paddingTop: SPACING.lg + 4,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg + 2,
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
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    color: '#A7F3D0',
    fontSize: 8,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 0.8,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.field,
  },
  consoleText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 0.5,
  },
  rightActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleSection: {
    marginTop: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
  childrenWrap: {
    marginTop: SPACING.sm,
  },
});
