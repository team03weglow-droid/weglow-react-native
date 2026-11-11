import { parseEnvironment } from './environment';

// Static property access is required for Expo's public environment inlining.
export const environment = parseEnvironment({
  appEnvironment: process.env.EXPO_PUBLIC_APP_ENV,
});
