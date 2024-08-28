import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name='RoleSelectionScreen' options={{ headerShown: false }} />
      <Stack.Screen name='BreederProfileScreen' options={{ headerShown: false }} />
    </Stack>
  );
}
