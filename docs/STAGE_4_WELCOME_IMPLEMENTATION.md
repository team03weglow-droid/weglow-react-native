# WeGlow Stage 4.1 — Welcome screen implementation

Date: 2026-11-13. Reference: [Final design, Welcome `1779:73`](https://www.figma.com/design/Ks5fX8kvgJ6wzwM0uOvsUj/WeGlow?node-id=1779-73).

## Implementation

Replaced the temporary WeGlow heading with the audited Welcome layout: the black **A** badge and WEGLOW wordmark, blank hero spacing, radial blue-to-white background, eyebrow, Inter heading, Instrument Serif italic second line, descriptive copy, primary **Begin setup** button, underlined **Explore before setup** action and disclaimer. No hero artwork, product copy or alternate branding was invented. The recorded Figma hero slot is empty.

Both actions display a native alert titled **Development preview**, naming the selected action and stating that it is not connected and that the preview stays on Welcome. No route, onboarding, guest session, authentication or persistence is created. RootNavigator remains unchanged.

Used a safe-area screen, ScrollView and naturally wrapping text. Content has a maximum width of 400, a minimum layout height of 640, 24-unit brand inset, 28-unit content inset, 32-unit bottom padding and a 232-unit empty hero slot. On shorter screens or increased font size the screen scrolls instead of clipping content. All ordinary text honors system text scaling; the decorative logo mark/wordmark retain their intrinsic size and expose a single **WeGlow** accessibility label. Heading and action semantics, action hints, pressed feedback and at least 44-unit action targets are included.

Font loading shows an accessible activity indicator; failure shows a clearly identified loading error and Retry. The screen waits for the fonts rather than rendering an inaccurate system-font replacement as the finished design.

## Changed files

| File                                                  | Purpose                                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/features/welcome/presentation/WelcomeScreen.tsx` | Responsive layout, radial gradient, font-loading/retry states, primitive chevron and safe preview actions |
| `src/shared/theme/fonts.ts`                           | Font aliases and local asset sources required by Welcome                                                  |
| `src/shared/ui/Screen.tsx`                            | Optional style prop; Welcome can own its per-section insets without doubling the shell's existing padding |
| `package.json`, `package-lock.json`                   | Direct SDK-compatible `expo-font` **58.0.12** dependency (`~58.0.12`)                                     |
| `assets/fonts/inter/`                                 | Unmodified Inter Regular, SemiBold, Bold TTFs and upstream license                                        |
| `assets/fonts/instrument-serif/`                      | Unmodified Instrument Serif Italic TTF and upstream license                                               |
| `assets/fonts/manifest.json`                          | Source URLs, original font names/weights, sizes and SHA-256 hashes                                        |
| This report                                           | Implementation evidence, differences and preview instructions                                             |

Pre-existing Stage 4 audit/inventory/status changes were preserved. No application/native configuration, navigation, AI, Supabase or authentication files changed. No experimental-worktree/Kotlin changes, commit, merge or push occurred.

## Fonts and dependency provenance

Inter **4.1** static TTFs came from the [Inter creator's official release](https://github.com/rsms/inter/releases/tag/v4.1): Regular 400, SemiBold 600 and Bold 700. Instrument Serif Italic 400 and its license came from [Google Fonts' Instrument Serif directory](https://github.com/google/fonts/tree/main/ofl/instrumentserif). Both distributions include the **SIL Open Font License 1.1**, retained beside their files. The four unmodified font files total **1,323,404 bytes**; their internal family/style/weight fields and hashes were checked. No Google Fonts or icon npm package was installed.

Expo's local SDK compatibility map specified `expo-font ~58.0.11`; the online Expo installation resolved compatible **58.0.12** and saved `~58.0.12`. The lockfile already contained the identical version/integrity nested under Expo; installation hoisted it to a direct dependency. No other existing locked package version changed.

The first sandboxed install could not reach npm; the approved network retry installed the package. Expo then exited with a request to add its font config plugin to dynamic `app.config.ts`. That build-time embedding plugin was deliberately not added: this screen uses runtime `useFonts`, which is a supported [Expo Font loading approach](https://docs.expo.dev/versions/latest/sdk/font/). Expo config still lists only `expo-dev-client`. The existing main-project Android APK already contained ExpoFontLoader, so it was reused for verification without an APK rebuild.

## Differences and limits

- **Chevron:** the exact Figma SVG remains unavailable because the connector still returns its Starter-plan call-limit error. As explicitly authorized, a small rotated border shape approximates the chevron within the audited 16 × 16 slot. Stroke caps/geometry may differ from the original SVG.
- **Reference freshness:** the implementation uses the previously captured high-fidelity Welcome context and the saved audit/inventory. A new Figma context request was quota-blocked; a fresh side-by-side screenshot comparison is pending.
- **Typography:** real licensed font families and required weights are bundled. The exact revision of Inter used inside Figma was not recorded, so platform shaping/metrics or upstream font-version differences can remain. Android's decorative badge line box is 20 units to avoid clipping its italic glyph, versus the 16-unit Figma text line box.
- **Responsive behavior:** original forced line breaks are replaced by native wrapping. The disclaimer can wrap to two lines. The secondary action reserves at least 44 units for touch accessibility; this changes the original link-row spacing. System insets and taller/shorter layouts alter vertical positions relative to the static Figma viewport.
- **Gradient/effects:** the installed RN 0.88.1 implements radial backgrounds on Android and iOS. This screen uses `experimental_backgroundImage` with the audited stop colors, 65%/20% center and 721.22-unit radius, plus the source CTA shadow. The outer Figma canvas/device shadow is omitted. Native cross-platform rendering is not a pixel-equivalence claim.
- **Artwork:** none is missing for the recorded empty hero slot. Adding a sphere/illustration later requires an actual approved reference; no placeholder artwork was introduced.
- **Platforms:** Android rendering is verified below. iPhone visual/interaction QA has not been performed; local iOS simulator builds remain blocked by the previously recorded missing full Xcode/simulator/CocoaPods setup.

## Preview instructions

### Android development client

The main project's existing APK was reused, not rebuilt:

`android/app/build/outputs/apk/debug/app-debug.apk`

The isolated main-project Metro preview is on **8088**. For a fresh terminal/session:

```sh
cd /Users/mac/Documents/weglow-react-native
./node_modules/.bin/expo start --dev-client --localhost --port 8088
```

If that port is already serving this project, reuse it. With an Android emulator/device running and this compatible development APK installed, run in another terminal:

```sh
/Users/mac/Library/Android/sdk/platform-tools/adb reverse tcp:8088 tcp:8088
/Users/mac/Library/Android/sdk/platform-tools/adb shell am start \
  -a android.intent.action.VIEW \
  -d 'weglow-development://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8088' \
  com.weglow.mobile.dev
```

With multiple devices, add `-s <serial>` after `adb`. Development builds lacking ExpoFontLoader need a compatible new build before loading this screen; the APK verified here already includes it. No rebuild was needed in this stage.

### Physical iPhone with Expo Go

This main branch has no custom AI runtime imports, and Expo Font supports Expo Go. Use an **Expo Go build compatible with SDK 58**, on the same Wi-Fi as this Mac. Start a separate LAN preview so it does not conflict with the Android server:

```sh
cd /Users/mac/Documents/weglow-react-native
./node_modules/.bin/expo start --go --lan --port 8087
```

Scan the displayed QR code with the iPhone Camera and open it in Expo Go. Allow local-network access if prompted. This is a preview route, not verified iPhone execution. If the installed Expo Go does not support SDK 58, a compatible Expo Go or development build is required; no SDK downgrade or native configuration change is included here. A development-client iPhone preview instead requires an already installed compatible client and `--dev-client --lan`. Local iOS compilation requires the missing full Xcode/tooling and device signing setup.

On each platform check both development notices, small-screen scrolling and larger text; dismiss the native notice with **OK**. The buttons intentionally stay on Welcome.

## Validation results

| Check                               | Result                                                                                                                                                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                          | **PASS** (`npm run typecheck`); corrected use of a removed StyleSheet helper during implementation                                                                                                                                |
| ESLint                              | **PASS**, zero warnings                                                                                                                                                                                                           |
| Available tests                     | **PASS**, all 5 existing bootstrap/environment tests; no component-test library was added                                                                                                                                         |
| Targeted Prettier / Git whitespace  | **PASS**                                                                                                                                                                                                                          |
| Font identity/integrity             | **PASS**, four internal family/style/weight checks and all manifest byte lengths/SHA-256 hashes                                                                                                                                   |
| Dependency change review            | **PASS**, only direct expo-font hoisting/addition; no other existing locked package version changed                                                                                                                               |
| Config/navigation preservation      | **PASS**, `app.config.ts` and RootNavigator match HEAD; Expo config contains only the original dev-client plugin                                                                                                                  |
| Android native render               | **PASS**, existing main-project APK on Android 16 / arm64 emulator-5554, using Metro 8088; custom fonts and radial background rendered without rebuilding                                                                         |
| Begin setup                         | **PASS**, observed native Development preview notice explicitly naming Begin setup; Welcome route retained                                                                                                                        |
| Small-screen / text scaling         | **PASS**, temporarily used 840 × 1800 physical resolution at 420 dpi (320 logical units wide), with Android font scale **2.0**; inspected top/bottom screenshots and verified both actions/disclaimer were reachable by scrolling |
| Explore before setup                | **PASS**, tapped at the small/large-text layout and asserted its distinct Development preview message in the accessibility hierarchy                                                                                              |
| iPhone/device visual parity         | **NOT TESTED**, preview instructions supplied above; no full Xcode/iOS build capability is claimed                                                                                                                                |
| Fresh Figma side-by-side comparison | **BLOCKED**, connector Starter-plan quota; saved audited measurements used                                                                                                                                                        |

The emulator's original font scale **1.0** and physical resolution **1080 × 2400** were restored after the responsive check. Normal Welcome was reopened. The existing main-project APK installation and runtime font rendering succeeded; no native module fix or APK rebuild was needed.

Local ignored verification artifacts are under `artifacts/stage4-welcome/`: normal screenshot/hierarchy, small-screen large-text top/bottom screenshots/hierarchies, each action's notice hierarchy and evaluated Expo config. The Android emulator was run headlessly for verification; the main-project Metro server remains on port 8088 for review. Figma artwork/screenshots were not used as UI assets.
