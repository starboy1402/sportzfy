import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';
import MatchCard from '../../components/MatchCard';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useAiChat } from '../../context/AiChatContext';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../constants/theme';

const ROLE_FILTERS = ['All', 'Goalkeeper', 'Striker', 'Midfielder', 'Defender'];
const FORMAT_FILTERS = ['All', '7v7', '5v5'];

export default function MatchesScreen({ navigation }) {
  const { isAuthed } = useAuth();
  const { openAi } = useAiChat();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my'
  const [matches, setMatches] = useState([]);
  const [myHosting, setMyHosting] = useState([]);
  const [myJoined, setMyJoined] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'all') {
        const data = await api.getMatches({
          role: selectedRole,
          format: selectedFormat,
        });
        setMatches(data || []);
      } else {
        const myData = await api.getMyMatches();
        setMyHosting(myData.hosting || []);
        setMyJoined(myData.joined || []);
      }
    } catch (e) {
      console.warn('Could not load matches from backend:', e.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedRole, selectedFormat]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  function handleHostMatch() {
    if (!isAuthed) {
      navigation.navigate('AuthStack', { screen: 'Login' });
      return;
    }
    navigation.navigate('CreateMatch');
  }

  const displayedList = activeTab === 'all' ? matches : [...myHosting, ...myJoined];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Stadium Header with AI Trigger */}
      <Header onAiPress={() => openAi('🧤 Find matches seeking a Goalkeeper')}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>Squad Matchmaking</Text>
            <Text style={styles.headerSub}>Recruit players & join match lineups</Text>
          </View>
          <TouchableOpacity
            style={styles.hostHeaderBtn}
            onPress={handleHostMatch}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={16} color={COLORS.forestDark} />
            <Text style={styles.hostHeaderBtnText}>Create</Text>
          </TouchableOpacity>
        </View>
      </Header>

      {/* Main Container */}
      <View style={styles.container}>
        {/* Tab Switcher: All Matches vs My Squads */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="football-outline"
              size={15}
              color={activeTab === 'all' ? COLORS.forest : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              Open Matches
            </Text>
            {matches.length > 0 && activeTab === 'all' && (
              <View style={styles.tabCountBadge}>
                <Text style={styles.tabCountText}>{matches.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'my' && styles.tabBtnActive]}
            onPress={() => setActiveTab('my')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="people-outline"
              size={15}
              color={activeTab === 'my' ? COLORS.forest : COLORS.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
              My Squads
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills (Role & Format) — shown in 'all' tab */}
        {activeTab === 'all' && (
          <View style={styles.filtersWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScroll}
            >
              {FORMAT_FILTERS.map((fmt) => {
                const active = selectedFormat === fmt;
                return (
                  <TouchableOpacity
                    key={fmt}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setSelectedFormat(fmt)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {fmt === 'All' ? 'All Formats' : `${fmt} Pitch`}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.filterDivider} />

              {ROLE_FILTERS.map((r) => {
                const active = selectedRole === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setSelectedRole(r)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {r === 'All' ? 'All Roles' : r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Matches Feed */}
        <ScrollView
          style={styles.feed}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.field]}
              tintColor={COLORS.field}
            />
          }
        >
          {loading && !refreshing ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={COLORS.field} />
              <Text style={styles.loadingText}>Loading squad matches...</Text>
            </View>
          ) : displayedList.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="trophy-outline" size={36} color={COLORS.forest} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'all'
                  ? 'No open matches match your filters'
                  : 'You have not hosted or joined any squads yet'}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === 'all'
                  ? 'Be the captain! Create an open match challenge and recruit players across Chattogram.'
                  : 'Browse open games above or create your own challenge post.'}
              </Text>
              <TouchableOpacity style={styles.emptyActionBtn} onPress={handleHostMatch}>
                <Text style={styles.emptyActionBtnText}>Create Match Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            displayedList.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                onPress={() => navigation.navigate('MatchDetails', { matchId: m.id, match: m })}
              />
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: FONT_SIZE.xs,
    color: '#A7F3D0',
    marginTop: 1,
  },
  hostHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    gap: 3,
  },
  hostHeaderBtnText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forestDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.mint,
    borderWidth: 1.5,
    borderColor: COLORS.field,
  },
  tabText: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.forest,
    fontWeight: FONT_WEIGHT.black,
  },
  tabCountBadge: {
    backgroundColor: COLORS.field,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.pill,
  },
  tabCountText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  filtersWrapper: {
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersScroll: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.forest,
    borderColor: COLORS.forest,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  centerLoading: {
    paddingVertical: SPACING.xxxl,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyActionBtn: {
    backgroundColor: COLORS.field,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  emptyActionBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
  },
});
