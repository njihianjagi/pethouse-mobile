import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../../dopebase';

export default function BreedersLayout() {
  const { theme, appearance } = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="[breederId]"
        options={{
          title: 'Breeder Profile',
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
