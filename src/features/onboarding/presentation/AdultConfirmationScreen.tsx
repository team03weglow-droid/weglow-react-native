import { useFonts } from 'expo-font';
import { useReducer, useState } from 'react';
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

import {
  adultConfirmationFonts,
  jakartaFamily,
} from '../../../shared/theme/fonts';
import { Screen } from '../../../shared/ui/Screen';

import {
  createAdultConfirmationState,
  getContinuePreview,
  toggleAdultConfirmation,
} from './adultConfirmationState';

type AdultConfirmationProps = { onBack: () => void };

export function AdultConfirmationScreen({ onBack }: AdultConfirmationProps) {
  const [fontAttempt, setFontAttempt] = useState(0);
  return (
    <AdultConfirmationContent
      key={fontAttempt}
      onBack={onBack}
      onRetryFonts={() => setFontAttempt((attempt) => attempt + 1)}
    />
  );
}

function AdultConfirmationContent({
  onBack,
  onRetryFonts,
}: AdultConfirmationProps & { onRetryFonts: () => void }) {
  const [fontsLoaded, fontError] = useFonts(adultConfirmationFonts);
  const [confirmation, toggleConfirmation] = useReducer(
    toggleAdultConfirmation,
    undefined,
    createAdultConfirmationState,
  );
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const onContinue = () => {
    // Guard the handler as well as disabling the control. No navigation/storage.
    const preview = getContinuePreview(confirmation);
    if (preview) Alert.alert(preview.title, preview.message, [{ text: 'OK' }]);
  };

  if (!fontsLoaded) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.fontState}>
          {fontError ? (
            <>
              <Text accessibilityRole="alert">
                We couldn’t load the screen fonts.
              </Text>
              <Pressable
                onPress={onRetryFonts}
                accessibilityRole="button"
                style={styles.fallbackAction}
              >
                <Text>Retry font loading</Text>
              </Pressable>
              <Pressable
                onPress={onBack}
                accessibilityRole="button"
                style={styles.fallbackAction}
              >
                <Text>Back to Welcome</Text>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator
              color="#111215"
              accessibilityLabel="Loading Adult Confirmation"
            />
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
      >
        <View
          style={[
            styles.layout,
            { minHeight: Math.max(640, height - insets.top - insets.bottom) },
          ]}
        >
          <View style={styles.header}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Back to Welcome"
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={styles.backChevron}
              />
            </Pressable>
            <Text accessibilityLabel="Step 1 of 4" style={styles.step}>
              1 OF 4
            </Text>
          </View>

          <View style={styles.main}>
            <View
              style={styles.badge}
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              <Text allowFontScaling={false} style={styles.badgeText}>
                18+
              </Text>
            </View>
            <Text style={styles.eyebrow}>BEFORE WE BEGIN</Text>
            <Text accessibilityRole="header" style={styles.heading}>
              Skincare guidance{'\n'}for adults.
            </Text>
            <Text style={styles.body}>
              AURA / SKIN is designed for people aged 18 and over. It offers
              cosmetic guidance and is not a diagnostic tool.
            </Text>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel="I confirm I am 18 or older"
              accessibilityHint="Toggles your confirmation for this screen only. This does not verify your age."
              accessibilityState={{ checked: confirmation.confirmed }}
              onPress={() => toggleConfirmation()}
              style={({ pressed }) => [
                styles.confirmationCard,
                pressed && styles.pressed,
              ]}
            >
              <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={[
                  styles.checkbox,
                  confirmation.confirmed && styles.checkboxChecked,
                ]}
              >
                {confirmation.confirmed ? (
                  <View style={styles.checkmark} />
                ) : null}
              </View>
              <View style={styles.confirmationCopy}>
                <Text style={styles.confirmationLabel}>
                  I confirm I am 18 or older
                </Text>
                <Text style={styles.confirmationHint}>
                  Your answer is stored only in this prototype session.
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Pressable
              disabled={!confirmation.confirmed}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue"
              accessibilityState={{ disabled: !confirmation.confirmed }}
              accessibilityHint={
                confirmation.confirmed
                  ? 'Shows a development-preview notice. The next step is not implemented.'
                  : 'Confirm you are at least 18 to enable Continue.'
              }
              style={({ pressed }) => [
                styles.continueButton,
                !confirmation.confirmed && styles.continueDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.continueText}>Continue</Text>
              <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={styles.chevronSlot}
              >
                <View style={styles.forwardChevron} />
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, backgroundColor: '#F1F6F9' },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  layout: { flexGrow: 1, width: '100%', maxWidth: 400, paddingHorizontal: 25 },
  header: {
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    width: 8,
    height: 8,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: '#111215',
    transform: [{ rotate: '45deg' }],
  },
  step: {
    fontFamily: jakartaFamily.bold,
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 1.76,
    color: '#6B7280',
    includeFontPadding: false,
  },
  main: { flexGrow: 1, paddingTop: 28, paddingBottom: 28 },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFFFFFCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    boxShadow: '0px 2px 8px #00000008',
  },
  badgeText: {
    fontFamily: jakartaFamily.extrabold,
    fontSize: 15,
    lineHeight: 22.5,
    letterSpacing: -0.375,
    color: '#111215',
    includeFontPadding: false,
  },
  eyebrow: {
    fontFamily: jakartaFamily.bold,
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 1.98,
    color: '#6D757D',
    marginBottom: 10,
    includeFontPadding: false,
  },
  heading: {
    fontFamily: jakartaFamily.semibold,
    fontSize: 31,
    lineHeight: 35.34,
    letterSpacing: -0.93,
    color: '#111215',
    marginBottom: 16,
    includeFontPadding: false,
  },
  body: {
    fontFamily: jakartaFamily.regular,
    fontSize: 13,
    lineHeight: 19.24,
    letterSpacing: -0.13,
    color: '#596574',
    marginBottom: 28,
    includeFontPadding: false,
  },
  confirmationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    minHeight: 71,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFFE6',
    backgroundColor: '#FFFFFF99',
    boxShadow: '0px 2px 6px #00000008',
  },
  checkbox: {
    marginTop: 2,
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFFCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#111827', borderColor: '#111827' },
  checkmark: {
    width: 9,
    height: 5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  confirmationCopy: { flex: 1, gap: 3 },
  confirmationLabel: {
    fontFamily: jakartaFamily.bold,
    fontSize: 13,
    lineHeight: 16.25,
    color: '#111827',
    includeFontPadding: false,
  },
  confirmationHint: {
    fontFamily: jakartaFamily.medium,
    fontSize: 11,
    lineHeight: 16.5,
    color: '#9AA0A6',
    includeFontPadding: false,
  },
  footer: { paddingTop: 16, paddingBottom: 12 },
  continueButton: {
    minHeight: 53,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  continueDisabled: { backgroundColor: '#A7ABAE' },
  continueText: {
    fontFamily: jakartaFamily.semibold,
    fontSize: 14,
    lineHeight: 21,
    color: '#FFFFFF',
    textAlign: 'center',
    flexShrink: 1,
    includeFontPadding: false,
  },
  chevronSlot: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forwardChevron: {
    width: 6,
    height: 6,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  pressed: { opacity: 0.75 },
  fontState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 25,
  },
  fallbackAction: { minHeight: 44, padding: 12 },
});
