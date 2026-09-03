// OwnerTurfScreen — owner's turf management tab.
// Lets the owner view their turf header, edit turf details, toggle slot availability,
// and edit per-hour pricing.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import SectionTitle from '../../components/SectionTitle';
import OwnerSlotTile from '../../components/OwnerSlotTile';
import EditTurfModal from '../../components/EditTurfModal';
import EditPriceModal from '../../components/EditPriceModal';

import {
  OWNER_TURF_CARD,
  OWNER_TURF_FORM,
  OWNER_SLOTS,
  PRICING_TIERS,
} from '../../data/ownerMockData';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

export default function OwnerTurfScreen() {
  const [form, setForm] = useState(OWNER_TURF_FORM);
  const [slots, setSlots] = useState(OWNER_SLOTS);
  const [tiers, setTiers] = useState(PRICING_TIERS);
  const [showEditTurf, setShowEditTurf] = useState(false);
  const [showEditPrice, setShowEditPrice] = useState(false);

  function toggleSlot(id) {
    setSlots(slots.map((s) => (s.id === id ? { ...s, status: 'available' } : s)));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Turf hero header */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: OWNER_TURF_CARD.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{OWNER_TURF_CARD.name}</Text>
            <View style={styles.heroMetaRow}>
              <Ionicons name="location-sharp" size={14} color={COLORS.textOnPrimary} />
              <Text style={styles.heroMeta}>{OWNER_TURF_CARD.location}</Text>
            </View>
            <View style={styles.heroMetaRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.heroMeta}>
                {OWNER_TURF_CARD.rating} ({OWNER_TURF_CARD.reviewCount} reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={() => setShowEditTurf(true)}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>Edit Turf</Text>
          </Pressable>
          <View style={{ width: SPACING.sm }} />
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={() => setShowEditPrice(true)}
          >
            <Ionicons name="pricetag-outline" size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>Edit Pricing</Text>
          </Pressable>
        </View>

        {/* Pricing summary cards */}
        <SectionTitle title="Pricing" />
        <View style={styles.section}>
          {tiers.map((tier) => (
            <View key={tier.id} style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>{tier.label}</Text>
                <Text style={styles.priceHint}>{tier.hint}</Text>
              </View>
              <Text style={styles.priceValue}>৳ {tier.price}/hr</Text>
            </View>
          ))}
        </View>

        {/* Slot availability grid */}
        <SectionTitle title="Slot Availability" />
        <View style={styles.section}>
          <View style={styles.slotsGrid}>
            {slots.map((slot) => (
              <View key={slot.id} style={styles.slotCell}>
                <OwnerSlotTile slot={slot} onPress={() => toggleSlot(slot.id)} />
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Modals */}
      <EditTurfModal
        visible={showEditTurf}
        form={form}
        onChange={setForm}
        onClose={() => setShowEditTurf(false)}
        onSave={() => setShowEditTurf(false)}
      />
      <EditPriceModal
        visible={showEditPrice}
        tiers={tiers}
        onClose={() => setShowEditPrice(false)}
        onSave={(next) => {
          setTiers(next);
          setShowEditPrice(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  heroWrap: {
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  heroName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textOnPrimary,
    marginBottom: SPACING.xs,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  heroMeta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textOnPrimary,
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnPressed: {
    opacity: 0.7,
  },
  actionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  priceLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  priceHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  priceValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  slotCell: {
    width: '50%',
    padding: SPACING.xs,
  },
});
