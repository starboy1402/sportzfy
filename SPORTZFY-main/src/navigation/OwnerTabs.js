// Bottom-tabs navigator for the owner app.
// 3 tabs: Dashboard / Turf / Bookings.
// Owner-specific styling mirrors the customer BottomTabs.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerTurfScreen from '../screens/owner/OwnerTurfScreen';
import OwnerBookingsScreen from '../screens/owner/OwnerBookingsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

const Tab = createBottomTabNavigator();

function tabIcon(name) {
  return ({ color, size }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

export default function OwnerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xs,
          fontWeight: FONT_WEIGHT.medium,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={OwnerDashboardScreen}
        options={{ tabBarIcon: tabIcon('grid-outline') }}
      />
      <Tab.Screen
        name="Turf"
        component={OwnerTurfScreen}
        options={{ tabBarIcon: tabIcon('football-outline') }}
      />
      <Tab.Screen
        name="Bookings"
        component={OwnerBookingsScreen}
        options={{ tabBarIcon: tabIcon('calendar-outline') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('person-outline') }}
      />
    </Tab.Navigator>
  );
}
