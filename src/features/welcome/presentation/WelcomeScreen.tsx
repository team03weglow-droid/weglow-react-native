import { Platform, StyleSheet, Text, View } from 'react-native';

import { OnnxSmokeTestControl } from '../../../dev/onnx-smoke/OnnxSmokeTestControl';

import { theme } from '../../../shared/theme/theme';
import { Screen } from '../../../shared/ui/Screen';

export function WelcomeScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          WeGlow!
        </Text>
        {__DEV__ && Platform.OS === 'android' ? <OnnxSmokeTestControl /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '600' },
});
