import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ReplayHub',
  slug: 'replayhub-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/replayicon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  scheme: 'replayhub',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#050505',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.replayhub.app',
    infoPlist: {
      NSCameraUsageDescription: 'Upload avatars and assets directly from your camera.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.replayhub.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#050505',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    // @ts-expect-error - available at runtime, missing in Expo types
    windowSoftInputMode: 'adjustResize',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-secure-store'],
  extra: {
    eas: {
      projectId: '8f75734f-edbe-4ad0-9686-2e6599360081',
    },
    webAppUrl: process.env.EXPO_PUBLIC_WEB_APP_URL ?? 'https://app.replayhub.gg',
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://app.replayhub.gg/api',
  },
});
