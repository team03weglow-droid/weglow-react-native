import type { InferenceSession } from 'onnxruntime-react-native';
import { NativeModules, Platform } from 'react-native';

const modelPath = '/data/user/0/com.weglow.mobile.dev/files/stage3b7-acne.onnx';
const modelSha256 =
  'f562b417738082c7e90414bc691806fd0588f8a196599dd843fe012cb752fa1a';

export async function runRealYoloTest(): Promise<string> {
  if (!__DEV__ || Platform.OS !== 'android') {
    throw new Error('Real YOLO test requires an Android development build.');
  }
  const log = (stage: string, detail: unknown = '') => {
    console.info(`[WeGlow real YOLO] ${stage}`, JSON.stringify(detail));
  };
  let session: InferenceSession | undefined;
  let stage = 'native module lookup';
  try {
    log('start', { modelPath, modelSha256, bytes: 44733219 });
    if (typeof NativeModules.Onnxruntime?.install !== 'function') {
      throw new Error('NativeModules.Onnxruntime.install is unavailable.');
    }
    stage = 'runtime import';
    const ort = await import('onnxruntime-react-native');
    log('runtime imported', { versions: ort.env.versions });
    stage = 'model load';
    const loadStart = performance.now();
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['cpu'],
      intraOpNumThreads: 1,
      interOpNumThreads: 1,
      graphOptimizationLevel: 'all',
    });
    const loadMs = performance.now() - loadStart;
    log('model loaded', {
      loadMs,
      inputs: session.inputNames,
      outputs: session.outputNames,
      inputMetadata: session.inputMetadata,
      outputMetadata: session.outputMetadata,
    });
    stage = 'metadata validation';
    const matches = (
      metadata: InferenceSession.ValueMetadata | undefined,
      name: string,
      shape: number[],
    ) =>
      metadata?.name === name &&
      metadata.isTensor &&
      metadata.type === 'float32' &&
      JSON.stringify(metadata.shape) === JSON.stringify(shape);
    if (
      session.inputNames.length !== 1 ||
      session.outputNames.length !== 1 ||
      !matches(session.inputMetadata[0], 'images', [1, 3, 640, 640]) ||
      !matches(session.outputMetadata[0], 'output0', [1, 14, 8400])
    ) {
      throw new Error(
        'Model metadata does not match the Kotlin tensor contract.',
      );
    }
    stage = 'input preparation';
    // A uniform RGB 114 image in Kotlin's normalized NCHW layout; no photo preprocessing.
    const data = new Float32Array(3 * 640 * 640).fill(114 / 255);
    const input = new ort.Tensor('float32', data, [1, 3, 640, 640]);
    log('input prepared', {
      name: 'images',
      type: input.type,
      dims: input.dims,
      elements: data.length,
      bytes: data.byteLength,
      value: data[0],
      finite: true,
    });
    stage = 'inference';
    log('inference start', { executionProviders: ['cpu'], runs: 1 });
    const runStart = performance.now();
    const outputs = await session.run({ images: input });
    const inferenceMs = performance.now() - runStart;
    log('inference completed', {
      inferenceMs,
      outputNames: Object.keys(outputs),
    });
    stage = 'output validation';
    for (const name of session.outputNames) {
      const output = outputs[name];
      if (!output || output.type !== 'float32')
        throw new Error(`Missing float32 output ${name}.`);
      const values = output.data as Float32Array;
      let nonFinite = 0;
      let min = Infinity;
      let max = -Infinity;
      for (const value of values) {
        if (!Number.isFinite(value)) nonFinite++;
        else {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      }
      log('output', {
        name,
        type: output.type,
        dims: output.dims,
        elements: values.length,
        nonFinite,
        finite: nonFinite === 0,
        min,
        max,
      });
      if (
        JSON.stringify(output.dims) !== '[1,14,8400]' ||
        values.length !== 117600 ||
        nonFinite !== 0
      ) {
        throw new Error(
          'Output shape, element count or finite-value assertion failed.',
        );
      }
    }
    log('PASS', { loadMs, inferenceMs });
    return `PASS: YOLO [1,14,8400], all 117600 values finite; inference ${inferenceMs.toFixed(1)} ms; load ${loadMs.toFixed(1)} ms.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log('FAIL', { stage, message });
    throw new Error(`${stage}: ${message}`);
  } finally {
    await session?.release();
    log('session released');
  }
}
