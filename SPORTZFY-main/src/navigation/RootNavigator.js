// Root navigator — gates the whole app on whether a user is signed in.
//
//   isAuthed === false           → AuthStack  (Login / Sign Up)
//   isAuthed === true + customer → MainStack  (Customer app)
//   isAuthed === true + owner    → OwnerStack (Turf Owner app)
//
// `key` on NavigationContainer is set to a string derived from
// auth state so React Navigation tears down + rebuilds the stack
// cleanly on login/logout (no stale screens lingering).
//
// To switch roles, the user signs out from Profile → bounces to Login →
// signs up / logs in again with the other role.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import OwnerStack from './OwnerStack';

export default function RootNavigator() {
  const { isAuthed, role } = useAuth();

  // Forces a fresh mount when auth state changes.
  const navKey = isAuthed ? `app-${role}` : 'auth';

  return (
    <NavigationContainer key={navKey}>
      {!isAuthed ? (
        <AuthStack />
      ) : role === 'owner' ? (
        <OwnerStack />
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
}
