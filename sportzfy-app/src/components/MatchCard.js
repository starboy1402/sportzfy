// MatchCard — displays open match challenge or recruitment post.
// Athletic squad recruitment card inspired by Playo and Nike FC team sheets.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function MatchCard({ match, onPress, style }) {
  const openSpots = match.openSpots ?? (match.totalSpots ? match.totalSpots - (match.joinRequests?.length || 0) : 1);
  const totalSpots = match.totalSpots || 14;
  const cost = match.costPerPlayer || 150;
  const role = match.requiredRole || 'Player';
  const format = match.sportFormat || '7v7';
  const turfName = match.turf?.name || 'Local Turf Arena';
  const area = match.turf?.area || match.area || 'Chattogram';
  const hostName = match.hostUser?.name || 'Captain';

  let formattedTime = 'Upcoming';
  if (match.matchTime) {
    try {
      const d = new Date(match.matchTime);
      formattedTime = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      formattedTime = match.matchTime;
    }
  }

  const isFull = openSpots <= 0;

  const roleEmoji =
    role.toLowerCase().includes('keep') || role.toLowerCase().includes('gk')
      ? '🧤'
      : role.toLowerCase().includes('strik') || role.toLowerCase().includes('forward')
      ? '⚡'
      : role.toLowerCase().includes('def')
      ? '🛡️'
      : role.toLowerCase().includes('mid')
      ? '🎯'
      : '⚽';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress && onPress(match)}
      style={[styles.card, style]}
    >
      {/* Top Header: Host info + Format pill */}
      <View style={styles.topRow}>
        <View style={styles.hostRow}>
          <View style={styles.hostAvatar}>
            <Text style={styles.hostInitial}>{hostName[0]?.toUpperCase() || 'C'}</Text>
          </View>
          <View>
            <Text style={styles.hostLabel}>MATCH HOST</Text>
            <Text style={styles.hostName} numberOfLines={1}>
              {hostName}
            </Text>
          </View>
        </View>

        <View style={styles.formatBadge}>
          <Ionicons name="football" size={11} color={COLORS.forest} />
          <Text style={styles.formatText}>{format}</Text>
        </View>
      </View>

      {/* Match Title */}
      <Text style={styles.title} numberOfLines={2}>
        {match.title || 'Casual Match Recruitment'}
      </Text>

      {/* Turf & Time Row */}
      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <Ionicons name="location-sharp" size={13} color={COLORS.field} />
          <Text style={styles.infoText} numberOfLines={1}>
            {turfName} • {area}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={13} color={COLORS.forest} />
          <Text style={styles.infoText}>{formattedTime}</Text>
        </View>
      </View>

      {/* Position Needed & Open Spots Badges */}
      <View style={styles.pillsRow}>
        <View style={styles.rolePill}>
          <Text style={styles.roleEmoji}>{roleEmoji}</Text>
          <Text style={styles.roleText}>Needs: {role}</Text>
        </View>

        <View style={[styles.spotsPill, isFull ? styles.spotsFull : styles.spotsOpen]}>
          <Ionicons
            name={isFull ? 'lock-closed' : 'people'}
            size={11}
            color={isFull ? COLORS.textMuted : COLORS.forest}
          />
          <Text style={[styles.spotsText, isFull ? styles.spotsTextFull : styles.spotsTextOpen]}>
            {isFull ? 'Squad Full' : `${openSpots}/${totalSpots} Spots Open`}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer: Split Cost & Action CTA */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.costLabel}>Cost per player</Text>
          <View style={styles.costRow}>
            <Text style={styles.costValue}>৳{cost}</Text>
            <Text style={styles.costUnit}>/player</Text>
          </View>
        </View>

        <View style={[styles.joinBtn, isFull && styles.joinBtnFull]}>
          <Text style={[styles.joinBtnText, isFull && styles.joinBtnTextFull]}>
            {isFull ? 'View Squad' : 'Join Match'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={13}
            color={isFull ? COLORS.textMuted : COLORS.white}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.mint,
    borderWidth: 1.5,
    borderColor: COLORS.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostInitial: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  hostLabel: {
    fontSize: 8,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  hostName: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  formatText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  infoBlock: {
    gap: 4,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  roleEmoji: {
    fontSize: 11,
  },
  roleText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: '#92400E',
  },
  spotsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  spotsOpen: {
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  spotsFull: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  spotsText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },
  spotsTextOpen: {
    color: COLORS.forest,
  },
  spotsTextFull: {
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  costValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  costUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  joinBtn: {
    backgroundColor: COLORS.field,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...SHADOWS.sm,
  },
  joinBtnFull: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  joinBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
  },
  joinBtnTextFull: {
    color: COLORS.textMuted,
  },
});
