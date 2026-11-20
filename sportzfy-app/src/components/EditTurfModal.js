// EditTurfModal — bottom-sheet style modal that lets the owner edit
// turf name, location, description, and toggle facilities on/off.
// Pure controlled component: parent owns the form state and a save handler.

import React from 'react';
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

export default function EditTurfModal({
  visible,
  form,
  onChange,
  onClose,
  onSave,
}) {
  function toggleFacility(facility) {
    const next = form.facilities.includes(facility)
      ? form.facilities.filter((f) => f !== facility)
      : [...form.facilities, facility];
    onChange({ ...form, facilities: next });
  }

  const ALL_FACILITIES = ['Floodlights', 'Changing Room', 'Parking', 'Washroom', 'Cafe', 'Seating'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Edit Turf Details</Text>
          <Text style={styles.sub}>Update what customers see when they browse.</Text>

          {/* Name */}
          <Text style={styles.label}>Turf name</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(t) => onChange({ ...form, name: t })}
            placeholder="Turf name"
            placeholderTextColor={COLORS.textMuted}
          />

          {/* Location */}
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={form.location}
            onChangeText={(t) => onChange({ ...form, location: t })}
            placeholder="Location"
            placeholderTextColor={COLORS.textMuted}
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.description}
            onChangeText={(t) => onChange({ ...form, description: t })}
            placeholder="Description"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
          />

          {/* Facilities toggle chips */}
          <Text style={styles.label}>Facilities</Text>
          <View style={styles.chipsRow}>
            {ALL_FACILITIES.map((facility) => {
              const active = form.facilities.includes(facility);
              return (
                <Pressable
                  key={facility}
                  onPress={() => toggleFacility(facility)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Ionicons
                    name={active ? 'checkmark-circle' : 'add-circle-outline'}
                    size={14}
                    color={active ? COLORS.textOnPrimary : COLORS.primary}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {facility}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <View style={{ width: SPACING.sm }} />
            <View style={{ flex: 1 }}>
              <PrimaryButton title="Save Changes" onPress={onSave} />
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
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textPrimary,
    marginLeft: 4,
    fontWeight: FONT_WEIGHT.medium,
  },
  chipTextActive: {
    color: COLORS.textOnPrimary,
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
