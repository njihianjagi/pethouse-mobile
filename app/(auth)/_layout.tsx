import {Stack} from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{headerShown: false}} />
      <Stack.Screen name='welcome' options={{headerShown: false}} />
      <Stack.Screen name='walkthrough' options={{headerShown: false}} />
      <Stack.Screen name='delayed-login' options={{headerShown: false}} />
      <Stack.Screen
        name='login-phone'
        options={{title: 'Continue to Doghouse', headerShown: false}}
      />
      <Stack.Screen
        name='login-email'
        options={{title: 'Login', headerShown: false}}
      />
      <Stack.Screen
        name='signup-email'
        options={{title: 'Signup', headerShown: false}}
      />
      <Stack.Screen
        name='password-reset'
        options={{title: 'Reset Password', headerShown: false}}
      />
    </Stack>
  );
}
