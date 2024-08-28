import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name='WelcomeScreen' options={{ headerShown: false }} />
      <Stack.Screen name='WalkthroughScreen' options={{ headerShown: false }} />
      <Stack.Screen name='DelayedLoginScreen' options={{ headerShown: false }} />
      <Stack.Screen name='LoginScreen' options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name='SmsAuthenticationScreen' options={{ title: 'Continue to Doghouse', headerShown: false }} />
      <Stack.Screen name='SignupScreen' options={{ title: 'Signup', headerShown: false }} />
      <Stack.Screen name='ResetPasswordScreen' options={{title: 'Reset Password', headerShown: false }} />
    </Stack>
  );
}
