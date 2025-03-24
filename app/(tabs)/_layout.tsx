import { Tabs, useRouter } from 'expo-router';
import React, { useCallback } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme, useTranslations } from '../../dopebase';
import { useAuth } from '../../hooks/useAuth';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  Home,
  Search,
  MessageSquare,
  User2,
  LogOut,
  Bell,
} from '@tamagui/lucide-icons';
import { Button } from 'tamagui';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { localized } = useTranslations();
  const { theme, appearance } = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Tabs
      initialRouteName='(home)'
      screenOptions={{
        tabBarActiveTintColor: colorSet.primaryForeground,
        tabBarInactiveTintColor: colorSet.secondaryText,
        tabBarStyle: {
          backgroundColor: colorSet.primaryBackground,
        },
      }}
    >
      <Tabs.Screen
        name='(home)'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home color={focused ? colorSet.primaryForeground : '$gray9'} />
          ),

          headerShown: false,
          lazy: true,
        }}
      />

      <Tabs.Screen
        name='explore'
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Search color={focused ? colorSet.primaryForeground : '$gray9'} />
          ),

          headerShown: false,
          lazy: true,
        }}
      />

      <Tabs.Screen
        name='inbox'
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <MessageSquare
              color={focused ? colorSet.primaryForeground : '$gray9'}
            />
          ),

          headerShown: false,
          lazy: true,
        }}
      />

      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User2 color={focused ? colorSet.primaryForeground : '$gray9'} />
          ),

          headerShown: false,
          lazy: true,
        }}
      />
    </Tabs>
  );
}
