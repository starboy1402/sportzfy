import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/customer/HomeScreen';
import ExploreScreen from '../screens/customer/ExploreScreen';
import MatchesScreen from '../screens/customer/MatchesScreen';
import BookingsScreen from '../screens/customer/BookingsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { FloatingAiTrigger } from '../components/FloatingAiConcierge';
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

export default function BottomTabs() {
  return (
    <View style={styles.container}>
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
            letterSpacing: 0.2,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: tabIcon('home', 'home-outline'),
          }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            tabBarLabel: 'Explore',
            tabBarIcon: tabIcon('compass', 'compass-outline'),
          }}
        />
        <Tab.Screen
          name="Matches"
          component={MatchesScreen}
          options={{
            tabBarLabel: 'Squads',
            tabBarIcon: tabIcon('people', 'people-outline'),
          }}
        />
        <Tab.Screen
          name="Bookings"
          component={BookingsScreen}
          options={{
            tabBarLabel: 'Passes',
            tabBarIcon: tabIcon('ticket', 'ticket-outline'),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: tabIcon('person', 'person-outline'),
          }}
        />
      </Tab.Navigator>

      {/* Floating AI Concierge Pill (Sits proudly above bottom tabs) */}
      <FloatingAiTrigger bottomOffset={78} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activeTabIconContainer: {
    transform: [{ scale: 1.05 }],
  },
});
