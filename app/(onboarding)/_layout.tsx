import {Stack} from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{headerShown: false, headerShadowVisible: false}}
      />
      <Stack.Screen
        name='(breeder)/index'
        options={{headerShown: true, headerShadowVisible: false}}
      />
      <Stack.Screen
        name='(seeker)/index'
        options={{headerShown: true, headerShadowVisible: false}}
      />
    </Stack>
  );
}
