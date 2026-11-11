# WeGlow 2.0 — Stage 3B.3 Android ONNX POC

Date: 2026-11-11. **Blocked during native project configuration; no APK or compatibility success.**

## Isolation and scope

Read [Stage 3B.1](STAGE_3B_AI_FEASIBILITY.md) and [Stage 3B.2](STAGE_3B_DEPENDENCY_COMPATIBILITY.md). Started from clean `main` at `f1294f0315ca077afc0c61d0b05ff8849c6edaff` and created branch **`poc/stage3b3-onnx-android`** in a separate worktree, **`/private/tmp/weglow-stage3b3-onnx`**, before edits. The original checkout remains on clean `main` at the same commit; its files, dependencies and preview process were not changed. No merge or push was performed. Expo Go preview behavior was not rerun in this POC.

Only `package.json`, `package-lock.json`, `app.config.ts` and this report changed. Added exact `onnxruntime-react-native@1.24.3` and its required `onnxruntime-common@1.24.3`; registered the ONNX config plugin. Existing lockfile package versions/integrities were unchanged. The fresh worktree needed the existing baseline dependencies installed as well. No model binaries, JS runtime imports, camera/backend features, TFLite or Nitro were added. No third-party source or toolchain settings were patched. Generated Android files remain ignored.

## Commands and results

Commands ran from the isolated worktree except branch creation:

```sh
git worktree add -b poc/stage3b3-onnx-android /private/tmp/weglow-stage3b3-onnx main
npm install --save-exact onnxruntime-react-native@1.24.3 --no-audit --no-fund
# Added 'onnxruntime-react-native' to app.config.ts plugins.
./node_modules/.bin/expo config --type prebuild
./node_modules/.bin/expo prebuild --platform android --no-install
JAVA_HOME='/Applications/Android Studio.app/Contents/jbr/Contents/Home' \
ANDROID_HOME='/Users/mac/Library/Android/sdk' \
./android/gradlew -p android :app:assembleDebug --no-daemon --stacktrace --console=plain
```

| Check | Actual result |
| --- | --- |
| npm installation | Exit 0; added 732 packages in the fresh worktree. Only two new lockfile package entries: ONNX RN/common 1.24.3. Baseline warning: deprecated ESLint 9.39.5; npm also reported unapproved esbuild/fsevents install scripts. No script approvals were added. |
| Expo config/plugin registration | Exit 0. Config evaluated with the ONNX plugin. |
| Android prebuild/plugin execution | Exit 0. Generated Android tree; plugin inserted `implementation project(':onnxruntime-react-native')` into app Gradle. Package scripts remained unchanged. This proves plugin execution, not native runtime registration. |
| Android debug build | Exit 1 after **1m 11s**; **32 actionable tasks executed**. Failed evaluating the ONNX project before native compilation; no APK produced. |

One read-only version probe using `require('onnxruntime-common/package.json')` failed with `ERR_PACKAGE_PATH_NOT_EXPORTED`; reading the manifest as a file confirmed 1.24.3. This inspection error did not block Expo or the build.

## First reproducible blocker

```text
Build file '.../node_modules/onnxruntime-react-native/android/build.gradle' line: 250
A problem occurred evaluating project ':onnxruntime-react-native'.
> Could not get unknown property 'VersionNumber' for object of type
  org.gradle.api.internal.artifacts.dsl.dependencies.DefaultDependencyHandler.
```

The installed, unchanged source at line 250 is:

```groovy
if (VersionNumber.parse(REACT_NATIVE_VERSION) < VersionNumber.parse("0.71")) {
```

The command above and untouched dependency/config files preserve the reproduction. Stopped after this first native failure; no patch, workaround, second build, dependency-resolution task or broad fix was attempted. Earlier warnings about AGP legacy DSL/variant APIs were nonfatal.

## Observed versions and native-resolution limits

- Installed manifests: **Expo 58.0.23, RN 0.88.1, React 19.3.0, ONNX RN/common 1.24.3**. Generated properties retain `newArchEnabled=true` and `hermesEnabled=true`.
- Existing wrapper: **Gradle 9.4.1**. Launcher JDK: Android Studio **OpenJDK 25.0.2**. No compiler invocation succeeded, so a Java compilation toolchain is not established by this attempt.
- Gradle logged **build tools 37.0.0, compile SDK 37, target SDK 36, minimum SDK 24, NDK 27.1.12297006, Kotlin plugin 2.2.10**. It noted catalog Kotlin 2.2.0 and used plugin 2.2.10. No SDK/Gradle downgrade was made.
- ONNX's declared Android dependencies include `react-android:0.88.1`, `mockito-core:2.28.2`, `junit:4.12` and **`onnxruntime-android:latest.integration@aar`** (QNN/extensions not enabled). The build failed before ONNX AAR resolution/extraction, so **no resolved ONNX native version or complete native dependency graph is available**. Existing cache entries do not prove resolution in this build. Do not label the native runtime 1.24.3 from the npm version alone.

Raw logs: `/private/tmp/weglow-stage3b3-{install,config,prebuild,build}.log`. They are local temporary evidence, not committed build artifacts.

## Decision and next action

**Unmodified ONNX RN 1.24.3 did not compile with this existing Android setup.** Expo config/prebuild compatibility passed; compilation, linking, runtime registration, inference and 16 KB page alignment remain untested.

Next, separately authorize a narrowly reviewed reproducible fix for the `VersionNumber` check, or evaluate a newer published RN package when available. A local Expo native ONNX adapter remains an alternative. Keep SDK 58/RN 0.88.1/Gradle 9.4.1 unchanged for a controlled retry. Passing this check would expose later gates, including native-version locking and page alignment; this result does not resolve them. No production integration or iOS build was attempted.
