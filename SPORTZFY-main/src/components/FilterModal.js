// Reusable bottom-sheet style filter modal used by the Explore screen.
// Filters: Location, Date, Sport, Price (min/max), Rating, Availability.
//
// Usage:
//   <FilterModal
//     visible={showFilters}
//     onClose={() => setShowFilters(false)}
//     filters={filters}
//     onApply={(next) => { setFilters(next); setShowFilters(false); }}
//     locations={getAllLocations()}
//     sports={getAllSports()}
//   />

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import PrimaryButton from './PrimaryButton';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
} from '../constants/theme';

const RATINGS = ['3.0+', '3.5+', '4.0+', '4.5+'];
const AVAILABILITY = ['Any', 'Available today'];

export default function FilterModal({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
  locations = [],
  sports = [],
  priceRange,
}) {
  // Local draft state — applied only when the user taps "Apply".
  const [draft, setDraft] = useState(filters);

  // Re-sync draft when the modal is reopened or filters change externally.
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  function update(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleApply() {
    onApply && onApply(draft);
  }

  function handleReset() {
    const cleared = {
      location: 'All',
      date: 'Any',
      sport: 'All',
      minPrice: priceRange?.min ?? 0,
      maxPrice: priceRange?.max ?? 0,
      minRating: 'Any',
      availability: 'Any',
    };
    setDraft(cleared);
    onReset && onReset(cleared);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Stop touches on the sheet itself from bubbling to the backdrop */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Drag handle */}
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Location */}
            <FilterGroup label="Location">
              <ChipRow
                options={['All', ...locations]}
                selected={draft.location}
                onSelect={(v) => update('location', v)}
              />
            </FilterGroup>

            {/* Date */}
            <FilterGroup label="Date">
              <ChipRow
                options={['Any', 'Today', 'Tomorrow', 'This Weekend']}
                selected={draft.date}
                onSelect={(v) => update('date', v)}
              />
            </FilterGroup>

            {/* Sport */}
            <FilterGroup label="Sport">
              <ChipRow
                options={['All', ...sports]}
                selected={draft.sport}
                onSelect={(v) => update('sport', v)}
              />
            </FilterGroup>

            {/* Price */}
            <FilterGroup label="Price (BDT / hour)">
              <View style={styles.priceRow}>
                <PriceBox
                  label="Min"
                  value={draft.minPrice}
                  onChange={(v) => update('minPrice', v)}
                />
                <Text style={styles.priceDash}>–</Text>
                <PriceBox
                  label="Max"
                  value={draft.maxPrice}
                  onChange={(v) => update('maxPrice', v)}
                />
              </View>
            </FilterGroup>

            {/* Rating */}
            <FilterGroup label="Rating">
              <ChipRow
                options={['Any', ...RATINGS]}
                selected={draft.minRating}
                onSelect={(v) => update('minRating', v)}
              />
            </FilterGroup>

            {/* Availability */}
            <FilterGroup label="Availability">
              <ChipRow
                options={AVAILABILITY}
                selected={draft.availability}
                onSelect={(v) => update('availability', v)}
              />
            </FilterGroup>
          </ScrollView>

          {/* Footer actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <PrimaryButton title="Apply Filters" onPress={handleApply} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---- Small sub-components used only inside this modal ----

function FilterGroup({ label, children }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ChipRow({ options, selected, onSelect }) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const isSelected = opt === selected;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            activeOpacity={0.8}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text
              style={[styles.chipText, isSelected && styles.chipTextSelected]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function PriceBox({ label, value, onChange }) {
  return (
    <View style={styles.priceBox}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={styles.priceValue}>৳{value || 0}</Text>
      {/* Two simple stepper buttons. Avoids bringing a numeric input keyboard up. */}
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => onChange(Math.max(0, (value || 0) - 100))}
        >
          <Text style={styles.stepperText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => onChange((value || 0) + 100)}
        >
          <Text style={styles.stepperText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  close: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textMuted,
    padding: SPACING.xs,
  },

  group: {
    marginBottom: SPACING.lg,
  },
  groupLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
  },
  chipTextSelected: {
    color: COLORS.textOnPrimary,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  priceLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginVertical: SPACING.xs,
  },
  priceDash: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.sm,
  },
  stepperRow: {
    flexDirection: 'row',
  },
  stepperBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  stepperText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  resetBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginRight: SPACING.md,
  },
  resetText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
});