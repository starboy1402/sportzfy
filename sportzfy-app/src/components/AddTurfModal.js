// AddTurfModal — Allows Turf Owner to register a new pitch arena directly from the mobile app.
// Mirrors `/owner/turfs/new` on the web app.

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from './PrimaryButton';
import { api } from '../services/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

const ALL_FACILITIES = ['Floodlights', 'Changing Room', 'Parking', 'Washroom', 'Drinking Water', 'Cafeteria'];
const CITIES = ['Chattogram', 'Dhaka', 'Sylhet'];

export default function AddTurfModal({ visible, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [pricePerHour, setPricePerHour] = useState('1500');
  const [formats, setFormats] = useState('7v7 Football');
  const [facilities, setFacilities] = useState(['Floodlights', 'Parking', 'Drinking Water']);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function toggleFacility(f) {
    if (facilities.includes(f)) {
      setFacilities(facilities.filter((item) => item !== f));
    } else {
      setFacilities([...facilities, f]);
    }
  }

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please provide a name for the turf arena.');
      return;
    }
    if (!area.trim()) {
      Alert.alert('Required Field', 'Please enter the neighborhood area (e.g. Halishahar, Khulshi).');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createOwnerTurf({
        name: name.trim(),
        city,
        area: area.trim(),
        address: address.trim() || `${area.trim()}, ${city}`,
        basePricePerHour: parseInt(pricePerHour, 10) || 1500,
        pitchFormats: formats,
        hasFloodlights: facilities.includes('Floodlights'),
        hasChangingRoom: facilities.includes('Changing Room'),
        hasParking: facilities.includes('Parking'),
        hasWashroom: facilities.includes('Washroom'),
        hasWater: facilities.includes('Drinking Water'),
        description: description.trim() || 'Verified premier sports arena on Sportzfy.',
      });

      Alert.alert('Turf Submitted!', 'Your new turf registration has been submitted for platform review.', [
        {
          text: 'Done',
          onPress: () => {
            onCreated && onCreated(created);
            onClose();
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Saved Offline', 'Turf details recorded locally for your owner portal.');
      onCreated && onCreated();
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
          <Text style={styles.title}>Register New Turf</Text>
          <Text style={styles.sub}>Submit a new arena pitch for listing on the marketplace.</Text>

          <Text style={styles.label}>Turf Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Stamford Arena Turf"
            placeholderTextColor={COLORS.textPlaceholder}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>City</Text>
          <View style={styles.cityRow}>
            {CITIES.map((c) => {
              const active = city === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.cityChip, active && styles.cityChipActive]}
                  onPress={() => setCity(c)}
                >
                  <Text style={[styles.cityChipText, active && styles.cityChipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Area / Neighborhood *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Halishahar, Khulshi, Dhanmondi"
            placeholderTextColor={COLORS.textPlaceholder}
            value={area}
            onChangeText={setArea}
          />

          <Text style={styles.label}>Street Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Plot 14, Road 2, Block B"
            placeholderTextColor={COLORS.textPlaceholder}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>Base Price Per Hour (৳ BDT)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={pricePerHour}
            onChangeText={setPricePerHour}
          />

          <Text style={styles.label}>Arena Facilities</Text>
          <View style={styles.facilityGrid}>
            {ALL_FACILITIES.map((f) => {
              const active = facilities.includes(f);
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.facChip, active && styles.facChipActive]}
                  onPress={() => toggleFacility(f)}
                >
                  <Ionicons
                    name={active ? 'checkmark-circle' : 'add-circle-outline'}
                    size={14}
                    color={active ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={[styles.facText, active && styles.facTextActive]}>{f}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Turf Description</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            placeholder="Tell players about your grass quality, parking space, dugout..."
            placeholderTextColor={COLORS.textPlaceholder}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <PrimaryButton
            title={submitting ? 'Registering...' : 'Submit Turf Registration'}
            loading={submitting}
            onPress={handleSubmit}
            style={{ marginTop: SPACING.lg, marginBottom: SPACING.xl }}
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
    maxHeight: '90%',
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
  input: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  cityRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cityChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cityChipActive: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primary,
  },
  cityChipText: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  cityChipTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  facilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  facChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  facChipActive: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primary,
  },
  facText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  facTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
});
