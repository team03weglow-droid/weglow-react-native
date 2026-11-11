import { DefaultTheme } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';

// Neutral initialization styling only; replace with approved Figma tokens later.
export const theme = {
  colors: { background: '#FFFFFF', text: '#171717' },
  spacing: { screen: 24 },
} as const;

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    text: theme.colors.text,
  },
};
