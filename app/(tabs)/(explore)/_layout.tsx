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
          headerShown: true,
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
      <Stack.Screen
        name='[breedName]'
        options={{headerShown: true, title: 'Breed Details'}}
      />
    </Stack>
  );
}
