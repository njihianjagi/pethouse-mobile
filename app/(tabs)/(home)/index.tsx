import React from 'react';
import {useTheme, useTranslations} from '../../../dopebase';
import useCurrentUser from '../../../hooks/useCurrentUser';
import {useRouter} from 'expo-router';
import {Button, Input, ScrollView, View, XGroup, YStack} from 'tamagui';
import {Search} from '@tamagui/lucide-icons';

export default function HomeScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <View backgroundColor={colorSet.primaryBackground} flex={1}>
      <ScrollView
        style={{flex: 1, backgroundColor: colorSet.primaryBackground}}
      >
        <YStack padding='$4' gap='$4'>
          <XGroup>
            <XGroup.Item>
              <Button
                chromeless
                icon={<Search size='$1' />}
                onPress={() => router.push('/(tabs)/explore')}
                pr='0'
                pl='$3'
                theme='active'
                themeShallow
                backgroundColor='$gray2'
                borderColor='$gray3'
                borderRightWidth={0}
                color='$gray10'
              />
            </XGroup.Item>
            <XGroup.Item>
              <Input
                f={1}
                placeholder='Search...'
                onFocus={() => router.push('/(tabs)/explore')}
                autoCapitalize='none'
                autoCorrect={false}
                borderLeftWidth={0}
              />
            </XGroup.Item>
          </XGroup>
        </YStack>
      </ScrollView>
    </View>
  );
}
