import React from 'react';
import {Stack} from 'expo-router';
import {Button} from 'tamagui';
import {Bell} from '@tamagui/lucide-icons';
import {useTheme} from '../../../dopebase';

export default function ExploreLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Explore',
          headerShown: true,
          headerShadowVisible: false,
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
      {/* Breeds routes */}
      <Stack.Screen
        name='breeds'
        options={{
          title: 'Breeds',
        }}
      />
      {/* Breeders routes */}
      <Stack.Screen
        name='breeders'
        options={{
          title: 'Breeders',
        }}
      />
      {/* Listings routes */}
      <Stack.Screen
        name='listings'
        options={{
          title: 'Listings',
        }}
      />
    </Stack>
  );
}
