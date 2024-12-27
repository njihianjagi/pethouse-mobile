import React from 'react';
import {Stack} from 'expo-router';
import {useTheme} from '../../../../dopebase';
import {useTranslations} from '../../../../dopebase';

export default function LitterListingLayout() {
  const {theme, appearance} = useTheme();
  const {localized} = useTranslations();
  const colorSet = theme.colors[appearance];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorSet.primaryBackground,
        },
        headerTintColor: colorSet.primaryText,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: localized('New Litter'),
        }}
      />
      <Stack.Screen
        name='basic-info'
        options={{
          title: localized('Basic Information'),
        }}
      />
      <Stack.Screen
        name='parents'
        options={{
          title: localized('Parent Information'),
        }}
      />
      <Stack.Screen
        name='pricing'
        options={{
          title: localized('Pricing & Registration'),
        }}
      />
      <Stack.Screen
        name='health'
        options={{
          title: localized('Health Testing'),
        }}
      />
      <Stack.Screen
        name='requirements'
        options={{
          title: localized('Requirements'),
        }}
      />
    </Stack>
  );
}
