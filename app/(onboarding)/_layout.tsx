import {Stack} from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{headerShown: false, headerShadowVisible: false}}
      />
      <Stack.Screen
        name='role'
        options={{headerShown: true, headerShadowVisible: false}}
      />
      <Stack.Screen
        name='breeder'
        options={{headerShown: true, headerShadowVisible: false}}
      />
      <Stack.Screen
        name='seeker'
        options={{headerShown: true, headerShadowVisible: false}}
      />
    </Stack>
  );
}
