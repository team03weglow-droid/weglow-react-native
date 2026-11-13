import { useFonts } from 'expo-font';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily, welcomeFonts } from '../../../shared/theme/fonts';
import { Screen } from '../../../shared/ui/Screen';

// Final design 1779:73. Keep the blank hero slot: no approved hero artwork exists.
const colors = {
  ink: '#111111',
  wordmark: '#262626',
  eyebrow: '#666F7A',
  body: '#59626E',
  disclaimer: '#8A94A0',
  white: '#FFFFFF',
};

function showExplorePreviewNotice() {
  Alert.alert(
    'Development preview',
    '“Explore before setup” is not connected yet. This preview stays on the Welcome screen.',
    [{ text: 'OK' }],
  );
}

export function WelcomeScreen({ onBeginSetup }: { onBeginSetup: () => void }) {
  const [fontAttempt, setFontAttempt] = useState(0);
  return (
    <WelcomeContent
      key={fontAttempt}
      onBeginSetup={onBeginSetup}
      onRetryFonts={() => setFontAttempt((attempt) => attempt + 1)}
    />
  );
}

function WelcomeContent({
  onRetryFonts,
  onBeginSetup,
}: {
  onRetryFonts: () => void;
  onBeginSetup: () => void;
}) {
  const [fontsLoaded, fontError] = useFonts(welcomeFonts);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  if (!fontsLoaded) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.fontState}>
          {fontError ? (
            <>
              <Text accessibilityRole="alert" style={styles.fontError}>
                We couldn’t load the Welcome fonts.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry loading Welcome fonts"
                onPress={onRetryFonts}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator
              color={colors.ink}
              accessibilityLabel="Loading Welcome"
            />
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={styles.background}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.layout,
            { minHeight: Math.max(640, height - insets.top - insets.bottom) },
          ]}
        >
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="WeGlow"
            style={styles.brand}
          >
            <View style={styles.brandBadge}>
              <Text allowFontScaling={false} style={styles.brandInitial}>
                A
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.wordmark}>
              weglow
            </Text>
          </View>

          <View
            pointerEvents="none"
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={styles.heroSpace}
          />

          <View style={styles.content}>
            <Text style={styles.eyebrow}>A CALM RITUAL, MADE PERSONAL</Text>
            <View
              accessible
              accessibilityRole="header"
              accessibilityLabel="Understand your skin. Care for it gently."
              style={styles.headline}
            >
              <Text style={styles.headlineFirst}>Understand your skin.</Text>
              <Text style={styles.headlineItalic}>Care for it gently.</Text>
            </View>
            <Text style={styles.description}>
              A guided skincare platform for clearer routines and thoughtful
              progress.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Begin setup"
              accessibilityHint="Opens the adult confirmation step."
              onPress={onBeginSetup}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryText}>Begin setup</Text>
              <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={styles.chevronSlot}
              >
                <View style={styles.chevron} />
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Explore before setup"
              accessibilityHint="Shows a development notice. Guest exploration is not connected yet."
              onPress={showExplorePreviewNotice}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryText}>Explore before setup</Text>
            </Pressable>
            <Text style={styles.disclaimer}>
              Provided for general reference only. Not medical advice or live
              analysis.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    experimental_backgroundImage: [
      {
        type: 'radial-gradient',
        shape: 'circle',
        size: { x: 721.22, y: 721.22 },
        position: { left: '65%', top: '20%' },
        colorStops: [
          { color: '#E0EFF7', positions: ['0%'] },
          { color: '#EDF4F9', positions: ['45%'] },
          { color: '#F6FAFC', positions: ['75%'] },
          { color: '#FFFFFF', positions: ['100%'] },
        ],
      },
    ],
  },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  layout: {
    width: '100%',
    maxWidth: 400,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  brandBadge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitial: {
    fontFamily: fontFamily.editorialItalic,
    fontSize: 16,
    lineHeight: 20,
    color: colors.white,
    includeFontPadding: false,
  },
  wordmark: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.wordmark,
    includeFontPadding: false,
  },
  heroSpace: { height: 232 },
  content: { paddingHorizontal: 28, paddingBottom: 32 },
  eyebrow: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1.8,
    color: colors.eyebrow,
    marginBottom: 8,
    includeFontPadding: false,
  },
  headline: { marginBottom: 12 },
  headlineFirst: {
    fontFamily: fontFamily.regular,
    fontSize: 31,
    lineHeight: 36.58,
    letterSpacing: -0.465,
    color: colors.ink,
    includeFontPadding: false,
  },
  headlineItalic: {
    fontFamily: fontFamily.editorialItalic,
    fontSize: 36,
    lineHeight: 42.48,
    letterSpacing: -0.9,
    color: colors.ink,
    includeFontPadding: false,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 13.5,
    lineHeight: 19.58,
    color: colors.body,
    maxWidth: 310,
    marginBottom: 31,
    includeFontPadding: false,
  },
  primaryButton: {
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 4,
        blurRadius: 6,
        spreadDistance: -1,
        color: '#0000001A',
      },
      {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 4,
        spreadDistance: -2,
        color: '#0000001A',
      },
    ],
  },
  primaryText: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
    textAlign: 'center',
    flexShrink: 1,
    includeFontPadding: false,
  },
  chevronSlot: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Authorized fallback for the unavailable 1779:114 SVG, in its 16-square slot.
  chevron: {
    width: 6,
    height: 6,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: colors.white,
    transform: [{ rotate: '45deg' }],
  },
  secondaryButton: {
    minHeight: 44,
    marginTop: 3,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  secondaryText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.ink,
    textDecorationLine: 'underline',
    textAlign: 'center',
    includeFontPadding: false,
  },
  disclaimer: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 12.5,
    color: colors.disclaimer,
    textAlign: 'center',
    marginTop: 24,
    includeFontPadding: false,
  },
  pressed: { opacity: 0.75 },
  fontState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    gap: 16,
  },
  fontError: { color: colors.ink, textAlign: 'center' },
  retryButton: {
    minHeight: 48,
    minWidth: 80,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: 'center',
  },
  retryText: { color: colors.white },
});
