import React from 'react';
import { useTheme } from '../../../../dopebase';
import {
  Text,
  YStack,
} from 'tamagui';

export default function ListingsScreen() {
  const { theme, appearance } = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <YStack f={1} backgroundColor={colorSet.primaryBackground} p="$4">
      <Text>Listings section coming soon!</Text>
    </YStack>
  );
}
