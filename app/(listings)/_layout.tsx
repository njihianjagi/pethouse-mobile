import React from 'react';
import {Stack} from 'expo-router';
import {useTheme} from '../../dopebase';

export default function ListingsLayout() {
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
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='[id]'
        options={{
          headerShown: true,
          title: 'View Listing',
        }}
      />
      <Stack.Screen
        name='(create)'
        options={{
          headerShown: false,
          title: 'Create Listing',
        }}
      />
    </Stack>
  );
}
