import React from 'react';
import {Stack} from 'expo-router';
import {Button} from 'tamagui';
import {Bell} from '@tamagui/lucide-icons';
import {useTheme} from '../../../dopebase';

export default function ExploreLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack
      screenOptions={{
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
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Explore',
        }}
      />
      {/* Breeds routes */}
      <Stack.Screen
        name='breeds/index'
        options={{
          title: 'Breeds',
        }}
      />
      <Stack.Screen
        name='breeds/[name]'
        options={{
          title: 'Breed Details',
          // headerTitle: ({params}) => params?.name || 'Breed Details',
        }}
      />
      {/* Breeders routes */}
      <Stack.Screen
        name='breeders/index'
        options={{
          title: 'Breeders',
        }}
      />
      <Stack.Screen
        name='breeders/[id]'
        options={{
          title: 'Breeder Profile',
        }}
      />
      {/* Listings routes */}
      <Stack.Screen
        name='listings/index'
        options={{
          title: 'Listings',
        }}
      />
      <Stack.Screen
        name='listings/[id]'
        options={{
          title: 'Listing Details',
        }}
      />
    </Stack>
  );
}
