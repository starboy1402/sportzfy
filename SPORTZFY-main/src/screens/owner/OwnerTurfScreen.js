// OwnerTurfScreen — Owner's pitch management tab.
// Unified with Sportzfy Stadium design system: canopy header, hero banner, action dock, and slot timetable.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import OwnerHeader from '../../components/OwnerHeader';
import SectionTitle from '../../components/SectionTitle';
import OwnerSlotTile from '../../components/OwnerSlotTile';
import EditTurfModal from '../../components/EditTurfModal';
import EditPriceModal from '../../components/EditPriceModal';
import BlockSlotModal from '../../components/BlockSlotModal';
import AddTurfModal from '../../components/AddTurfModal';

import {
  OWNER_TURF_CARD,
  OWNER_TURF_FORM,
  OWNER_SLOTS,
  PRICING_TIERS,
} from '../../data/ownerMockData';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../../constants/theme';

export default function OwnerTurfScreen() {
  const [form, setForm] = useState(OWNER_TURF_FORM);
  const [slots, setSlots] = useState(OWNER_SLOTS);
  const [tiers, setTiers] = useState(PRICING_TIERS);
  const [showEditTurf, setShowEditTurf] = useState(false);
  const [showEditPrice, setShowEditPrice] = useState(false);
  const [showBlockSlot, setShowBlockSlot] = useState(false);
  const [showAddTurf, setShowAddTurf] = useState(false);

  function toggleSlot(id) {
    setSlots(
      slots.map((s) =>
        s.id === id ? { ...s, status: s.status === 'available' ? 'booked' : 'available' } : s
      )
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Stadium Operator Canopy Header */}
      <OwnerHeader
        badge="MY MANAGED PITCHES"
        title="Arena Inventory"
        subtitle="Update venue details, pricing tiers, and manage real-time slot availability."
        rightAction={
          <TouchableOpacity
            style={styles.addTurfBtn}
            onPress={() => setShowAddTurf(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={15} color={COLORS.forestDark} />
            <Text style={styles.addTurfBtnText}>New Turf</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stadium Hero Banner */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: OWNER_TURF_CARD.image }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />

          {/* Floating Badges */}
          <View style={styles.heroFormatBadge}>
            <Ionicons name="football" size={11} color={COLORS.white} />
            <Text style={styles.heroFormatText}>7v7 Astroturf • FIFA Standard</Text>
          </View>

          <View style={styles.heroRatingBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.heroRatingText}>{OWNER_TURF_CARD.rating}</Text>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{form.name || OWNER_TURF_CARD.name}</Text>
            <View style={styles.heroMetaRow}>
              <Ionicons name="location-sharp" size={13} color="#A7F3D0" />
              <Text style={styles.heroMeta}>{form.location || OWNER_TURF_CARD.location}</Text>
            </View>
          </View>
        </View>

        {/* Action Dock (3 High-Impact Pro Actions) */}
        <View style={styles.actionsDock}>
          <TouchableOpacity
            style={styles.dockItem}
            onPress={() => setShowEditTurf(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.dockIconWrap, { backgroundColor: COLORS.mint }]}>
              <Ionicons name="create-outline" size={18} color={COLORS.forest} />
            </View>
            <Text style={styles.dockText}>Edit Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dockItem}
            onPress={() => setShowEditPrice(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.dockIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="pricetag-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.dockText}>Rate Tiers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dockItem}
            onPress={() => setShowBlockSlot(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.dockIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#D97706" />
            </View>
            <Text style={styles.dockText}>Block Slot</Text>
          </TouchableOpacity>
        </View>

        {/* Pricing Structure Cards */}
        <SectionTitle title="💰 Pricing Structure & Yield" />
        <View style={styles.pricingCard}>
          {tiers.map((tier, idx) => (
            <View key={tier.id}>
              <View style={styles.priceRow}>
                <View style={styles.priceRowLeft}>
                  <Text style={styles.priceLabel}>{tier.label}</Text>
                  <Text style={styles.priceHint}>{tier.hint}</Text>
                </View>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceValue}>৳{tier.price}</Text>
                  <Text style={styles.priceUnit}>/hr</Text>
                </View>
              </View>
              {idx < tiers.length - 1 && <View style={styles.priceDivider} />}
            </View>
          ))}
        </View>

        {/* Slot Availability Grid */}
        <SectionTitle title="⚡ Live Slot Timetable" />
        <Text style={styles.slotsHint}>
          Tap any available slot to instantly lock it for offline walk-in players.
        </Text>

        <View style={styles.slotsGrid}>
          {slots.map((slot) => (
            <View key={slot.id} style={styles.slotCell}>
              <OwnerSlotTile slot={slot} onPress={() => toggleSlot(slot.id)} />
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <EditTurfModal
        visible={showEditTurf}
        form={form}
        onChange={setForm}
        onClose={() => setShowEditTurf(false)}
        onSave={() => {
          setShowEditTurf(false);
          Alert.alert('Saved', 'Arena details updated successfully.');
        }}
      />

      <EditPriceModal
        visible={showEditPrice}
        tiers={tiers}
        onClose={() => setShowEditPrice(false)}
        onSave={(next) => {
          setTiers(next);
          setShowEditPrice(false);
          Alert.alert('Saved', 'Pricing structure updated.');
        }}
      />

      <BlockSlotModal
        visible={showBlockSlot}
        onClose={() => setShowBlockSlot(false)}
        onBlock={({ date, slotId, reason }) => {
          setShowBlockSlot(false);
          Alert.alert('✅ Slot Blocked', `Slot ${slotId} on ${date} locked for walk-in (${reason}).`);
        }}
      />

      <AddTurfModal
        visible={showAddTurf}
        onClose={() => setShowAddTurf(false)}
        onSubmit={(newTurf) => {
          setShowAddTurf(false);
          Alert.alert('✅ Pitch Registered', `Pitch "${newTurf.name}" has been published to Sportzfy.`);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  addTurfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  addTurfBtnText: {
    color: COLORS.forestDark,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 110,
  },
  heroCard: {
    height: 180,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.md,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 44, 34, 0.45)',
  },
  heroFormatBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 44, 34, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    gap: 4,
  },
  heroFormatText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },
  heroRatingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    gap: 3,
  },
  heroRatingText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textPrimary,
  },
  heroContent: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  heroName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  heroMeta: {
    fontSize: FONT_SIZE.xs,
    color: '#E2E8F0',
    fontWeight: FONT_WEIGHT.medium,
  },
  actionsDock: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: 8,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
  },
  dockItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dockIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  pricingCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priceRowLeft: {
    flex: 1,
  },
  priceLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  priceHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: COLORS.mint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  priceValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  priceUnit: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  slotsHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: -4,
    marginBottom: SPACING.md,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  slotCell: {
    width: '48.5%',
  },
});
