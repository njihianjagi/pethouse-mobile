import React from 'react';
import {Stack} from 'expo-router';
import {useTheme} from '../../../dopebase';

export default function ExploreLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack>
      <Stack.Screen name='index' options={{headerShown: false}} />
      <Stack.Screen name='kennel' options={{headerShown: false}} />
      <Stack.Screen name='preferences' options={{headerShown: false}} />
    </Stack>
  );
}
