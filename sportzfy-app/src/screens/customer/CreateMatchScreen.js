import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/PrimaryButton';
import { api } from '../../services/api';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../constants/theme';

const FORMATS = ['7v7', '5v5', '6v6'];
const ROLES = ['Goalkeeper', 'Striker', 'Midfielder', 'Defender', 'Any'];

export default function CreateMatchScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sportFormat, setSportFormat] = useState('7v7');
  const [requiredRole, setRequiredRole] = useState('Goalkeeper');
  const [totalSpots, setTotalSpots] = useState('14');
  const [openSpots, setOpenSpots] = useState('2');
  const [costPerPlayer, setCostPerPlayer] = useState('150');

  // Turf selection
  const [turfs, setTurfs] = useState([]);
  const [selectedTurfId, setSelectedTurfId] = useState(null);
  const [loadingTurfs, setLoadingTurfs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadTurfs() {
      try {
        const list = await api.getTurfs();
        setTurfs(list || []);
        if (list && list.length > 0) {
          setSelectedTurfId(list[0].id);
        }
      } catch (e) {
        console.warn('Could not load turfs for match creation:', e);
      } finally {
        setLoadingTurfs(false);
      }
    }
    loadTurfs();
  }, []);

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for this match challenge.');
      return;
    }
    if (!selectedTurfId) {
      Alert.alert('Required Field', 'Please select a turf ground.');
      return;
    }

    const tSpots = parseInt(totalSpots, 10);
    const oSpots = parseInt(openSpots, 10);
    const cost = parseInt(costPerPlayer, 10);

    if (isNaN(tSpots) || isNaN(oSpots) || oSpots <= 0 || oSpots > tSpots) {
      Alert.alert('Invalid Spots', 'Open spots must be at least 1 and not exceed total spots.');
      return;
    }

    setSubmitting(true);
    try {
      // Default match time: tomorrow evening at 8:00 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(20, 0, 0, 0);

      const turfObj = turfs.find((t) => t.id === selectedTurfId);

      const created = await api.createMatch({
        title: title.trim(),
        description: description.trim(),
        turfId: selectedTurfId,
        sportFormat,
        matchTime: tomorrow.toISOString(),
        area: turfObj?.area || 'Chattogram',
        totalSpots: tSpots,
        openSpots: oSpots,
        costPerPlayer: cost || 150,
        requiredRole,
      });

      Alert.alert('Match Hosted!', 'Your squad recruitment challenge is now live.', [
        {
          text: 'View Match',
          onPress: () => {
            navigation.replace('MatchDetails', { matchId: created?.id, match: created });
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Creation Failed', err.message || 'Could not host match.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host Match Squad</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Match Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Friday Night 7v7 Friendly"
            placeholderTextColor={COLORS.textPlaceholder}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Select Arena Pitch *</Text>
          {loadingTurfs ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.turfPills}
            >
              {turfs.map((t) => {
                const active = selectedTurfId === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.turfPill, active && styles.turfPillActive]}
                    onPress={() => setSelectedTurfId(t.id)}
                  >
                    <Ionicons
                      name="location-sharp"
                      size={12}
                      color={active ? COLORS.white : COLORS.textMuted}
                    />
                    <Text style={[styles.turfPillText, active && styles.turfPillTextActive]}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <Text style={styles.label}>Pitch Format</Text>
          <View style={styles.formatRow}>
            {FORMATS.map((fmt) => {
              const active = sportFormat === fmt;
              return (
                <TouchableOpacity
                  key={fmt}
                  style={[styles.formatBtn, active && styles.formatBtnActive]}
                  onPress={() => setSportFormat(fmt)}
                >
                  <Text style={[styles.formatBtnText, active && styles.formatBtnTextActive]}>
                    {fmt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Key Position Needed</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.turfPills}>
            {ROLES.map((r) => {
              const active = requiredRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.rolePill, active && styles.rolePillActive]}
                  onPress={() => setRequiredRole(r)}
                >
                  <Text style={[styles.rolePillText, active && styles.rolePillTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Spots & Pricing Row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <Text style={styles.label}>Total Spots</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={totalSpots}
                onChangeText={setTotalSpots}
              />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={styles.label}>Open Spots</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={openSpots}
                onChangeText={setOpenSpots}
              />
            </View>
          </View>

          <Text style={styles.label}>Cost Per Player (৳ BDT)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="150"
            placeholderTextColor={COLORS.textPlaceholder}
            value={costPerPlayer}
            onChangeText={setCostPerPlayer}
          />

          <Text style={styles.label}>Match Instructions / Notes</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
            placeholder="e.g. Please bring extra bibs and turf shoes."
            placeholderTextColor={COLORS.textPlaceholder}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <PrimaryButton
            title={submitting ? 'Hosting Match...' : 'Publish Challenge'}
            loading={submitting}
            onPress={handleSubmit}
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.md + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  label: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    ...SHADOWS.sm,
  },
  turfPills: {
    gap: SPACING.xs + 2,
    paddingVertical: 4,
  },
  turfPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  turfPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  turfPillText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  turfPillTextActive: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
  },
  formatRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  formatBtn: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formatBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  formatBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  formatBtnTextActive: {
    color: COLORS.white,
  },
  rolePill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rolePillActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  rolePillText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  rolePillTextActive: {
    color: '#92400E',
    fontWeight: FONT_WEIGHT.bold,
  },
  row: {
    flexDirection: 'row',
  },
});
