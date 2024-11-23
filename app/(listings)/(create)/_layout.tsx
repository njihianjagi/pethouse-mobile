import React from 'react';
import {Stack} from 'expo-router';
import {useTheme} from '../../../dopebase';

export default function CreateListingLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorSet.primaryBackground,
        },
      }}
    >
      {' '}
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='litter'
        options={{
          headerShown: true,
          title: 'New Litter Listing',
        }}
      />
      <Stack.Screen
        name='wanted'
        options={{
          headerShown: true,
          title: 'New Wanted Listing',
        }}
      />
      <Stack.Screen
        name='adoption'
        options={{
          headerShown: true,
          title: 'New Adoption Listing',
        }}
      />
    </Stack>
  );
}
