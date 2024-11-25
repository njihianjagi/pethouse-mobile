import {Stack} from 'expo-router';
import {useTheme} from '../../dopebase';

export default function OnboardingLayout() {
  const {theme, appearance} = useTheme();
  const colorSet = theme.colors[appearance];
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name='index'
        options={{headerShown: false, headerShadowVisible: false}}
      />
      <Stack.Screen
        name='(breeder)'
        options={{headerShown: false, headerShadowVisible: false}}
      />
      <Stack.Screen
        name='(seeker)'
        options={{headerShown: false, headerShadowVisible: false}}
      />
    </Stack>
  );
}
