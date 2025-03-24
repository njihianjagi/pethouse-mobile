import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { MenuProvider } from 'react-native-popup-menu';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { Provider } from 'react-redux';
import { ConfigProvider, useConfig } from '../config';
import { TranslationProvider, DopebaseProvider, extendTheme } from '../dopebase';
import { AuthProvider } from '../hooks/useAuth';
import authManager from '../api/supabase/auth/supabaseAuthManager';
import translations from '../translations';
import configureStore from '../redux/store/dev';
import DoghouseTheme from '../theme';
import { TamaguiProvider, createTamagui } from 'tamagui'; // or 'tamagui'
import { config } from '@tamagui/config/v3';
import { SafeAreaView } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StoreProvider } from '../store/provider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const store = configureStore();

const tamaguiConfig = createTamagui(config);

// make TypeScript type everything based on your config
type Conf = typeof tamaguiConfig;
declare module '@tamagui/core' {
  // or 'tamagui'
  interface TamaguiCustomConfig extends Conf { }
}

export default function RootLayout() {
  const theme = extendTheme(DoghouseTheme);
  const colorScheme = useColorScheme();

  console.log('color scheme: ', colorScheme);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/Oswald-Regular.ttf'),
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3, // Default number of retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <StoreProvider>
            <ConfigProvider>
              <TranslationProvider translations={translations}>
                <DopebaseProvider theme={theme}>
                  <AuthProvider authManager={authManager}>
                    <MenuProvider>
                      <ActionSheetProvider>
                        <TamaguiProvider config={tamaguiConfig}>
                          <Stack
                            screenOptions={{
                              headerShown: false,
                            }}
                          >
                            <Stack.Screen
                              name='(auth)'
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name='(onboarding)'
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name='(tabs)'
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen name='+not-found' />
                          </Stack>
                        </TamaguiProvider>
                      </ActionSheetProvider>
                    </MenuProvider>
                  </AuthProvider>
                </DopebaseProvider>
              </TranslationProvider>
            </ConfigProvider>
          </StoreProvider>
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
