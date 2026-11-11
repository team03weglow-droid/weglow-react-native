import type { ExpoConfig } from 'expo/config';

import { parseEnvironment } from './src/app/bootstrap/environment.ts';

const { appEnvironment } = parseEnvironment({
  appEnvironment: process.env.EXPO_PUBLIC_APP_ENV,
});

// Provisional, isolated identifiers; store/legacy application IDs need approval.
const identifiers = {
  development: 'com.weglow.mobile.dev',
  staging: 'com.weglow.mobile.staging',
  production: 'com.weglow.mobile',
} as const;

const config: ExpoConfig = {
  name:
    appEnvironment === 'production' ? 'WeGlow' : `WeGlow (${appEnvironment})`,
  slug: 'weglow-mobile',
  version: '0.1.0',
  platforms: ['android', 'ios'],
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  scheme: `weglow-${appEnvironment}`,
  plugins: ['expo-dev-client', 'onnxruntime-react-native'],
  ios: {
    bundleIdentifier: identifiers[appEnvironment],
    supportsTablet: true,
  },
  android: {
    package: identifiers[appEnvironment],
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundColor: '#FFFFFF',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
  },
};

export default config;
