import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { BookingProvider } from './src/context/BookingContext';
import { AiChatProvider } from './src/context/AiChatContext';
import { COLORS } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.forestDark} />
      <AuthProvider>
        <BookingProvider>
          <AiChatProvider>
            <RootNavigator />
          </AiChatProvider>
        </BookingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
