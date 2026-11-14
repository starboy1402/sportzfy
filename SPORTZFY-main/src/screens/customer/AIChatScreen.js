import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../../services/api';
import {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../../constants/theme';

const SUGGESTED_PROMPTS = [
  'Find 7v7 football turfs in Chattogram',
  'How does 5-minute slot hold work?',
  'Cheap pitches under ৳1500',
  'Looking for open squad matches tonight',
];

export default function AIChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      role: 'assistant',
      text: "👋 Hi! I'm your Sportzfy AI Concierge. Ask me anything about turf availability, 5-minute atomic holds, pricing, or squad recruitment challenges!",
      suggestedPrompts: SUGGESTED_PROMPTS,
      cards: [],
    },
  ]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  async function handleSend(textToSend) {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await api.sendAiChat(query, history);

      const aiReply = res?.data?.reply || res?.reply || "I'm ready to help you find pitch slots or squad matches!";
      const cards = res?.data?.cards || res?.cards || [];
      const prompts = res?.data?.suggestedPrompts || res?.suggestedPrompts || [];

      const assistantMsg = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text: aiReply,
        cards,
        suggestedPrompts: prompts,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          role: 'assistant',
          text: 'Sorry, I am temporarily having trouble connecting. You can still browse turfs directly from the Explore tab!',
          cards: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCardPress(card) {
    if (card.type === 'TURF' && card.id) {
      navigation.navigate('TurfDetails', { turfId: card.id });
    } else if (card.type === 'MATCH' && card.id) {
      navigation.navigate('MatchDetails', { matchId: card.id });
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.aiBadge}>
            <Ionicons name="flash" size={12} color={COLORS.primary} />
            <Text style={styles.aiBadgeText}>SPORTZFY AI</Text>
          </View>
          <Text style={styles.headerSub}>Instant turf & match recommendations</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAi]}
              >
                {!isUser && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={14} color={COLORS.primary} />
                  </View>
                )}

                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                  <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAi]}>
                    {msg.text}
                  </Text>

                  {/* Interactive Action Cards */}
                  {msg.cards && msg.cards.length > 0 && (
                    <View style={styles.cardsWrap}>
                      {msg.cards.map((c, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.actionCard}
                          onPress={() => handleCardPress(c)}
                          activeOpacity={0.85}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>{c.title}</Text>
                            <Text style={styles.cardSub}>{c.subtitle || c.area}</Text>
                            {c.price ? (
                              <Text style={styles.cardPrice}>৳{c.price}/hr</Text>
                            ) : null}
                          </View>
                          <Ionicons name="arrow-forward-circle" size={26} color={COLORS.primary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Suggested Prompts */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <View style={styles.promptsRow}>
                      {msg.suggestedPrompts.map((p, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.promptChip}
                          onPress={() => handleSend(p)}
                        >
                          <Text style={styles.promptChipText}>{p}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={[styles.msgRow, styles.msgRowAi]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color={COLORS.primary} />
              </View>
              <View style={[styles.bubble, styles.bubbleAi, { paddingVertical: 12 }]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask about turfs, pricing, squad matches..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            disabled={!input.trim() || loading}
            onPress={() => handleSend()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitleWrap: {
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primaryTint,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: 8,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAi: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgText: {
    fontSize: FONT_SIZE.sm + 1,
    lineHeight: 21,
  },
  msgTextUser: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.medium,
  },
  msgTextAi: {
    color: COLORS.textPrimary,
  },
  cardsWrap: {
    marginTop: SPACING.sm,
    gap: 6,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryTint,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  cardSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  cardPrice: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginTop: 2,
  },
  promptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.sm + 4,
  },
  promptChip: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promptChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
  },
});
