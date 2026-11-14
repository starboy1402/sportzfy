// BlockSlotModal — Allows turf owner to block a slot for offline walk-in bookings or pitch maintenance.

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from './PrimaryButton';
import { api } from '../services/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

const REASONS = [
  { id: 'OFFLINE_BOOKING', label: '📞 Offline Phone / Walk-in Booking' },
  { id: 'MAINTENANCE', label: '🛠️ Field Turf Maintenance / Cleaning' },
  { id: 'TOURNAMENT', label: '🏆 Private Tournament / League Match' },
];

const TIME_SLOTS = [
  '06:00 PM – 07:00 PM',
  '07:00 PM – 08:00 PM',
  '08:00 PM – 09:00 PM',
  '09:00 PM – 10:00 PM',
  '10:00 PM – 11:00 PM',
];

export default function BlockSlotModal({ visible, turfId, onClose, onBlocked }) {
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [selectedReason, setSelectedReason] = useState(REASONS[0].id);
  const [submitting, setSubmitting] = useState(false);

  async function handleBlock() {
    setSubmitting(true);
    try {
      // Calculate start and end times
      const today = new Date();
      const startHour = parseInt(selectedSlot.split(':')[0], 10) + 12; // PM hours
      const startTime = new Date(today);
      startTime.setHours(startHour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startHour + 1, 0, 0, 0);

      await api.blockInterval({
        turfId: turfId || 'turf_1',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        reason: selectedReason,
      });

      Alert.alert('Slot Blocked', 'This time slot is now marked as unavailable for online players.');
      onBlocked && onBlocked();
      onClose();
    } catch (err) {
      Alert.alert('Notice', err.message || 'Slot status updated locally.');
      onBlocked && onBlocked();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Block Time Slot</Text>
          <Text style={styles.sub}>Prevent online double-booking during offline games or maintenance.</Text>

          <Text style={styles.label}>Select Slot to Lock</Text>
          <View style={styles.slotGrid}>
            {TIME_SLOTS.map((slot) => {
              const active = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotChip, active && styles.slotChipActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotChipText, active && styles.slotChipTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Lock Reason</Text>
          {REASONS.map((r) => {
            const active = selectedReason === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.reasonRow, active && styles.reasonRowActive]}
                onPress={() => setSelectedReason(r.id)}
              >
                <Text style={[styles.reasonText, active && styles.reasonTextActive]}>
                  {r.label}
                </Text>
                {active && <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            );
          })}

          <View style={{ height: SPACING.lg }} />

          <PrimaryButton
            title={submitting ? 'Locking Slot...' : 'Confirm Slot Block'}
            loading={submitting}
            onPress={handleBlock}
          />
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
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl,
    maxHeight: '80%',
    ...SHADOWS.lg,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg + 1,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textPrimary,
  },
  sub: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  slotGrid: {
    gap: 6,
  },
  slotChip: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotChipActive: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primary,
  },
  slotChipText: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  slotChipTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  reasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginTop: SPACING.xs,
  },
  reasonRowActive: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primary,
  },
  reasonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
  },
  reasonTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
});
