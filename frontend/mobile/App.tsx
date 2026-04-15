/**
 * PSL Pulse Mobile App
 * React Native implementation for iOS/Android
 * Integrated with WireFluid testnet & custodial wallet backend
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast';
import { WireFluidProvider, useWireFluid } from './context/WireFluidContext';
import { AuthScreen } from './screens/Auth';
import { BrowseScreen } from './screens/Browse';
import { DonateScreen } from './screens/Donate';
import { TipScreen } from './screens/Tip';
import { ProfileScreen } from './screens/Profile';
import { TransactionScreen } from './screens/Transactions';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Authentication Stack
 * Handles login, signup, MetaMask connection
 */
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="AuthMain" component={AuthScreen} />
    </Stack.Navigator>
  );
}

/**
 * App Stack
 * Main navigation after authentication
 */
function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ec4899',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: '#1f2937',
          borderTopWidth: 1,
          paddingBottom: 5,
        },
      }}
    >
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎫</Text>,
        }}
      />
      <Tab.Screen
        name="Donate"
        component={DonateScreen}
        options={{
          tabBarLabel: 'Donate',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💝</Text>,
        }}
      />
      <Tab.Screen
        name="Tip"
        component={TipScreen}
        options={{
          tabBarLabel: 'Tip',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>❤️</Text>,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root Navigator
 * Handles authentication state and routing
 */
function RootNavigator() {
  const { isAuthenticated, isInitializing } = useWireFluid();

  if (isInitializing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Loading PSL Pulse...</Text>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

/**
 * Main App Component
 */
export default function App(): React.ReactElement {
  return (
    <WireFluidProvider>
      <RootNavigator />
    </WireFluidProvider>
  );
}
