import type { InferenceSession } from 'onnxruntime-react-native';
import { NativeModules, Platform } from 'react-native';

import fixture from './fixture.json';

export async function runOnnxSmokeTest(): Promise<string> {
  if (!__DEV__ || Platform.OS !== 'android') {
    throw new Error('ONNX smoke test requires an Android development build.');
  }
  const log = (stage: string, detail: unknown = '') => {
    console.info(`[WeGlow ONNX smoke] ${stage}`, JSON.stringify(detail));
  };
  let session: InferenceSession | undefined;
  let stage = 'native module lookup';
  try {
    log('start', { fixtureSha256: fixture.sha256 });
    const nativeModule: unknown = NativeModules.Onnxruntime;
    const nativeModuleAvailable =
      !!nativeModule &&
      typeof nativeModule === 'object' &&
      'install' in nativeModule &&
      typeof nativeModule.install === 'function';
    log('native module lookup', { installAvailable: nativeModuleAvailable });
    if (!nativeModuleAvailable) {
      throw new Error(
        'NativeModules.Onnxruntime.install is unavailable in this development APK.',
      );
    }
    stage = 'runtime import / JSI initialization';
    const ort = await import('onnxruntime-react-native');
    log('runtime imported / JSI initialized', {
      versions: ort.env.versions,
      backends: ort.listSupportedBackends(),
    });
    stage = 'model load';
    session = await ort.InferenceSession.create(new Uint8Array(fixture.bytes), {
      executionProviders: ['cpu'],
      intraOpNumThreads: 1,
      interOpNumThreads: 1,
    });
    log('model loaded / ORT initialized', {
      inputs: session.inputNames,
      outputs: session.outputNames,
      bytes: fixture.bytes.length,
    });
    stage = 'inference';
    const input = new ort.Tensor('float32', Float32Array.from([-1, 0, 5]), [3]);
    const result = await session.run({ X: input });
    const output = result.Y;
    if (!output || output.type !== 'float32') {
      throw new Error('Missing float32 output Y.');
    }
    const actual = Array.from(output.data as Float32Array);
    const expected = [0, 2, 8];
    log('inference output', {
      input: [-1, 0, 5],
      actual,
      expected,
      dims: output.dims,
    });
    if (
      output.dims.length !== 1 ||
      output.dims[0] !== 3 ||
      actual.length !== expected.length ||
      actual.some((value, index) => value !== expected[index])
    ) {
      throw new Error(`Output assertion failed: ${JSON.stringify(actual)}`);
    }
    log('PASS', actual);
    return 'PASS: [-1, 0, 5] + [1, 2, 3] = [0, 2, 8]';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log('FAIL', { stage, message });
    throw new Error(`${stage}: ${message}`);
  } finally {
    await session?.release();
  }
}
