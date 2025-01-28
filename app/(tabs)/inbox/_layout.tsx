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

  return (
    <Stack initialRouteName='index'>
      <Stack.Screen
        name='index'
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: 'Inbox',
          headerTitleStyle: {
            color: colorSet.primaryText,
          },
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
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
