import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerTurfScreen from '../screens/owner/OwnerTurfScreen';
import OwnerBookingsScreen from '../screens/owner/OwnerBookingsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { COLORS, FONT_WEIGHT, SHADOWS } from '../constants/theme';

const Tab = createBottomTabNavigator();

function tabIcon(activeName, inactiveName) {
  return ({ focused, color, size }) => (
    <View style={focused ? styles.activeTabIconContainer : null}>
      <Ionicons
        name={focused ? activeName : inactiveName}
        size={focused ? 23 : 21}
        color={color}
      />
    </View>
  );
}

export default function OwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.field,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.cardBorder,
          borderTopWidth: 1,
          height: 66,
          paddingBottom: 10,
          paddingTop: 8,
          ...SHADOWS.md,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: FONT_WEIGHT.bold,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={OwnerDashboardScreen}
        options={{
          tabBarLabel: 'Overview',
          tabBarIcon: tabIcon('speedometer', 'speedometer-outline'),
        }}
      />
      <Tab.Screen
        name="Turf"
        component={OwnerTurfScreen}
        options={{
          tabBarLabel: 'My Pitches',
          tabBarIcon: tabIcon('football', 'football-outline'),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={OwnerBookingsScreen}
        options={{
          tabBarLabel: 'Check-In',
          tabBarIcon: tabIcon('qr-code', 'qr-code-outline'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: tabIcon('person', 'person-outline'),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  activeTabIconContainer: {
    transform: [{ scale: 1.05 }],
  },
});
