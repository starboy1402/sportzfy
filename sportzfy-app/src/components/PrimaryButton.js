// Reusable primary call-to-action button used across screens.
// Accepts `title`, `onPress`, `disabled`, `loading`, `variant`, and optional `style` override.

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary', // 'primary' | 'outline' | 'danger'
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;

  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  let btnBackground = COLORS.primary;
  let textColor = COLORS.textOnPrimary;

  if (isOutline) {
    btnBackground = 'transparent';
    textColor = COLORS.primary;
  } else if (isDanger) {
    btnBackground = COLORS.danger;
    textColor = COLORS.textOnPrimary;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={isDisabled ? null : onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        { backgroundColor: btnBackground },
        isOutline && styles.outline,
        isDisabled && styles.disabled,
        !isDisabled && !isOutline && SHADOWS.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.title,
            { color: textColor },
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.lg - 2,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  disabled: {
    backgroundColor: COLORS.slotBookedBg,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  title: {
    fontSize: FONT_SIZE.md + 1,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.3,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});
