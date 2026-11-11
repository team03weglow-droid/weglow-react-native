# weglow-react-native

WeGlow 2.0 mobile application. Stage 3A initializes Expo development builds and a
strict TypeScript foundation for Android and iOS. The only screen is a temporary
welcome displaying **WeGlow 2.0**.

## Local setup

Use Node **24.20.0** (`nvm use`) and npm **11.19.0**. Install the lockfile exactly:

```sh
npm ci
npm run check
```

No credentials or `.env` file are needed for this stage. The environment defaults
to `development`. Optionally copy `.env.example` to `.env`; the only active setting
is `EXPO_PUBLIC_APP_ENV=development` (`staging` and `production` are also valid).
Invalid or blank selectors fail validation. Public environment variables are
embedded in the app and must never contain secrets. No Supabase client exists.

## Run a development build

Expo Go is not the development target. Install native prerequisites first:

- Android: Android Studio, an SDK compatible with the selected Expo/RN versions,
  its required build tools/NDK, Java supported by Gradle, and a device/emulator.
  Export `ANDROID_HOME` and `JAVA_HOME` if they are not already configured.
- iOS: macOS, full Xcode selected as the developer directory, an installed simulator
  runtime, and CocoaPods. Xcode Command Line Tools alone are insufficient.

```sh
npm run android
# Or, on a fully configured Mac:
npm run ios
```

These commands generate native projects when absent, compile a development client,
and start Metro. For an already installed development client:

```sh
npm start
```

Native dependency/configuration changes require rebuilding the client. Use
`npm run prebuild -- --no-install` to generate both native projects without
installing Pods. `android/` and `ios/` are ignored CNG outputs: change app config or
future local modules/config plugins, then regenerate. Do not hand-maintain generated
native sources. Switching the build environment requires regenerating and rebuilding;
do not serve another environment's bundle to an installed client.

The configured application identifiers and schemes are provisional and separate
development from the legacy app. No EAS project, hosted build, signing account or
production deployment is configured. Store identifiers require approval.

## Checks

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run doctor
npx expo install --check
```

`npm run check` runs typecheck, lint, formatting and tests. `npm test` currently runs
five Node test-runner cases for environment safety using `tsx`; it is not native/UI
or model coverage. `npm run lint:fix` and `npm run format` are explicit formatting
commands. Historical audit/planning documents are excluded from automatic formatting
so they remain unchanged.

See [the source layout](src/README.md) and the
[Stage 3A implementation report](docs/STAGE_3A_IMPLEMENTATION.md) for selected
versions, exact verification results, native prerequisites and remaining risks.
The [architecture](docs/ARCHITECTURE.md), [migration plan](docs/MIGRATION_PLAN.md)
and [Figma mapping](docs/FIGMA_SCREEN_MAPPING.md) remain planning references.

Stage 3B is not approved. AI runtimes/models, backend connections, authentication,
Figma screens and deployment remain deferred. The original Expo template license
is retained in `LICENSE.expo-template`; this private application declares no public
distribution license.
