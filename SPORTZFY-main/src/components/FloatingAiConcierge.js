import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAiChat } from '../context/AiChatContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

export function FloatingAiTrigger({ bottomOffset = 76 }) {
  const { openAi, isOpen } = useAiChat();

  if (isOpen) return null;

  return (
    <TouchableOpacity
      style={[styles.floatingButton, { bottom: bottomOffset }]}
      onPress={() => openAi()}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel="Open Sportzfy AI Concierge"
    >
      <View style={styles.floatingInner}>
        <View style={styles.sparkleWrap}>
          <Ionicons name="sparkles" size={18} color="#A7F3D0" />
          <View style={styles.pulseDot} />
        </View>
        <Text style={styles.floatingText}>Sportzfy AI</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FloatingAiConcierge() {
  const {
    isOpen,
    closeAi,
    messages,
    suggestedPrompts,
    loading,
    sendMessage,
    clearConversation,
  } = useAiChat();

  const navigation = useNavigation();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [isOpen, messages, loading]);

  const handleSend = (text) => {
    const query = text || inputText;
    if (!query.trim() || loading) return;
    setInputText('');
    sendMessage(query);
  };

  const handleCardPress = (card) => {
    closeAi();
    if (card.type === 'TURF') {
      navigation.navigate('TurfDetails', { turfId: card.id });
    } else if (card.type === 'MATCH') {
      navigation.navigate('MatchDetails', { matchId: card.id });
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closeAi}
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Semi-transparent dark dismiss area */}
        <TouchableOpacity
          style={styles.dismissOverlay}
          activeOpacity={1}
          onPress={closeAi}
        />

        {/* Slide-up Sheet */}
        <View style={styles.sheetContainer}>
          {/* Top Sheet Handle */}
          <View style={styles.handleBar}>
            <View style={styles.handlePill} />
          </View>

          {/* Concierge Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.botAvatarBadge}>
                <Ionicons name="hardware-chip" size={20} color={COLORS.field} />
              </View>
              <View style={styles.headerTextGroup}>
                <View style={styles.headerNameWithLive}>
                  <Text style={styles.headerTitle}>Sportzfy AI Concierge</Text>
                  <View style={styles.activeGreenDot} />
                </View>
                <Text style={styles.headerSubtitle}>
                  Live Slot & Matchmaking Assistant
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={clearConversation}
                style={styles.headerIconButton}
                accessibilityLabel="Clear conversation"
              >
                <Ionicons name="refresh-outline" size={20} color={COLORS.mint} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeAi}
                style={styles.headerIconButton}
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages Scroll Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContainer}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((item) => {
              const isUser = item.role === 'user';
              return (
                <View
                  key={item.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.messageRowUser : styles.messageRowBot,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.botMiniAvatar}>
                      <Ionicons name="sparkles" size={13} color={COLORS.field} />
                    </View>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isUser ? styles.userBubble : styles.botBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userMessageText : styles.botMessageText,
                      ]}
                    >
                      {item.content}
                    </Text>

                    {/* Action Cards (Turf or Match) */}
                    {item.actionCards && item.actionCards.length > 0 && (
                      <View style={styles.actionCardsList}>
                        {item.actionCards.map((card) => (
                          <TouchableOpacity
                            key={card.id}
                            style={styles.actionCard}
                            onPress={() => handleCardPress(card)}
                            activeOpacity={0.85}
                          >
                            {card.coverImage ? (
                              <Image
                                source={{ uri: card.coverImage }}
                                style={styles.actionCardImage}
                              />
                            ) : (
                              <View style={styles.actionCardPlaceholderImage}>
                                <Ionicons
                                  name={card.type === 'TURF' ? 'football' : 'people'}
                                  size={22}
                                  color={COLORS.forest}
                                />
                              </View>
                            )}

                            <View style={styles.actionCardBody}>
                              <View style={styles.actionCardBadgeRow}>
                                <View style={styles.actionCardTypeBadge}>
                                  <Text style={styles.actionCardTypeText}>
                                    {card.type === 'TURF' ? '🏟️ Turf' : '⚔️ Squad Match'}
                                  </Text>
                                </View>
                                {card.price !== undefined && (
                                  <Text style={styles.actionCardPrice}>
                                    ৳{card.price}
                                    <Text style={styles.actionCardHour}>/hr</Text>
                                  </Text>
                                )}
                              </View>

                              <Text style={styles.actionCardTitle} numberOfLines={1}>
                                {card.title}
                              </Text>

                              <Text style={styles.actionCardSubtitle} numberOfLines={1}>
                                {card.subtitle || `${card.area}, ${card.city}`}
                              </Text>

                              <View style={styles.actionCardFooter}>
                                <Text style={styles.actionCardCta}>
                                  {card.type === 'TURF'
                                    ? 'View Slots & Book'
                                    : 'View Squad'}
                                </Text>
                                <Ionicons
                                  name="arrow-forward"
                                  size={13}
                                  color={COLORS.field}
                                />
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    <Text
                      style={[
                        styles.timestampText,
                        isUser ? styles.userTimestamp : styles.botTimestamp,
                      ]}
                    >
                      {item.timestamp}
                    </Text>
                  </View>
                </View>
              );
            })}

            {loading && (
              <View style={[styles.messageRow, styles.messageRowBot]}>
                <View style={styles.botMiniAvatar}>
                  <Ionicons name="sparkles" size={13} color={COLORS.field} />
                </View>
                <View style={[styles.messageBubble, styles.botBubble, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color={COLORS.field} />
                  <Text style={styles.loadingText}>Searching venues & squads...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Suggested Prompts Carousel */}
          {suggestedPrompts && suggestedPrompts.length > 0 && !loading && (
            <View style={styles.promptsSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promptsContainer}
              >
                {suggestedPrompts.map((prompt, index) => (
                  <TouchableOpacity
                    key={`prompt-${index}`}
                    style={styles.promptChip}
                    onPress={() => handleSend(prompt)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.promptChipText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about turfs, squads, or hold rules..."
              placeholderTextColor={COLORS.textPlaceholder}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              editable={!loading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || loading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || loading}
              accessibilityLabel="Send message"
            >
              <Ionicons
                name="send"
                size={18}
                color={inputText.trim() ? COLORS.white : COLORS.textPlaceholder}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Floating Action Pill Button
  floatingButton: {
    position: 'absolute',
    right: 16,
    zIndex: 9999,
    ...SHADOWS.floating,
  },
  floatingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.forestDark,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: '#059669',
    gap: 8,
  },
  sparkleWrap: {
    position: 'relative',
  },
  pulseDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.field,
  },
  floatingText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.sm,
    letterSpacing: 0.3,
  },
  liveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: RADIUS.pill,
  },
  liveText: {
    color: '#6EE7B7',
    fontSize: 9,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: 0.6,
  },

  // Modal / Drawer
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 44, 34, 0.6)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  sheetContainer: {
    height: '84%',
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...SHADOWS.floating,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: COLORS.forestDark,
  },
  handlePill: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Sheet Header
  sheetHeader: {
    backgroundColor: COLORS.forestDark,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.2)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  botAvatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
  },
  headerNameWithLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  activeGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.field,
  },
  headerSubtitle: {
    color: '#A7F3D0',
    fontSize: FONT_SIZE.xs,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIconButton: {
    padding: 6,
  },

  // Messages Area
  messagesScroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  messageRow: {
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  botMiniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.field,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: COLORS.forest,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderBottomLeftRadius: 4,
    ...SHADOWS.sm,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  messageText: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.white,
  },
  botMessageText: {
    color: COLORS.textPrimary,
  },
  timestampText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTimestamp: {
    color: COLORS.textMuted,
  },

  // Action Cards
  actionCardsList: {
    marginTop: 8,
    gap: 8,
  },
  actionCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
    overflow: 'hidden',
    padding: 8,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionCardImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSubtle,
  },
  actionCardPlaceholderImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardBody: {
    flex: 1,
  },
  actionCardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  actionCardTypeBadge: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  actionCardTypeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.forest,
  },
  actionCardPrice: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.forest,
  },
  actionCardHour: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.textMuted,
  },
  actionCardTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  actionCardSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  actionCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  actionCardCta: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.field,
  },

  // Prompt Chips
  promptsSection: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
  },
  promptsContainer: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  promptChip: {
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.borderEmerald,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promptChipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.forest,
    fontWeight: FONT_WEIGHT.medium,
  },

  // Input Bar
  inputBar: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.field,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surfaceSubtle,
  },
});
