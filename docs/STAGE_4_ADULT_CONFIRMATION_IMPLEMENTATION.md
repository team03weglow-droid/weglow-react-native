# WeGlow Stage 4.2 — Adult Confirmation implementation

Date: 2026-11-13. Repository: `/Users/mac/Documents/weglow-react-native`, branch `main`. Implementation is uncommitted.

## Result

Welcome's **Begin setup** now opens Adult Confirmation through the existing typed native stack. The confirmation starts unchecked. Continue is disabled until checked, and its handler also guards against unconfirmed state. Continue shows a **Development preview** alert explaining that the questionnaire is not implemented, confirmation is not saved or verified, and the current screen remains open. No questionnaire route exists.

The visible back action and Android hardware back return to Welcome. A subsequent visit starts unchecked. Confirmation exists only in the mounted screen's memory; there is no storage, date-of-birth collection, identity verification, authentication or backend integration. Explore before setup still explicitly displays a development-preview alert on Welcome.

## Design evidence and differences

Reference: [Final design, frame 1781:122](https://www.figma.com/design/Ks5fX8kvgJ6wzwM0uOvsUj/WeGlow?node-id=1781-122), audited at **390 × 840**. Read the [Stage 4 audit](STAGE_4_UI_AUDIT.md), [inventory](STAGE_4_FIGMA_INVENTORY.json), architecture and current Welcome implementation.

A fresh connected Figma `get_design_context` request failed with: **“You've reached the Figma MCP tool call limit on the Starter plan. Upgrade your plan for more tool calls.”** Account inspection confirmed Starter/View. This is a connector quota limitation. The implementation uses the previously captured frame content, typography, palette, radii and layout metadata; fresh screenshot comparison and exact visual parity remain unverified.

Implemented the back control, step counter, 18+ badge, eyebrow, two-line heading, explanatory copy, confirmation card, checkbox, session hint and Continue control. The audited Plus Jakarta Sans sizes, line heights and weights are used. The frame's AURA / SKIN wording is preserved verbatim; reconciling that branding with WeGlow remains a product/design decision.

Differences and limits:

- Back and forward chevrons and the checkmark use React Native borders rather than unavailable exact vector exports.
- A solid `#F1F6F9` background and subtle approximate shadows are used. The stored palette does not provide complete per-node paint/shadow bindings; these need visual review when Figma access returns.
- Back's touch target is 44 × 44 rather than the audited 40 × 40. The whole confirmation card is interactive; Continue is at least 53 high.
- Safe-area insets, a centered maximum-width layout, flexible height and scrolling replace the fixed mock-phone canvas. Copy wraps naturally on narrow displays and at larger font settings. Decorative badge text stays fixed-size; meaningful copy and control labels scale.
- No hero imagery or new branding assets were invented. Exact icon exports and fresh design comparison remain outstanding; no known font is missing for this screen.

## Changed files in this stage

| File                                                                  | Purpose                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `src/features/onboarding/index.ts`                                    | Public screen export                                                      |
| `src/features/onboarding/presentation/AdultConfirmationScreen.tsx`    | Accessible, responsive screen, font loading/retry and preview alert       |
| `src/features/onboarding/presentation/adultConfirmationState.ts`      | Ephemeral confirmation transitions and guarded preview outcome            |
| `src/features/onboarding/presentation/adultConfirmationState.test.ts` | Four focused confirmation tests                                           |
| `src/app/navigation/routes.ts`                                        | Shared typed Welcome/AdultConfirmation route definitions                  |
| `src/app/navigation/routes.test.ts`                                   | Three focused stack-router tests                                          |
| `src/app/navigation/RootNavigator.tsx`                                | Register screen and inject navigation callbacks                           |
| `src/features/welcome/presentation/WelcomeScreen.tsx`                 | Connect Begin setup; retain explicit Explore preview                      |
| `src/shared/theme/fonts.ts`                                           | Add Jakarta aliases and bundled font map                                  |
| `assets/fonts/plus-jakarta-sans/`                                     | Official static weights 400, 500, 600, 700, 800 and OFL license           |
| `assets/fonts/manifest.json`                                          | Source URLs, byte sizes, SHA-256 and upstream Git blob IDs                |
| `package.json`                                                        | Extend the existing Node test command; no dependency changes in Stage 4.2 |
| `docs/STAGE_4_ADULT_CONFIRMATION_IMPLEMENTATION.md`                   | This report                                                               |

Fonts are unmodified upstream assets from [Tokotype's Plus Jakarta Sans repository](https://github.com/tokotype/PlusJakartaSans), distributed under SIL Open Font License 1.1, included locally. All nine existing/new font files were checked against their manifest byte sizes and SHA-256 hashes. New static TTF weight tables were checked for 400/500/600/700/800.

Pre-existing uncommitted Stage 4 audit, Welcome implementation, Screen safe-area changes, Inter/Instrument Serif fonts, package lock and expo-font dependency were preserved. This stage adds no dependency or native configuration changes. The Stage 4.1 report's historical Begin setup preview behavior is superseded by this stage.

## Validation

| Check                                                                  | Result                                                                                                                                                                                         |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                                    | PASS                                                                                                                                                                                           |
| `npm run lint`                                                         | PASS, zero warnings                                                                                                                                                                            |
| `npm test`                                                             | PASS, all 12 tests: 5 environment, 3 navigation, 4 confirmation                                                                                                                                |
| Targeted Prettier check of Stage 4.2 source, manifest and package file | PASS                                                                                                                                                                                           |
| `git diff --check`                                                     | PASS                                                                                                                                                                                           |
| Repository-wide `npm run format:check`                                 | FAIL: pre-existing formatting in `docs/STAGE_3A_PROGRESS.md`, `docs/STAGE_3B_AI_FEASIBILITY.md`, `docs/STAGE_3B_DEPENDENCY_COMPATIBILITY.md`, `docs/WeGlow_Progress_Report.md`; left unchanged |
| Android runtime interactions                                           | PASS on existing Android 16 arm64 `medium_phone` emulator, existing development APK; no rebuild                                                                                                |
| Android narrow/large-text inspection                                   | PASS: 840 × 1800 physical pixels at 420 dpi (320 dp wide), font scale 2.0; text wraps and card/Continue are reachable by scrolling                                                             |
| iPhone runtime / VoiceOver / TalkBack                                  | Not run; no claim of platform or assistive-technology parity                                                                                                                                   |

Android UI hierarchy assertions verified unchecked/disabled initial state, tapping disabled Continue does nothing, checked/enabled state, Continue's preview notice, unchecking disables again, visible back, confirmation reset on re-entry, hardware back, and Explore's notice without navigation. Screenshot inspection covered normal and narrow/large-text layouts. Emulator font scale was restored to 1.0 and display size to its original 1080 × 2400. The Expo developer tools overlay is present in debug screenshots and is not application UI.

Evidence is local and ignored under `artifacts/stage4-adult/`: UI hierarchy XML captures, `unchecked.png`, `narrow-large-top.png` and `narrow-large-bottom.png`. The existing test setup runs pure state and actual React Navigation stack-router tests; it has no mounted React Native component test harness. Runtime Android checks supplement that limitation.

## Preview on Android

From the repository root, use the already installed compatible development build and an existing emulator/device:

```sh
./node_modules/.bin/expo start --dev-client --localhost --port 8088
```

In a second terminal, with one Android device connected:

```sh
adb reverse tcp:8088 tcp:8088
adb shell am start -a android.intent.action.VIEW -d 'weglow-development://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8088' com.weglow.mobile.dev
```

Use the Android SDK `platform-tools/adb` absolute path if `adb` is not on PATH. Reuse the existing Metro process if port 8088 is already serving this checkout. Tap Begin setup, toggle the checkbox, inspect Continue's notice, return and re-enter to confirm reset. No rebuild is required for these JavaScript and bundled-font changes with the existing font-capable APK.

## Preview on iPhone

This machine currently selects Command Line Tools rather than full Xcode, so a local iOS simulator/native-build preview was not run. On a physical iPhone with an Expo Go version supporting the project's SDK 58, connect phone and Mac to the same Wi-Fi and run:

```sh
./node_modules/.bin/expo start --go --lan --port 8087
```

Scan the displayed QR code using the iPhone camera and open it in Expo Go. If the installed Expo Go does not support SDK 58, use a separately provisioned compatible iOS development build; none was created in this stage. Verify the safe areas, large Dynamic Type settings, checkbox announcement, disabled button announcement, back behavior and preview notice on device before accepting iPhone visuals/accessibility.

No commit, merge, push, native rebuild, questionnaire, persistence or production integration was performed.
