# WeGlow 2.0 — Stage 3A implementation report

Date: 2026-11-11. Scope: project initialization only. Stage 3B remains unapproved.

## Outcome and evidence

Initialized an Expo SDK 58 / React Native / TypeScript application for Android and
iOS using the official blank TypeScript template. The app has a typed React
Navigation native stack, safe-area handling, environment/provider foundation and a
temporary accessible heading displaying **WeGlow 2.0**. No Figma screens, auth flows,
backend clients, API calls, models or AI runtimes are implemented.

**Verified:** all four requested planning documents were read before implementation.
The initial repository contained `README.md`, Git metadata and five untracked
Markdown documents. All five pre-existing documents remain byte-for-byte unchanged
(SHA-256 comparison). The README was expanded while retaining its original heading.
Git history remains at the existing initial commit; no commit, reset, publish or
deployment was performed. The Kotlin reference project was not modified or used as
a build target. No hosted backend was contacted.

**Verified versus deferred:** type/lint/test and Metro bundle results below are
local observations. Generating native source or bundling JavaScript does not prove
native device execution, release readiness or future AI compatibility. Provisional
identifiers are not approved store identities.

## Selected toolchain and dependencies

Node 24.20.0 and npm 11.19.0 were already installed. `.nvmrc`, `engines` and
`packageManager` document the Node 24/npm 11 toolchain. The official template is
`expo-template-blank-typescript@58.0.32`. Expo selects native package ranges; the
repository npm lockfile fixes exact installed versions for `npm ci`.

| Package                          | Manifest range | Installed / locked | Purpose        |
| -------------------------------- | -------------- | ------------------ | -------------- |
| `@react-navigation/native`       | `7.5.1`        | 7.5.1              | runtime/native |
| `@react-navigation/native-stack` | `7.21.0`       | 7.21.0             | runtime/native |
| `expo`                           | `~58.0.23`     | 58.0.23            | runtime/native |
| `expo-dev-client`                | `~58.0.18`     | 58.0.18            | runtime/native |
| `expo-status-bar`                | `~58.0.4`      | 58.0.5             | runtime/native |
| `expo-system-ui`                 | `~58.0.7`      | 58.0.7             | runtime/native |
| `react`                          | `19.3.0`       | 19.3.0             | runtime/native |
| `react-native`                   | `0.88.1`       | 0.88.1             | runtime/native |
| `react-native-safe-area-context` | `~5.11.1`      | 5.11.1             | runtime/native |
| `react-native-screens`           | `~4.30.1`      | 4.30.1             | runtime/native |
| `@types/node`                    | `24.19.2`      | 24.19.2            | development    |
| `@types/react`                   | `~19.3.0`      | 19.3.0             | development    |
| `eslint`                         | `9.39.5`       | 9.39.5             | development    |
| `eslint-config-expo`             | `~58.0.4`      | 58.0.4             | development    |
| `eslint-config-prettier`         | `10.1.8`       | 10.1.8             | development    |
| `expo-doctor`                    | `1.21.6`       | 1.21.6             | development    |
| `prettier`                       | `3.9.10`       | 3.9.10             | development    |
| `tsx`                            | `4.23.15`      | 4.23.15            | development    |
| `typescript`                     | `~6.0.3`       | 6.0.3              | development    |

React Native uses Hermes and its supported modern native architecture by default.
No legacy-architecture escape hatch is configured. SDK 58's config types no longer
accept the old `jsEngine` field; generated iOS properties and both exported `.hbc`
bundles confirm Hermes rather than relying on that obsolete option.

