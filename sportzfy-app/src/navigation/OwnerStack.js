// OwnerStack — wraps OwnerTabs in a native-stack so we can push
// future modals/details on top later (without disturbing the tab bar).
// Header is hidden because each owner screen renders its own top bar.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OwnerTabs from './OwnerTabs';

const Stack = createNativeStackNavigator();

export default function OwnerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
    </Stack.Navigator>
  );
}
