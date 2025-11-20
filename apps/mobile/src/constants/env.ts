import Constants from 'expo-constants';

interface ExtraConfig {
  webAppUrl?: string;
  apiUrl?: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

export const WEB_APP_URL =
  extra.webAppUrl ?? process.env.EXPO_PUBLIC_WEB_APP_URL ?? 'https://app.replayhub.gg';
export const API_URL =
  extra.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? 'https://app.replayhub.gg/api';
