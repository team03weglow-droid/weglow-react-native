import { useState } from 'react';
import { Button, Text, View } from 'react-native';

export function RealYoloTestControl() {
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState(
    'Real YOLO not run. Tap to opt in (one run per reload).',
  );
  const run = async () => {
    if (started) return;
    setStarted(true);
    setStatus('Running real YOLO CPU inference…');
    try {
      const { runRealYoloTest } = await import('./runRealYoloTest');
      setStatus(await runRealYoloTest());
    } catch (error) {
      setStatus(
        `FAIL: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };
  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Button
        title="Run real YOLO test (dev only)"
        disabled={started}
        onPress={() => void run()}
      />
      <Text accessibilityLiveRegion="polite" selectable>
        {status}
      </Text>
    </View>
  );
}
