# WeGlow Stage 3B.4 — ONNX Android Gradle patch

Date: 2026-11-11. Scope: one Gradle comparison fix and one Android debug build.

## Isolation and change

Worked in `/private/tmp/weglow-stage3b3-onnx`, branch `poc/stage3b3-onnx-android`, starting at `46ad837`. Read [the Stage 3B.3 POC](STAGE_3B_ONNX_ANDROID_POC.md) and inspected the installed ONNX Gradle file. The main project was not modified; no merge or push was performed.

Replaced only this failing line in `onnxruntime-react-native@1.24.3/android/build.gradle:250`:

```groovy
if (VersionNumber.parse(REACT_NATIVE_VERSION) < VersionNumber.parse("0.71")) {
```

with:

```groovy
if (REACT_NATIVE_VERSION.split("\\.")[0].toInteger() == 0 && REACT_NATIVE_MINOR_VERSION < 71) {
```

This uses the already parsed RN minor version and an explicit major-zero guard. For stable nonnegative RN versions, it preserves the `< 0.71` cutoff: 0.70.x includes the old fbjni dependencies; 0.71.x, 0.88.1 and 1.x do not. It avoids the unavailable Gradle `VersionNumber` reference without removing the conditional or changing its dependency body. Prerelease versions at the 0.71 boundary are outside this pinned stable-version POC; qualifier ordering is not implemented by this numeric check.

## Reproducible patch mechanism

- `patches/onnxruntime-react-native+1.24.3.patch`: tracked single-line diff.
- `scripts/apply-onnx-gradle-patch.cjs`: checks the installed version is exactly 1.24.3, verifies patch context with `git apply --check`, then applies it. A reverse-check recognizes an already applied patch. Unexpected context/version fails instead of partially applying or silently skipping.
- `package.json`: `postinstall` applies the patch after normal dependency installation; `npm run patch:onnx` applies it explicitly, including after installs that suppress lifecycle scripts. Git must be available. No patching dependency was installed, and the dependency lockfile did not change.

Verified initial application and idempotent reapplication. Compared the installed Gradle file against the previously inspected published source: exactly the tracked replacement differs. This does not assert a full clean reinstall was tested.

## Commands

From the isolated worktree:

```sh
npm run patch:onnx
npm run patch:onnx
JAVA_HOME='/Applications/Android Studio.app/Contents/jbr/Contents/Home' \
ANDROID_HOME='/Users/mac/Library/Android/sdk' \
./android/gradlew -p android :app:assembleDebug --no-daemon --stacktrace --console=plain
```

The single build's output was captured in `/private/tmp/weglow-stage3b4-build.log`. No prebuild, toolchain downgrade, model copy, camera, Supabase, TFLite/Nitro or production feature work was performed. Formatted the new script with the existing Prettier tool; `git diff --check` passed.

## Build result and next gate

**Pass: exit 0, `BUILD SUCCESSFUL in 7m 29s`; 405 actionable tasks (373 executed, 32 up-to-date).** Exactly one Android debug build was run. The previous configuration failure disappeared, ONNX Java/native compilation completed, and the APK was packaged. No subsequent fatal error or build blocker was observed; deprecation warnings were nonfatal.

- APK: `android/app/build/outputs/apk/debug/app-debug.apk`, **347,401,302 bytes**. SHA-256: `cc8ab1b957b7853e9c68329c8ad03aa2f598f88e3160c8654529765649c3bbf5`.
- ZIP inspection confirms `libonnxruntime.so` and `libonnxruntimejsi.so` for **arm64-v8a, armeabi-v7a, x86 and x86_64**. This is a development APK including all configured ABIs, not a release-size measurement.
- ONNX's unchanged `latest.integration` Maven selector extracted **`onnxruntime-android-1.31.1.aar`** under its Android build directory. The npm binding/common remain **1.24.3**. Native resolution is therefore still dynamic, not pinned by the npm lockfile.
- Existing versions retained: **Expo 58.0.23, RN 0.88.1, React 19.3.0, Gradle 9.4.1**, Android Studio launcher JDK **25.0.2**. Gradle reported build tools **37.0.0**, compile SDK **37**, target **36**, minimum **24**, NDK **27.1.12297006**, Kotlin **2.2.10**. Hermes/New Architecture settings were unchanged.
- Final script/package formatting check and `git diff --check` passed. No second build was needed or run.

**Next gate, not an observed blocker:** separately authorize a device smoke test for native module registration/session creation, followed by approved model/operator and Kotlin-parity tests. Native-runtime version pinning, release builds and 16 KB ELF/ZIP alignment remain unresolved. No app was installed/launched, no model inference or iOS test ran, and compile success does not establish those properties. No additional source workaround was attempted.
