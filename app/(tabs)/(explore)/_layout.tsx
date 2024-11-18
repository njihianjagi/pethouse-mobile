import React from 'react';
import {Stack} from 'expo-router';
import {Button} from 'tamagui';
import {Bell} from '@tamagui/lucide-icons';
import {useTheme} from '../../../dopebase';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function ExploreLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack initialRouteName='index'>
      <Stack.Screen
        name='index'
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: 'Explore Breeds',
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
      />
      <Stack.Screen
        name='[breed_name]'
        options={{
          headerShown: true,
          headerShadowVisible: false,
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
