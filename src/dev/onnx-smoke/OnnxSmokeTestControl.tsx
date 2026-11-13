import { useState } from 'react';
import { Button, Text, View } from 'react-native';

export function OnnxSmokeTestControl() {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('Not run. Tap to opt in.');
  const run = async () => {
    if (running) return;
    setRunning(true);
    setStatus('Running ONNX smoke test…');
    try {
      const { runOnnxSmokeTest } = await import('./runOnnxSmokeTest');
      setStatus(await runOnnxSmokeTest());
    } catch (error) {
      setStatus(
        `FAIL: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setRunning(false);
    }
  };
  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Button
        title="Run ONNX smoke test (dev only)"
        disabled={running}
        onPress={() => void run()}
      />
      <Text accessibilityLiveRegion="polite" selectable>
        {status}
      </Text>
    </View>
  );
}
