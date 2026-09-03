// AIInsightCard — dismissible banner with a tint background, icon, title, body, and CTA.
// Used on the Owner Dashboard to surface a "smart" suggestion.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function AIInsightCard({ insight, onPress }) {
  const { title, body, cta, icon } = insight;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color="#7C3AED" />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body2}>{body}</Text>

        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>{cta}</Text>
          <Ionicons name="arrow-forward" size={14} color="#7C3AED" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#F4ECFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E0CCFF',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#5B21B6',
  },
  body2: {
    fontSize: FONT_SIZE.xs,
    color: '#6B21A8',
    marginTop: 4,
    lineHeight: 18,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  ctaPressed: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: '#7C3AED',
    marginRight: 4,
  },
});
