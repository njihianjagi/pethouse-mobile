import React from 'react';
import {Stack} from 'expo-router';
import {useTheme} from '../../dopebase';

export default function ListingssLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack>
      <Stack.Screen name='index' options={{headerShown: false}} />
      <Stack.Screen
        name='[id]'
        options={{
          headerShown: true,
          title: 'View Listing',
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
        }}
      />
      <Stack.Screen
        name='create'
        options={{
          headerShown: true,
          title: 'Add New Listing',
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
        }}
      />
    </Stack>
  );
}
