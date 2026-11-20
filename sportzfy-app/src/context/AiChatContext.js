import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const INITIAL_PROMPTS = [
  '⚽ 7v7 Turfs in Chattogram',
  '🧤 Squads seeking a Goalkeeper',
  '💰 Off-peak discount rates',
  '⏱️ How does 5-min Hold work?',
];

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      "Assalamu Alaikum! ⚽ I'm your **Sportzfy AI Concierge**. I can find available turf slots, recommend open squads needing your position, or explain dynamic rates. What are you looking for today?",
    timestamp: 'Just now',
  },
];

const AiChatContext = createContext({
  isOpen: false,
  openAi: () => {},
  closeAi: () => {},
  toggleAi: () => {},
  messages: [],
  suggestedPrompts: [],
  loading: false,
  sendMessage: async () => {},
  clearConversation: () => {},
});

export function AiChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [suggestedPrompts, setSuggestedPrompts] = useState(INITIAL_PROMPTS);
  const [loading, setLoading] = useState(false);

  const openAi = useCallback((initialPrompt) => {
    setIsOpen(true);
    if (initialPrompt && typeof initialPrompt === 'string') {
      setTimeout(() => {
        handleSend(initialPrompt);
      }, 300);
    }
  }, []);

  const closeAi = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleAi = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content:
          'Conversation cleared! ⚽ How can I help you find pitches, squads, or booking rules?',
        timestamp: 'Just now',
      },
    ]);
    setSuggestedPrompts(INITIAL_PROMPTS);
  }, []);

  const handleSend = async (textToSend) => {
    const query = (textToSend || '').trim();
    if (!query || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.sendAiChat(query, messages);
      const data = response?.data;

      if (data && (data.reply || data.actionCards)) {
        const botMsg = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'Here are the matching options from Sportzfy:',
          actionCards: data.actionCards || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (data.suggestedPrompts && data.suggestedPrompts.length > 0) {
          setSuggestedPrompts(data.suggestedPrompts);
        }
      } else {
        throw new Error('No valid response from AI endpoint');
      }
    } catch (err) {
      console.warn('AI chat error:', err.message || err);
      // Friendly local fallback response matching the web
      const fallbackReply = query.toLowerCase().includes('hold')
        ? '⏱️ **5-Minute Slot Hold Lock:** When you tap any available pitch slot, it is locked exclusively for 5 minutes via atomic transactions so nobody else can take it while you finish paying.'
        : query.toLowerCase().includes('gk') || query.toLowerCase().includes('goalkeeper')
        ? '🧤 **Goalkeeper Recruitment:** Several 7v7 and 5v5 squads in Chattogram are actively searching for a Goalkeeper! Check out the **Matches** tab to see them all.'
        : "⚽ I've gathered available pitches in Chattogram! You can browse 7v7, 6v6, and 5v5 floodlit arenas on the **Explore** tab, or ask me for specific areas like Halishahar, Khulshi, or GEC.";

      setMessages((prev) => [
        ...prev,
        {
          id: `fallback_${Date.now()}`,
          role: 'assistant',
          content: fallbackReply,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AiChatContext.Provider
      value={{
        isOpen,
        openAi,
        closeAi,
        toggleAi,
        messages,
        suggestedPrompts,
        loading,
        sendMessage: handleSend,
        clearConversation,
      }}
    >
      {children}
    </AiChatContext.Provider>
  );
}

export function useAiChat() {
  return useContext(AiChatContext);
}
