// EditPriceModal — bottom-sheet style modal that lets the owner
// edit per-hour prices for the three pricing tiers (weekday / weekend / peak).

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from './PrimaryButton';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

export default function EditPriceModal({ visible, tiers, onClose, onSave }) {
  // Local working copy so the user can cancel without persisting changes.
  const [draft, setDraft] = useState(tiers);

  // Re-seed the draft whenever the modal is opened.
  React.useEffect(() => {
    if (visible) setDraft(tiers);
  }, [visible, tiers]);

  function updatePrice(id, value) {
    // Strip non-numeric characters so the user can paste "৳ 1,200" safely.
    const cleaned = value.replace(/[^0-9]/g, '');
    setDraft(draft.map((t) => (t.id === id ? { ...t, price: Number(cleaned) || 0 } : t)));
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Edit Pricing</Text>
          <Text style={styles.sub}>Set your hourly rate per tier.</Text>

          {draft.map((tier) => (
            <View key={tier.id} style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.tierLabel}>{tier.label}</Text>
                <Text style={styles.tierHint}>{tier.hint}</Text>
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.currency}>৳</Text>
                <TextInput
                  style={styles.input}
                  value={String(tier.price)}
                  keyboardType="numeric"
                  onChangeText={(v) => updatePrice(tier.id, v)}
                />
              </View>
            </View>
          ))}

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <View style={{ width: SPACING.sm }} />
            <View style={{ flex: 1 }}>
              <PrimaryButton title="Save Pricing" onPress={() => onSave(draft)} />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  sub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  rowLeft: {
    flex: 1,
  },
  tierLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  tierHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minWidth: 110,
  },
  currency: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  cancelBtn: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
});
