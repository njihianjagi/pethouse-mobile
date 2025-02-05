import React from 'react';
import {Stack} from 'expo-router';
import {useTheme} from '../../../../dopebase';

export default function BreedsLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack>
      <Stack.Screen
        name='[breed_name]'
        options={{
          // headerShown: false,
          title: 'Breed Details',
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
