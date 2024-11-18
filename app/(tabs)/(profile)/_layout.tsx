import React, {useCallback} from 'react';
import {Stack, useRouter} from 'expo-router';
import {useTheme} from '../../../dopebase';
import {Button} from 'tamagui';
import {LogOut} from '@tamagui/lucide-icons';
import {useAuth} from '../../../hooks/useAuth';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {logout} from '../../../redux/reducers/auth';

export default function ExploreLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const currentUser = useCurrentUser();

  const authManager = useAuth();

  const router = useRouter();

  const onLogout = useCallback(() => {
    logout();
    authManager.logout(currentUser);
    router.push('/(auth)/welcome');
  }, [currentUser]);

  return (
    <Stack initialRouteName='index'>
      <Stack.Screen
        name='index'
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: 'Profile',
          headerTitleStyle: {
            color: colorSet.primaryText,
          },
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
          headerRight: () => (
            <Button
              onPress={onLogout}
              chromeless
              icon={<LogOut size='$1' />}
              color={colorSet.primaryForeground}
              size='$4'
            />
          ),
        }}
      />
      <Stack.Screen
        name='kennel'
        options={{
          headerShown: true,
          title: 'Manage kennel',
          headerShadowVisible: false,
          headerTitleStyle: {
            color: colorSet.primaryText,
          },
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
        }}
      />

      <Stack.Screen
        name='breeds'
        options={{
          headerShown: true,
          title: 'Manage your breeds',
          headerShadowVisible: false,
          headerTitleStyle: {
            color: colorSet.primaryText,
          },
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
        }}
      />

      <Stack.Screen
        name='listings'
        options={{
          headerShown: true,
          title: 'Manage your listings',
          headerShadowVisible: false,
          headerTitleStyle: {
            color: colorSet.primaryText,
          },
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
        }}
      />

      <Stack.Screen
        name='litters'
        options={{
          headerShown: true,
          title: 'Manage your litters',
          headerShadowVisible: false,
          headerTitleStyle: {
            color: colorSet.primaryText,
          },
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
        }}
      />
      <Stack.Screen
        name='preferences'
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: 'Your preferences',
          headerTitleStyle: {
            color: colorSet.primaryText,
          },
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
        }}
      />

      <Stack.Screen
        name='edit'
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: 'Edit Profile',
          headerTitleStyle: {
            color: colorSet.primaryText,
          },
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
        }}
      />
    </Stack>
  );
}
