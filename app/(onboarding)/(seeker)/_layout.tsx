import {Stack} from 'expo-router';
import {useTheme, useTranslations} from '../../../dopebase';

export default function SeekerOnboardingLayout() {
  const {localized} = useTranslations();
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitleStyle: {
          color: colorSet.primaryText,
        },
        headerStyle: {
          backgroundColor: colorSet.primaryBackground,
        },
        headerTintColor: colorSet.primaryText,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: localized('Welcome'),
        }}
      />
      <Stack.Screen
        name='housing'
        options={{
          title: localized('Housing'),
        }}
      />
      <Stack.Screen
        name='experience'
        options={{
          title: localized('Experience'),
        }}
      />
      <Stack.Screen
        name='breeds'
        options={{
          title: localized('Preferred Breeds'),
        }}
      />
    </Stack>
  );
}
