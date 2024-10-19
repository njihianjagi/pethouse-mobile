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
    router.push('/');
  }, [currentUser]);

  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerShown: true,
          title: 'Profile',
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
        }}
      />
      <Stack.Screen
        name='preferences'
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: 'Your preferences',
        }}
      />
    </Stack>
  );
}
