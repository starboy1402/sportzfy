import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/customer/HomeScreen';
import ExploreScreen from '../screens/customer/ExploreScreen';
import BookingsScreen from '../screens/customer/BookingsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';

const Tab = createBottomTabNavigator();

function tabIcon(name) {
  return ({ color, size }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

export default function BottomTabs() {
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
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: tabIcon('home-outline') }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarIcon: tabIcon('search-outline') }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
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
