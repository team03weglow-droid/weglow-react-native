# WeGlow Stage 3B.5 — Android ONNX runtime smoke test

Date: 2026-11-11. **Blocked at native registration/import. No model-load or inference success.**

## Scope and implementation

Read [Stage 3B.3](STAGE_3B_ONNX_ANDROID_POC.md) and [Stage 3B.4](STAGE_3B_ONNX_ANDROID_PATCH.md). Worked only in `/private/tmp/weglow-stage3b3-onnx` on `poc/stage3b3-onnx-android`, starting from `b98355d`. No changes to the main project or original Kotlin app; no merge/push.

Added a temporary Android `__DEV__` control below the existing **WeGlow!** welcome heading. It starts at **“Not run. Tap to opt in.”** ONNX is dynamically imported only after an explicit button press and a native-module availability check. No test runs at startup. Failures appear as selectable text; the button permits another attempt. No new dependencies, native changes, prebuild, app rebuild, camera, Supabase or production AI integration.

Files:

- `src/dev/onnx-smoke/OnnxSmokeTestControl.tsx`: opt-in button and status.
- `src/dev/onnx-smoke/runOnnxSmokeTest.ts`: native availability check, dynamic import/JSI initialization, CPU session creation, inference/assertion, stage logs and session release.
- `scripts/generate-onnx-smoke-fixture.cjs`: dependency-free protobuf encoder for the synthetic fixture.
- `src/dev/onnx-smoke/{add-bias.onnx,fixture.json}`: **123-byte** ONNX graph and identical bytes for in-memory loading. IR 8, default-domain opset 13, float32 `[3]`, `Y = Add(X, bias)` with bias `[1,2,3]`. Input **`[-1,0,5]`**, expected output **`[0,2,8]`**, exact shape/type/value assertion. No production model was copied.
- Welcome screen: renders the control only for Android development mode; heading retained.

Fixture SHA-256: `fcfefcb8facec3b9fe184ea88044df2a8d991f04097e275288edf32a21a32d2b`. Binary/JSON/hash consistency was checked. The fixture was generated from the ONNX protobuf layout; an independent ONNX checker was unavailable, and native model validation was **not reached**.

## Exact device/build and steps

ADB reported **emulator-5554**, Android **16**, **arm64-v8a**. The installed `com.weglow.mobile.dev` APK hash matched Stage 3B.4 exactly:

`cc8ab1b957b7853e9c68329c8ad03aa2f598f88e3160c8654529765649c3bbf5`

Reused that installed development build; no APK replacement or rebuild was needed to observe the blocker. npm binding/common remain 1.24.3; the prior build resolved native ONNX Android 1.31.1.

Commands from this worktree (ADB executable: `/Users/mac/Library/Android/sdk/platform-tools/adb`):

```sh
node scripts/generate-onnx-smoke-fixture.cjs
npm run typecheck
# Check only the new/changed smoke-test files; see lint limitation below.
./node_modules/.bin/eslint scripts/generate-onnx-smoke-fixture.cjs src/dev/onnx-smoke/*.ts src/dev/onnx-smoke/*.tsx src/features/welcome/presentation/WelcomeScreen.tsx --max-warnings=0
CI=1 ./node_modules/.bin/expo start --dev-client --localhost --port 8089
adb devices -l
adb -s emulator-5554 reverse tcp:8089 tcp:8089
adb -s emulator-5554 shell am start -a android.intent.action.VIEW -d 'weglow-development://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8089' com.weglow.mobile.dev
adb -s emulator-5554 shell uiautomator dump /sdcard/weglow-stage3b5-ui.xml
adb -s emulator-5554 shell input tap 540 1214
adb -s emulator-5554 logcat -d -v time ReactNativeJS:I '*:S'
```

The tap coordinates came from the observed button bounds. Metro used a separate port and worktree; existing preview servers were not stopped. The initial sandboxed ADB startup was denied, then succeeded with tool approval. A later reopen briefly raced Metro restart and showed a connection-refused screen; reconnecting after Metro was listening resolved that transport issue without an APK change.

## Observed runtime evidence

First explicit tap attempted the dynamic ONNX import. Emulator LogBox showed:

```text
Cannot read property 'install' of null
node_modules/onnxruntime-react-native/lib/binding.ts:14
Module.install();
```

The smoke logger had already reported `installAvailable:false`. The import also produced a secondary caught `Cannot read property 'versions' of undefined` error from incomplete exports. No session was created.

Added a native-module guard before import to prevent that package initialization error from disrupting the welcome UI. Restarted only the isolated Metro server and reopened the same APK. UI inspection confirmed **WeGlow!**, the button and **“Not run. Tap to opt in.”** before tapping. The guarded retry produced actual emulator logs:

```text
11-11 18:33:20.758 [WeGlow ONNX smoke] start
11-11 18:33:20.758 [WeGlow ONNX smoke] native module lookup {"installAvailable":false}
11-11 18:33:20.759 [WeGlow ONNX smoke] FAIL
{"stage":"native module lookup","message":"NativeModules.Onnxruntime.install is unavailable in this development APK."}
```

Afterward, UI inspection showed the welcome heading, enabled test button and the same clear failure message, without LogBox. **Model load, inference output and expected-output assertion were not reached. There is no PASS evidence.**

Inspection of the existing generated `android/build/generated/autolinking/autolinking.json` listed only `expo`, `react-native-safe-area-context`, and `react-native-screens`; generated `PackageList.java` contained no ONNX registration. The installed ONNX package also lacks `react-native.config.js`. These source observations are consistent with missing registration; packaging `.so` files and compiling the library did not prove it was registered with React Native.

Local ignored evidence: `artifacts/stage3b5/runtime-log.txt`, `ui-idle.xml`, `ui-result.xml`, `emulator-result.png`; Metro output: `artifacts-stage3b5-metro.log`. Metro remains available on port 8089 for review. Logs contain synthetic fixture data only.

## Checks and next action

TypeScript, targeted ESLint and `git diff --check` passed. Initial lint findings in the new files were corrected. Full `npm run lint` remains blocked by the pre-existing `scripts/apply-onnx-gradle-patch.cjs` `__dirname`/`no-undef` error; that unrelated script was left unchanged. No full lint pass is claimed.

Next: separately authorize a reproducible Android package-registration/autolinking fix for ONNX 1.24.3 and a necessary new development APK. Then rerun this opt-in fixture to establish actual initialization, model validation and output. No native registration workaround was attempted here. CPU/model/operator parity, memory/performance, release/page-size compatibility and iOS remain unverified.
