import { ExpoConfig, ConfigContext } from 'expo/config';

// You can import your .env types if you have them defined
// import { z } from 'zod'; // If you want to add runtime validation

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: process.env.EXPO_PUBLIC_APP_NAME || 'Pethouse',
  slug: 'pethouse',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: process.env.EXPO_PUBLIC_APP_SCHEME || 'com.toruslabs.pethouse',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.IOS_BUNDLE_ID || 'com.toruslabs.pethouse',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE_NAME || 'com.toruslabs.pethouse',
    googleServicesFile: './google-services.json',
    userInterfaceStyle: 'automatic',
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
        },
      },
    ],
    '@react-native-google-signin/google-signin',
    './translucent-default-splash-screen-config',
  ],
  experiments: {
    typedRoutes: true,
  },
});
