import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/PrimaryButton';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../constants/theme';

const ROLES = ['Any Role', 'Goalkeeper', 'Striker', 'Midfielder', 'Defender'];

export default function MatchDetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { matchId, match: initialMatch } = route.params || {};
  const { user, isAuthed } = useAuth();

  const [match, setMatch] = useState(initialMatch || null);
  const [loading, setLoading] = useState(!initialMatch);
  const [joining, setJoining] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Striker');

  const loadDetail = useCallback(async () => {
    if (!matchId) return;
    try {
      const data = await api.getMatchById(matchId);
      if (data) setMatch(data);
    } catch (e) {
      console.warn('Could not load match detail:', e.message);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const isHost = user && match?.hostUser && user.id === match.hostUser.id;
  const userRequest = user && match?.joinRequests?.find((r) => r.user?.id === user.id);

  async function handleSendJoinRequest() {
    if (!isAuthed) {
      setShowRoleModal(false);
      navigation.navigate('AuthStack', { screen: 'Login' });
      return;
    }

    setJoining(true);
    try {
      await api.joinMatch(match.id, selectedRole);
      setShowRoleModal(false);
      Alert.alert('Request Sent', `Your request to join as ${selectedRole} has been sent to the captain.`);
      await loadDetail();
    } catch (err) {
      Alert.alert('Join Notice', err.message || 'Could not send join request.');
    } finally {
      setJoining(false);
    }
  }

  async function handleDecision(requestId, decision) {
    try {
      await api.decideJoinRequest(match.id, requestId, decision);
      Alert.alert('Updated', `Player request ${decision.toLowerCase()}ed.`);
      await loadDetail();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update request.');
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textMuted }}>Loading match details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Match not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const acceptedPlayers = (match.joinRequests || []).filter((r) => r.status === 'ACCEPTED');
  const pendingRequests = (match.joinRequests || []).filter((r) => r.status === 'PENDING');
  const openSpots = match.openSpots ?? (match.totalSpots ? match.totalSpots - acceptedPlayers.length : 1);
  const cost = match.costPerPlayer || 150;

  return (
    <View style={styles.root}>
      {/* Top App Bar with back */}
      <View style={[styles.appBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle} numberOfLines={1}>Squad Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Match Header Card */}
        <View style={styles.card}>
          <View style={styles.formatRow}>
            <View style={styles.formatBadge}>
              <Ionicons name="football" size={13} color={COLORS.white} />
              <Text style={styles.formatText}>{match.sportFormat || '7v7'} Football</Text>
            </View>
            <View style={styles.spotsBadge}>
              <Text style={styles.spotsBadgeText}>{openSpots} spots left</Text>
            </View>
          </View>

          <Text style={styles.title}>{match.title}</Text>
          {match.description ? (
            <Text style={styles.description}>{match.description}</Text>
          ) : null}

          <View style={styles.divider} />

          {/* Schedule & Price Row */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              <View>
                <Text style={styles.metaLabel}>Match Time</Text>
                <Text style={styles.metaValue}>
                  {new Date(match.matchTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={16} color={COLORS.primary} />
              <View>
                <Text style={styles.metaLabel}>Player Share</Text>
                <Text style={styles.metaValue}>৳{cost} / player</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Turf Pitch Venue Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Arena Location</Text>
          <View style={styles.turfRow}>
            <Image
              source={{
                uri:
                  match.turf?.coverImage ||
                  'https://images.unsplash.com/photo-1529900245534-47fbf02a44dd?auto=format&fit=crop&w=400&q=80',
              }}
              style={styles.turfThumb}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.turfName}>{match.turf?.name || 'Local Turf Arena'}</Text>
              <Text style={styles.turfLocation}>{match.turf?.area || match.area}, {match.turf?.city || 'Chattogram'}</Text>
              {match.turf?.id && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('TurfDetails', { turfId: match.turf.id })}
                  style={{ marginTop: 4 }}
                >
                  <Text style={styles.viewTurfLink}>View Pitch Details →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Host & Squad Roster */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Squad Roster</Text>

          {/* Captain */}
          <View style={styles.playerRow}>
            <View style={styles.captainAvatar}>
              <Text style={styles.captainAvatarText}>{match.hostUser?.name?.[0] || 'C'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.playerName}>{match.hostUser?.name || 'Captain'}</Text>
              <Text style={styles.playerRole}>Host Captain</Text>
            </View>
            <View style={styles.captainBadge}>
              <Text style={styles.captainBadgeText}>CAPTAIN</Text>
            </View>
          </View>

          {/* Accepted Teammates */}
          {acceptedPlayers.map((req) => (
            <View key={req.id} style={styles.playerRow}>
              <View style={styles.playerAvatar}>
                <Text style={styles.playerAvatarText}>{req.user?.name?.[0] || 'P'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerName}>{req.user?.name || 'Player'}</Text>
                <Text style={styles.playerRole}>{req.preferredRole || 'Player'}</Text>
              </View>
              <View style={styles.acceptedBadge}>
                <Ionicons name="checkmark-circle" size={13} color={COLORS.primary} />
                <Text style={styles.acceptedBadgeText}>Confirmed</Text>
              </View>
            </View>
          ))}
        </View>

        {/* If Host: Show Pending Join Requests */}
        {isHost && pendingRequests.length > 0 && (
          <View style={[styles.card, { borderColor: '#FCD34D' }]}>
            <Text style={[styles.sectionTitle, { color: '#B45309' }]}>
              Pending Join Requests ({pendingRequests.length})
            </Text>

            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.playerName}>{req.user?.name || 'Player'}</Text>
                  <Text style={styles.playerRole}>Applied as: <Text style={{ fontWeight: 'bold' }}>{req.preferredRole}</Text></Text>
                  {req.user?.phone ? <Text style={styles.phoneText}>📞 {req.user.phone}</Text> : null}
                </View>

                <View style={styles.decisionBtns}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleDecision(req.id, 'ACCEPT')}
                  >
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleDecision(req.id, 'REJECT')}
                  >
                    <Ionicons name="close" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      {!isHost && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bottomPriceLabel}>Contribution</Text>
            <Text style={styles.bottomPriceAmount}>৳{cost} <Text style={{ fontSize: 11, color: COLORS.textMuted }}>/ player</Text></Text>
          </View>

          <View style={{ flex: 1.4 }}>
            {userRequest ? (
              <View style={[styles.statusBanner, userRequest.status === 'ACCEPTED' ? styles.statusConfirmed : styles.statusPending]}>
                <Ionicons
                  name={userRequest.status === 'ACCEPTED' ? 'checkmark-circle' : 'time-outline'}
                  size={16}
                  color={userRequest.status === 'ACCEPTED' ? COLORS.primary : '#B45309'}
                />
                <Text style={styles.statusBannerText}>
                  {userRequest.status === 'ACCEPTED' ? 'Joined Squad' : 'Request Pending'}
                </Text>
              </View>
            ) : (
              <PrimaryButton
                title={openSpots <= 0 ? 'Squad Full' : 'Request to Join'}
                disabled={openSpots <= 0}
                onPress={() => setShowRoleModal(true)}
              />
            )}
          </View>
        </View>
      )}

      {/* Role Picker Modal */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose Preferred Role</Text>
            <Text style={styles.modalSub}>What position do you want to play in this match?</Text>

            {ROLES.map((role) => {
              const active = selectedRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleOption, active && styles.roleOptionActive]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text style={[styles.roleOptionText, active && styles.roleOptionTextActive]}>
                    {role}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}

            <PrimaryButton
              title={joining ? 'Sending...' : 'Confirm & Request Join'}
              loading={joining}
              onPress={handleSendJoinRequest}
              style={{ marginTop: SPACING.md }}
            />

            <TouchableOpacity
              onPress={() => setShowRoleModal(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
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
  appBarTitle: {
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
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  formatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    gap: 5,
  },
  formatText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  spotsBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primaryTint,
  },
  spotsBadgeText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  title: {
    fontSize: FONT_SIZE.lg + 1,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  turfRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  turfThumb: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    backgroundColor: COLORS.surfaceSubtle,
  },
  turfName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  turfLocation: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  viewTurfLink: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 10,
  },
  captainAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captainAvatarText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.black,
    fontSize: FONT_SIZE.sm,
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarText: {
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.sm,
  },
  playerName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  playerRole: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  phoneText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  captainBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  captainBadgeText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    color: '#B45309',
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  acceptedBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  decisionBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.lg,
  },
  bottomPriceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  bottomPriceAmount: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.primary,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: 6,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusConfirmed: {
    backgroundColor: COLORS.primarySurface,
  },
  statusBannerText: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  roleOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
  },
  roleOptionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
  },
  roleOptionTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
  },
});