References used to verify setup choices: [Expo project creation](https://docs.expo.dev/get-started/create-a-project/),
[official template options](https://docs.expo.dev/more/create-expo/),
[React Navigation setup](https://reactnavigation.org/docs/getting-started/).
Registry metadata and the installed lockfile, rather than search snippets, establish
the exact versions in this report.

## Files and configuration

| Files                                                              | Purpose                                                                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `package.json`, `package-lock.json`, `.npmrc`, `.nvmrc`            | Private app, compatible dependencies, lockfile, scripts and documented toolchain                                          |
| `index.ts`, `App.tsx`                                              | Explicit Expo root registration and shell composition                                                                     |
| `app.config.ts`                                                    | Android/iOS CNG config, development client plugin, validated environment-specific provisional IDs/schemes; no EAS project |
| `tsconfig.json`                                                    | Strict mode plus unchecked-index, exact-optional, override, fallthrough and unused-code checks                            |
| `eslint.config.js`, `.prettierrc.json`, `.prettierignore`          | Expo flat ESLint config, type-import/no-any/shared-layer rules, formatter and preservation of historical documents        |
| `.gitignore`, `.env.example`                                       | Ignore generated native trees, build output, local env/signing files; placeholder-only public environment selector        |
| `src/app/bootstrap/{environment.ts,config.ts,environment.test.ts}` | Shared config parser for build/runtime, five environment safety tests                                                     |
| `src/app/providers/AppProviders.tsx`                               | Read-only environment context and safe-area provider; no network or persistence                                           |
| `src/app/navigation/RootNavigator.tsx`                             | Typed single-route native stack; no auth/deep-link behavior yet                                                           |
| `src/features/welcome/index.ts`, `presentation/WelcomeScreen.tsx`  | Temporary feature with public export and accessible text                                                                  |
| `src/shared/theme/theme.ts`, `src/shared/ui/Screen.tsx`            | Neutral temporary styling/navigation theme and reusable safe-area shell                                                   |
| `assets/*.png`, `LICENSE.expo-template`                            | Original template artwork and retained Expo template attribution; not WeGlow/Figma brand assets                           |
| `README.md`, `src/README.md`, this report                          | Setup, source ownership, scope, evidence and limitations                                                                  |

The reserved feature/infrastructure/module/plugin/test directories were prepared
locally without empty placeholder files. Git does not track empty directories;
`src/README.md` records ownership so new clones add each directory with real code.
No fake repositories, unused query/session stores or future feature screens were
added. TanStack Query, Zustand, form libraries and protected session storage await
their approved consumers.

`app.config.ts` and runtime bootstrap call the same environment parser. Only
`EXPO_PUBLIC_APP_ENV` is consumed; omission defaults to development, and invalid or
blank values fail without echoing their contents. No credentials are required.
Development/staging/production identifiers are respectively `com.weglow.mobile.dev`,
`com.weglow.mobile.staging`, `com.weglow.mobile`; schemes are
`weglow-development`, `weglow-staging`, `weglow-production`. These are provisional
and must be approved before auth integration or distribution. They do not claim
ownership of the previous Kotlin app ID/signing lineage.

## Installation and verification commands

Repository inspection included `git status --short`, `git log -1 --oneline`, file
inventory, reading the requested documents, and checks for Node, npm, Xcode,
CocoaPods, Java, Android SDK, ADB and emulator tooling.

Installation sequence executed:

```sh
npm view expo version
npm view expo-template-blank-typescript version
npm view create-expo-app version
npm pack expo-template-blank-typescript@58.0.32 --pack-destination /private/tmp
# Extract official template files with a collision-checked Python script;
# customize package/app configuration, preserving README/docs/Git.
npm install
npx expo install expo-dev-client react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/native-stack
npx expo install eslint eslint-config-expo --dev
npm install --save-dev prettier eslint-config-prettier tsx @types/node expo-doctor
npx expo install expo-system-ui
npm install --save-dev @types/node@24
npm audit fix
npm install --save-dev expo-doctor@1.21.6
```

`npm audit fix` used compatible changes only, with no force flag. Node typings were
aligned to Node 24. Expo System UI was added after prebuild identified that Android
light-appearance configuration needs it. Exact lockfile resolution is listed above.
Some network/Gradle/ADB commands required sandbox escalation; no global toolchain
installation was initiated manually.

Initialization corrections: an initial probe of `create-expo-app@5.2.0` returned
ETARGET; verified stable `create-expo-app@5.0.0` then failed with a missing
`@expo/env` dependency. Using the official published template archive avoided
overwriting the existing repository. Expo config's imported validator needed an
explicit `.ts` extension under the Node 24 config loader; TypeScript allows that
extension with no emit. Early typecheck also caught and resolved obsolete
`jsEngine` configuration and missing explicit Node global types.

Expo Doctor 1.21.7 crashed before checks: `TypeError: e.boolish is not a function`.
Its metadata referenced unpublished `@expo/env@2.6.0`; the registry exposed 2.5.4.
Pinning Doctor 1.21.6, whose metadata uses the published dependency, allows checks
to run. No `node_modules` patch or unpublished package is used.

Verification commands executed:

```sh
npm ls --depth=0
npm run check
npm start -- --localhost --port 8088
npx expo install --check
npm run doctor
npx expo config --type public
npx expo prebuild --no-install
npx expo prebuild --no-install --platform ios
npx expo prebuild --no-install --no-clean --platform android
npx expo export --platform android --platform ios --output-dir /private/tmp/weglow-stage3a-export
npm audit --json
git diff --check
```

Native Android build attempted with Android Studio's bundled JDK because shell
`java -version` could not find a system Java runtime:

```sh
JAVA_HOME='/Applications/Android Studio.app/Contents/jbr/Contents/Home' \
ANDROID_HOME=/Users/mac/Library/Android/sdk \
./android/gradlew -p android :app:assembleDebug --no-daemon
```

Initial sandbox attempts could not write the Gradle cache or start ADB; escalated
retries were used. ADB reported no attached devices. `medium_phone` is an existing
AVD, but it was not booted. The first build was interrupted while waiting for the
274 MiB React Native Android debug artifact. A retry with
`-Dorg.gradle.internal.http.socketTimeout=30000` and
`-Dorg.gradle.internal.http.connectionTimeout=30000` completed successfully in
7m 46s. It produced `android/app/build/outputs/apk/debug/app-debug.apk` for the
configured Android ABIs. A final no-clean prebuild synchronized the system-UI
light-mode string after installing its module; an incremental rebuild passed in 16 seconds (378 actionable tasks) to verify
that final generated configuration. Build logs are in
`/private/tmp/weglow-android-build.log` and
`/private/tmp/weglow-android-final-build.log`. No device launch is claimed.

## Verification results

| Check                                        | Observed result                                                                                                      |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Dependency installation / `npm ls --depth=0` | Pass; all direct dependencies resolve, no invalid/missing peers reported                                             |
| Strict TypeScript                            | Pass after configuration corrections                                                                                 |
| ESLint                                       | Pass with zero warnings                                                                                              |
| Prettier                                     | Pass; historical Markdown excluded from rewriting                                                                    |
| Environment tests                            | 5 passed, 0 failed: safe default, allowed selectors, reject invalid selectors, redact error values, immutable output |
| Online Expo dependency compatibility check   | Pass: dependencies up to date                                                                                        |
| Expo config                                  | Pass: correct SDK, both platforms, isolated development identifier/scheme and dev-client plugin                      |
| CNG prebuild                                 | Android and iOS generated successfully without Pods; generated folders remain ignored                                |
| Android Metro/Hermes bundle                  | Pass; native code/device execution not implied                                                                       |
| iOS Metro/Hermes bundle                      | Pass; native code/device execution not implied                                                                       |
| Expo Doctor 1.21.6                           | 19/20 checks passed; only failure is CocoaPods/native tooling missing                                                |
| Android native development build             | Pass: debug APK assembled successfully; no device/emulator launch claimed                                            |
| iOS native build/simulator                   | Blocked by missing full Xcode, `simctl` and CocoaPods; no iOS native build claimed                                   |
| Dependency advisories                        | 10 moderate findings, 0 high/critical; compatible audit fix did not eliminate them                                   |
| Existing docs and Git preservation           | SHA-256 comparison passes for all five original documents; no history changes                                        |

The test suite covers initialization configuration only. No React Native Testing
Library, end-to-end, native inference, auth, backend or device performance tests
exist yet. No coverage percentage or release-readiness claim is made.

A short `npm start -- --localhost --port 8088` smoke check reached Metro's
`Waiting on http://localhost:8088` state and was stopped afterward. A separate
subprocess check confirmed all three environment selectors generate distinct
Android/iOS identifiers and the expected schemes, while an invalid selector fails.

## Native blockers and remaining risks

**iOS verified missing tools:** developer directory is
`/Library/Developer/CommandLineTools`; `xcodebuild -version` requires full Xcode,
`xcrun --find simctl` cannot find the utility, and `pod` is absent from PATH.
Install/select a compatible full Xcode, install an iOS simulator runtime and
CocoaPods (Doctor recommends at least 1.15.2), then run `npm run ios`. These large
system tools were not installed as part of application initialization.

**Android observed toolchain:** Android Studio bundles OpenJDK 25.0.2; the SDK is
`/Users/mac/Library/Android/sdk`. An AVD named `medium_phone` is available. The
generated SDK 58/RN configuration requests Gradle 9.4.1, build tools 37.0.0,
compile SDK 37, target SDK 36, minimum SDK 24, NDK 27.1.12297006 and Kotlin 2.2.10.
At inventory time the SDK had build tools 34.0.0/36.0.0, platforms 34/36/37.0,
no NDK/CMake directories, and no command-line SDK tools directory. The API 37.0
package is not assumed interchangeable with `platforms;android-37`. The Android
build downloaded Gradle 9.4.1 and automatically provisioned NDK 27.1.12297006,
build tools 37.0.0 and CMake 3.22.1 under existing accepted SDK licenses. The build
also used a Gradle-managed Adoptium JDK 17.0.20.1 compiler while Gradle itself ran
with Android Studio's JDK 25. The resulting debug build passed using the resolved
SDK packages; no manual changes were made to the Kotlin reference project.
The generated iOS minimum deployment target is 16.4. These defaults are not yet a
product-approved target-device policy and may rise with future native dependencies.

**Dependency follow-up:** advisories are in glob/minimatch and dependent Expo CLI,
fingerprint and TypeScript ESLint paths. npm's suggested forced fix would downgrade
Expo to SDK 52, so it was not applied. Review compatible upstream fixes before a
release; current checks are not security certification. ESLint 9.39.5 is selected
by Expo but npm marks it unsupported; plan a tested upgrade when the Expo lint
plugin set supports it. Do not force incompatible tooling just to clear warnings.

**AI remains unverified:** no ONNX/TFLite/Nitro/face-detector packages or model
assets are present. SDK 58/RN 0.88 compatibility, native ABI/page-size behavior,
runtime/operator support, CNG plugins, iOS physical execution, model rights,
preprocessing parity, memory/latency and package-size budgets remain later-stage
gates. Development-client scaffolding does not establish these properties.

**Other pending decisions:** approved Figma nodes/tokens/assets, production app
identities/signing, Supabase deployed-state/security inventory, auth links/providers,
protected session storage, privacy/retention and rollout ownership remain deferred.
No changes to those external systems are authorized by this initialization.

## Start and next-stage boundary

On a prepared machine: `nvm use`, `npm ci`, `npm run check`, then
`npm run android` or `npm run ios`. Use `npm start` for an already installed
development client. `.env` is optional in Stage 3A and no real credentials are
needed. See the root README for details.

Stage 3A does not authorize Stage 3B. Further integration, model work or designed
screen implementation must wait for the user's explicit approval.
