// Stack navigator used INSIDE the customer tab flow.
// Hosts Turf Details, Booking, Matchmaking, and the global Floating AI Concierge.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';
import TurfDetailsScreen from '../screens/customer/TurfDetailsScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import MatchDetailsScreen from '../screens/customer/MatchDetailsScreen';
import CreateMatchScreen from '../screens/customer/CreateMatchScreen';
import FloatingAiConcierge from '../components/FloatingAiConcierge';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.forest },
          headerTintColor: COLORS.textOnPrimary,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TurfDetails"
          component={TurfDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{
            title: 'Checkout & 5-Min Hold',
            headerBackTitle: 'Pitch',
          }}
        />
        <Stack.Screen
          name="MatchDetails"
          component={MatchDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateMatch"
          component={CreateMatchScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>

      {/* Global Floating AI Concierge Modal */}
      <FloatingAiConcierge />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
