import { Tabs, useRouter } from 'expo-router';
import React, { useCallback } from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TouchableIcon, useTheme, useTranslations } from '../../dopebase';
import { View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import useCurrentUser from '../../hooks/useCurrentUser';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Home, Search, MessageSquare, User2 } from '@tamagui/lucide-icons'
export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const colorSet = theme.colors[appearance]

  const currentUser = useCurrentUser()
  const authManager = useAuth()

  const router = useRouter();

  const onLogout = useCallback(() => {
    authManager?.logout(currentUser)
    // navigation.reset({
    //   index: 0,
    //   routes: [
    //     {
    //       name: 'LoadScreen',
    //     },
    //   ],
    // })
    router.push('/')

  }, [currentUser])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorSet.primaryForeground,
        headerShown: true,

      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            // <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={24} />
            <Home color={focused ? colorSet.primaryForeground : '$gray9'} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            // <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} />
            <Search color={focused ? colorSet.primaryForeground : '$gray9'} />
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            // <TabBarIcon name={focused ? 'chatbox' : 'chatbox-outline'} color={color} />
            <MessageSquare color={focused ? colorSet.primaryForeground : '$gray9'} />
          ),
        }}
      />



      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            // <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
            <User2 color={focused ? colorSet.primaryForeground : '$gray9'} />
          ),
        }}
      />


    </Tabs>
  );
}
