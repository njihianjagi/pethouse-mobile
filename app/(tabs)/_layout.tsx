import {Tabs, useRouter} from 'expo-router';
import React, {useCallback} from 'react';

import {useColorScheme} from '@/hooks/useColorScheme';
import {useTheme, useTranslations} from '../../dopebase';
import {useAuth} from '../../hooks/useAuth';
import useCurrentUser from '../../hooks/useCurrentUser';
import {Home, Search, MessageSquare, User2} from '@tamagui/lucide-icons';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const currentUser = useCurrentUser();
  const authManager = useAuth();

  const router = useRouter();

  const onLogout = useCallback(() => {
    authManager?.logout(currentUser);
    // navigation.reset({
    //   index: 0,
    //   routes: [
    //     {
    //       name: 'LoadScreen',
    //     },
    //   ],
    // })
    router.push('/');
  }, [currentUser]);

  return (
    <Tabs
      initialRouteName='home' // Set the default tab to 'profile'
      screenOptions={{
        tabBarActiveTintColor: colorSet.primaryForeground,
        tabBarInactiveTintColor: colorSet.grey3,
        tabBarStyle: {
          backgroundColor: colorSet.primaryBackground,
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({color, focused}) => (
            <Home color={focused ? colorSet.primaryForeground : '$gray9'} />
          ),
        }}
      />

      <Tabs.Screen
        name='(explore)/explore'
        options={{
          title: 'Explore',
          tabBarIcon: ({color, focused}) => (
            <Search color={focused ? colorSet.primaryForeground : '$gray9'} />
          ),
        }}
      />

      <Tabs.Screen
        name='inbox'
        options={{
          title: 'Inbox',
          tabBarIcon: ({color, focused}) => (
            <MessageSquare
              color={focused ? colorSet.primaryForeground : '$gray9'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({color, focused}) => (
            <User2 color={focused ? colorSet.primaryForeground : '$gray9'} />
          ),
        }}
      />
    </Tabs>
  );
}
