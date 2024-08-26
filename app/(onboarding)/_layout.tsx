import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name='WelcomeScreen' options={{ headerShown: false }} />
      <Stack.Screen name='WalkthroughScreen' options={{ headerShown: false }} />
      <Stack.Screen name='DelayedLoginScreen' options={{ headerShown: false }} />
      <Stack.Screen name='LoginScreen' options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name='SmsAuthenticationScreen' options={{ title: 'Continue to Doghouse', headerShown: false }} />
      <Stack.Screen name='SignupScreen' options={{ title: 'Signup', headerShown: false }} />
      <Stack.Screen name='ResetPasswordScreen' options={{title: 'Reset Password', headerShown: false }} />
      <Stack.Screen name="role-selection" options={{ title: 'Select Role',  headerShown: false  }} />
      {/* <Stack.Screen name="breeder-profile-creation" options={{ title: 'Breeder Profile',  headerShown: false  }} />
      <Stack.Screen name="seeker-profile-creation" options={{ title: 'Seeker Profile',  headerShown: false  }} /> */}
    </Stack>
  );
}
