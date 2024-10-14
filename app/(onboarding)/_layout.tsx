import {Stack} from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{headerShown: false}} />
      <Stack.Screen name='role' options={{headerShown: false}} />
      <Stack.Screen name='breeder' options={{headerShown: false}} />
      <Stack.Screen name='seeker' options={{headerShown: false}} />
    </Stack>
  );
}
