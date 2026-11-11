import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme/theme';
import { Screen } from '../../../shared/ui/Screen';

export function WelcomeScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          WeGlow 2.0
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '600' },
});
