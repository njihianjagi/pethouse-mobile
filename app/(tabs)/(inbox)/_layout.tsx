import React, {useCallback} from 'react';
import {Stack, useRouter} from 'expo-router';
import {useTheme} from '../../../dopebase';
import {Button} from 'tamagui';
import {Bell, LogOut} from '@tamagui/lucide-icons';
import {useAuth} from '../../../hooks/useAuth';
import useCurrentUser from '../../../hooks/useCurrentUser';

export default function ExploreLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  const currentUser = useCurrentUser();
  const authManager = useAuth();

  const router = useRouter();
  const onLogout = useCallback(() => {
    authManager?.logout(currentUser);
    router.push('/');
  }, [currentUser]);

  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerShown: true,
          title: 'Inbox',
          headerRight: () => (
            <Button
              onPress={() => {}}
              chromeless
              icon={<Bell size='$1' />}
              color={colorSet.primaryForeground}
              size='$4'
            />
          ),
        }}
      />
    </Stack>
  );
}
