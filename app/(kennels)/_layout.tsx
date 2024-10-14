import React from 'react';
import {Stack} from 'expo-router';
import {useTheme} from '../../dopebase';

export default function KennelsLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack>
      <Stack.Screen name='index' options={{headerShown: false}} />
      <Stack.Screen
        name='[id]'
        options={{
          headerShown: true,
          title: 'Breed Preferences',
          headerStyle: {
            backgroundColor: colorSet.primaryBackground,
          },
        }}
      />
    </Stack>
  );
}
