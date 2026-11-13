# WeGlow Stage 3B.6 — Android ONNX native registration

Date: 2026-11-11. **PASS: native registration, import/JSI initialization, synthetic model load and CPU inference confirmed on the emulator.**

## Scope and cause

Read the Stage [3B.3](STAGE_3B_ONNX_ANDROID_POC.md), [3B.4](STAGE_3B_ONNX_ANDROID_PATCH.md) and [3B.5](STAGE_3B_ONNX_RUNTIME_SMOKE_TEST.md) reports. Worked only in `/private/tmp/weglow-stage3b3-onnx`, branch `poc/stage3b3-onnx-android`, starting at `a17ba97`. The main checkout and original Kotlin project were not modified. Nothing merged or pushed.

The installed ONNX **1.24.3** ships `unimodule.json` declaring Android support but no `react-native.config.js`. Expo autolinking **58.0.17** discovers that legacy Expo configuration. Its `src/reactNativeConfig/androidResolver.ts` explicitly skips React Native linking when the Android override is undefined, the package declares Expo Android support, and the same Gradle project would conflict. That explains why the library compiled through its Expo/Gradle integration while React Native's generated package list omitted it.

The actual supported registration class is **`ai.onnxruntime.reactnative.OnnxruntimePackage`**, a regular `ReactPackage`. Its `createNativeModules()` constructs `OnnxruntimeModule`, whose `getName()` returns **`Onnxruntime`**. The installed Expo plugin only inserts Gradle/Pod dependencies; it does not register this package in the application.

## Smallest reproducible fix

Added tracked project-root **`react-native.config.js`**:

```js
module.exports = {
  dependencies: {
    'onnxruntime-react-native': {
      platforms: {
        android: {
          packageImportPath:
            'import ai.onnxruntime.reactnative.OnnxruntimePackage;',
          packageInstance: 'new OnnxruntimePackage()',
        },
      },
    },
  },
};
```

The explicit Android object bypasses the resolver's undefined-configuration exclusion and identifies the installed registration class. No dependency source or generated application source was edited manually. The Stage 3B.4 Gradle patch, patch script, app config, package manifest/lockfile and Stage 3B.5 smoke test stayed unchanged. No package/version changes or production features were introduced.

**No Expo prebuild was necessary.** The existing RN settings plugin tracks `react-native.config.js` as an autolinking-cache input. Ran only the package-list generation task first and verified both outputs before requesting the APK build:

- `android/build/generated/autolinking/autolinking.json` now contains ONNX with the expected package import and instance.
- `android/app/build/generated/autolinking/src/main/java/com/facebook/react/PackageList.java` now includes **`new ai.onnxruntime.reactnative.OnnxruntimePackage()`**.

## Commands and build results

All commands ran from the isolated worktree; output logs are under ignored `artifacts/stage3b6/`.

```sh
./node_modules/.bin/expo-modules-autolinking react-native-config --platform android --json
npm run patch:onnx
JAVA_HOME='/Applications/Android Studio.app/Contents/jbr/Contents/Home' \
ANDROID_HOME='/Users/mac/Library/Android/sdk' \
./android/gradlew -p android :app:generateAutolinkingPackageList --no-daemon --stacktrace --console=plain
# Verified generated JSON and PackageList before the following APK build.
JAVA_HOME='/Applications/Android Studio.app/Contents/jbr/Contents/Home' \
ANDROID_HOME='/Users/mac/Library/Android/sdk' \
./android/gradlew -p android :app:assembleDebug --no-daemon --stacktrace --console=plain
```

The first CLI inspection omitted `--json` and produced human-readable output; a JSON-reading probe failed. Reissued with `--json` successfully. This was an inspection-format error, not a registration/build blocker.

| Operation | Observed result |
| --- | --- |
| Package-list generation | **Exit 0**, 12s; 33 tasks, 1 executed/32 up-to-date |
| Android debug APK build | **Exit 0**, 42s; 405 tasks, 48 executed/357 up-to-date |
| Existing Gradle patch | Already applied; reverse patch-context check passed |
| Configuration checks | Targeted ESLint, final Prettier check and `git diff --check` passed |

APK: `android/app/build/outputs/apk/debug/app-debug.apk`, **347,405,137 bytes**; SHA-256 **`88617e1bad735697bfe06b40f4fdaf4c9b0e746cfb3b2c98ebdcf0d0395c961a`**.

Versions retained: **Expo 58.0.23, React Native 0.88.1, React 19.3.0, Gradle 9.4.1, ONNX npm binding/common 1.24.3**. Existing native extraction remains **`onnxruntime-android-1.31.1.aar`** via the unchanged dynamic Maven selector. This native artifact version is distinct from the JS binding version.

## Actual emulator inference

Used existing **emulator-5554**, Android 16, arm64-v8a, and the isolated Metro server already listening on port 8089. Commands below use `/Users/mac/Library/Android/sdk/platform-tools/adb`:

```sh
adb devices -l
adb -s emulator-5554 install -r android/app/build/outputs/apk/debug/app-debug.apk
adb -s emulator-5554 reverse tcp:8089 tcp:8089
adb -s emulator-5554 shell am force-stop com.weglow.mobile.dev
adb -s emulator-5554 shell am start -a android.intent.action.VIEW -d 'weglow-development://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8089' com.weglow.mobile.dev
adb -s emulator-5554 shell uiautomator dump /sdcard/weglow-stage3b6-ui.xml
adb -s emulator-5554 shell input tap 540 1214
adb -s emulator-5554 logcat -d --pid=8427 -v time
```

Installation returned **Success**. UI inspection confirmed the welcome heading and **“Not run. Tap to opt in.”** before the explicit tap, using observed button bounds. The unchanged 123-byte Add fixture then produced these emulator logs (PID 8427):

```text
18:42:49.337 native module lookup {"installAvailable":true}
18:42:50.009 runtime imported / JSI initialized
  {"versions":{"common":"1.24.3","react-native":"1.24.3"},
   "backends":[{"name":"cpu"},{"name":"xnnpack"},{"name":"nnapi"}]}
18:42:50.097 model loaded / ORT initialized {"inputs":["X"],"outputs":["Y"],"bytes":123}
18:42:50.101 inference output
  {"input":[-1,0,5],"actual":[0,2,8],"expected":[0,2,8],"dims":[3]}
18:42:50.101 PASS [0,2,8]
```

All lines have the `[WeGlow ONNX smoke]` prefix in the raw log. The test explicitly selected **CPU**; listing other available backends does not mean they were tested. The exact float32 shape/value assertion passed, and the UI displayed **`PASS: [-1, 0, 5] + [1, 2, 3] = [0, 2, 8]`** while retaining the welcome heading/button.

Evidence: `artifacts/stage3b6/{react-native-config.json,autolinking-before.json,autolinking-after.json,PackageList-before.java,PackageList-after.java,generate-registration.log,build.log,runtime-log.txt,app-logcat.txt,ui-idle.xml,ui-result.xml,emulator-result.png}`. These are local ignored artifacts; selected evidence is reproduced above. Metro remains on port 8089 for review.

## Remaining gates

No new blocker appeared in this attempt. This establishes the Android development-build path for **this synthetic CPU graph on this emulator**, not the real acne model, Kotlin preprocessing parity, physical-device performance, release builds, 16 KB alignment, native-runtime version pinning or iOS compatibility. No real model, camera, Supabase or TFLite work was done. Full-repository lint was not rerun; its previously recorded unrelated patch-script lint issue remains outside this change.
