import React from 'react';
import {Stack} from 'expo-router';
import {useTheme} from '../../../../dopebase';

export default function ListingsLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='[id]'
        options={{
          title: 'Listing Details',
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
