# WeGlow Stage 4.0 — Figma UI architecture and implementation audit

Date: 2026-11-13. **Repository audit completed. Actual Figma inspection is blocked by a missing WeGlow file URL/key. Screens successfully inspected in Figma: 0.**

## 1. Scope, evidence and Figma access

Worked only in `/Users/mac/Documents/weglow-react-native` on `main`, initially clean at `f1294f0315ca077afc0c61d0b05ff8849c6edaff`. Read [ARCHITECTURE.md](ARCHITECTURE.md), [MIGRATION_PLAN.md](MIGRATION_PLAN.md), [FIGMA_SCREEN_MAPPING.md](FIGMA_SCREEN_MAPPING.md), current application source/configuration, and the Stage 3A implementation report. The architecture/migration documents are historical proposals: their statements that no app exists describe Stage 2, not today's source tree.

The available Figma integration's `whoami` call succeeded. It reports an authenticated account with a View seat on a Starter plan. This confirms connector authentication only; permission to inspect the WeGlow file has not been tested. No canonical WeGlow Figma URL, file key, node IDs, or exported design references were supplied in this task or found by repository search. The callable file-inspection tools require a target file key; the available tool inventory provides no general account-file search. No file key or node ID was guessed, and no Figma file read/write was attempted against an unrelated file.

A request for the canonical file and relevant page/frame links with inspect/export access was sent to the user. **Design-dependent work stops here pending those references**, as requested. Repository findings and explicitly provisional planning are documented below. Connection success must not be reported as successful design access.

| Actual design inventory field                        | Verified status         |
| ---------------------------------------------------- | ----------------------- |
| Canonical file / revision / relevant pages           | Unknown; links required |
| Actual screen count                                  | Unknown                 |
| Screens successfully inspected                       | **0**                   |
| Actual screen names, frame IDs and dimensions        | Not available           |
| Prototype connections, start points and overlays     | Not available           |
| Variables, component variants, typography and assets | Not inspected           |
| Android/iOS frame differences                        | Not inspected           |

The 28 F01–F28 rows in the existing mapping document are **behavior-based proposals**, not 28 verified Figma screens. A row may ultimately map to several frames, a component state, or no in-scope screen. This audit cannot yet satisfy a complete actual-frame inventory or map every actual Figma screen.

## 2. Existing architecture readiness

**Assessment: usable starter architecture; design implementation is not ready to begin accurately until the actual references and scope are reconciled.** No application change is required to complete this audit.

| Area                  | Verified source / current behavior                                                                                                | Readiness and gap                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry and composition | `index.ts`, `App.tsx`; explicit Expo root, AppProviders, dark status-bar content, RootNavigator                                   | Clear composition root; no Expo Router route tree                                                                                                        |
| Navigation            | `src/app/navigation/RootNavigator.tsx`; typed `RootStackParamList` contains only `Welcome: undefined`; native stack hides headers | Suitable starting point; no auth groups, tabs, modal flows, recovery links or route guards                                                               |
| Providers             | `src/app/providers/AppProviders.tsx`; environment context and SafeAreaProvider                                                    | No session/query/form/store provider; no backend requests or persistence                                                                                 |
| Feature structure     | `src/features/welcome/index.ts` exports the only screen, `presentation/WelcomeScreen.tsx`                                         | Feature public entry pattern exists; other feature implementations absent                                                                                |
| Current screen        | Centered `WeGlow!` heading, accessibility header role, size 32/weight 600                                                         | Placeholder UI; no visual match to Figma is established                                                                                                  |
| Shared theme          | `src/shared/theme/theme.ts`; background `#FFFFFF`, text `#171717`, screen spacing 24; navigation inherits DefaultTheme            | Explicitly neutral initialization styles; no verified brand palette, font scale, radius, elevation or motion tokens                                      |
| Shared components     | `src/shared/ui/Screen.tsx`; SafeAreaView, flex 1, background and fixed horizontal padding 24                                      | One reusable shell; no Button, Input, Card, Header, Dialog, Avatar or feedback component                                                                 |
| Boundaries            | `src/README.md`, strict TypeScript and ESLint                                                                                     | Shared UI imports from app/features/infrastructure are lint-restricted; broader planned domain/data boundaries are conventions, not fully enforced rules |
| Environment           | `src/app/bootstrap/`; validated selector/configuration and five tests                                                             | Useful foundation; no external service integration implied                                                                                               |
| Platform config       | Portrait orientation, light appearance, iPad support enabled, provisional environment-specific IDs                                | Requires design decisions for tablets, orientation, themes and system bars; unchanged in this audit                                                      |

The planned feature owners remain auth, onboarding, home, scan, acne, hairstyles, environment, routines, progress, journal, profile, settings and legal. Create layers when they have real consumers; the planning documents do not mean those implementations exist. Screens should consume feature hooks/contracts, with infrastructure behind adapters. Later visual slices may use clearly labeled fixtures without requiring immediate backend or AI integration.

## 3. Installed libraries and asset inventory

Direct runtime packages were confirmed against local installed manifests:

| Package                                | Installed version | Current UI use                           |
| -------------------------------------- | ----------------- | ---------------------------------------- |
| React / React Native                   | 19.3.0 / 0.88.1   | Native primitives and StyleSheet         |
| Expo                                   | 58.0.23           | Application foundation                   |
| React Navigation native / native-stack | 7.5.1 / 7.21.0    | NavigationContainer and one native stack |
| react-native-safe-area-context         | 5.11.1            | Provider and safe-area screen shell      |
| react-native-screens                   | 4.30.1            | Native screen integration                |
| expo-status-bar                        | 58.0.5            | Dark status-bar content                  |
| expo-system-ui                         | 58.0.7            | System appearance support                |
| expo-dev-client                        | 58.0.18           | Development build workflow               |

No bottom-tabs package, design-system UI kit, SVG renderer, chart package, custom-font loader, form library, animation package, or component-test library is declared as a direct dependency for this app. Some capabilities may exist transitively; that is not an approved direct integration. No library installation is proposed as an automatic result of this audit. First inspect actual designs, then justify any required dependency separately.

The asset directory contains exactly these six PNGs, identified in the existing Stage 3A report as template artwork:

| File                                 | Dimensions  |
| ------------------------------------ | ----------- |
| `assets/icon.png`                    | 1024 × 1024 |
| `assets/splash-icon.png`             | 1024 × 1024 |
| `assets/android-icon-foreground.png` | 512 × 512   |
| `assets/android-icon-background.png` | 512 × 512   |
| `assets/android-icon-monochrome.png` | 432 × 432   |
| `assets/favicon.png`                 | 48 × 48     |

These files do not establish approved WeGlow branding. No bundled font files, UI SVGs, photographs, illustrations, screen exports or Figma source files were found under the current source/assets inventory. Missing _specific_ Figma assets cannot be identified without inspecting the file. Do not replace missing design assets with invented illustrations or use full-screen raster exports as interactive UI.

## 4. Shared UI patterns: verified versus pending

| Pattern                | Current implementation                                                 | Required evidence / proposed owner                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colors and modes       | Neutral two-color shell; remaining navigation colors from DefaultTheme | Inspect semantic variable/style IDs, states, gradients and supported modes; later `src/shared/theme/`                                                |
| Typography             | Default platform font; one explicit heading style                      | Obtain font families/files/weights/licensing, line heights and letter spacing; verify Android/iOS metrics before defining text variants              |
| Spacing/layout         | Fixed horizontal 24 in Screen; centered welcome content                | Inspect auto-layout, gutters, grid, max widths, safe-area assumptions and responsive constraints; separate screen insets from component spacing      |
| Buttons/actions        | None                                                                   | Inspect primary/secondary/destructive/icon variants and pressed/disabled/loading/focus states; proposed `src/shared/ui/Button.tsx`, `IconButton.tsx` |
| Inputs/selection       | None                                                                   | Inspect labels, helper/error text, keyboard types, password controls and selection states; proposed `Input.tsx`, feature selection components        |
| Cards/sections         | None                                                                   | Inspect surfaces, borders, clipping, padding and variants; proposed `Card.tsx`, `SectionHeader.tsx`                                                  |
| Navigation bars        | Stack headers hidden; no tabs                                          | Verify actual header/tab labels/icons/active states and scan action placement; app navigation plus shared Header                                     |
| Feedback/dialogs       | None                                                                   | Verify loading/empty/error/retry, validation and destructive confirmation designs; proposed shared feedback/dialog components                        |
| Icons/imagery          | App/template assets only                                               | Obtain actual source assets, sizes, crop modes, reuse rules, license/provenance and accessibility/decorative intent                                  |
| Charts/overlays/motion | None                                                                   | Inspect whether these exist and their exact interaction/animation contract before selecting a rendering approach                                     |

All proposed primitive names are architecture suggestions, not inspected Figma component names. No brand color, font, spacing scale, radius or motion duration is invented here.

## 5. Provisional screen-to-source mapping and implementation order

This table carries forward **all existing behavior rows**, with proposed paths and per-screen acceptance concerns. It is not an actual Figma inventory. **For every row, actual frame name, file/node URL, frame ID, dimensions and prototype connections are pending access.** Only Welcome currently exists. Paths are relative to the repository and are proposed unless explicitly marked existing. Modal/inline states should remain components if the actual design does not warrant routes.

Sequence: first reconcile Figma and approve scope; then derive tokens/shared primitives; then phases P1–P6 below. Deferred items remain outside implementation. Each screen also needs the common acceptance criteria in section 7.

| ID  | Proposed screen / path                                                                                          | Sequence                                 | Additional acceptance criteria                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | Bootstrap: `src/features/auth/presentation/BootstrapScreen.tsx` or an inline gate                               | P2                                       | Distinguish restore/profile failure from incomplete onboarding; retry accessible; final route decisions follow approved state contracts |
| F02 | Welcome: `src/features/welcome/presentation/WelcomeScreen.tsx` **existing placeholder**                         | **P1: recommended first screen**         | Approved logo/imagery/copy and entry actions match the actual frame; legal links and focus order verified; no fabricated branding       |
| F03 | Login: `src/features/auth/presentation/LoginScreen.tsx`                                                         | P2                                       | Keyboard-safe form, validation/loading/error and OAuth-cancel states; visual fixtures separate from real authentication                 |
| F04 | Signup: `src/features/auth/presentation/SignupScreen.tsx`                                                       | P2                                       | Required fields, password rules, error placement and consent copy approved; large-text layout verified                                  |
| F05 | Confirm email: `src/features/auth/presentation/ConfirmEmailScreen.tsx`                                          | P2                                       | Awaiting/resend/throttled/expired states distinct; return-to-login behavior specified                                                   |
| F06 | Recovery request: `src/features/auth/presentation/ForgotPasswordScreen.tsx`                                     | P2                                       | Neutral sent state, input/loading/retry; approved non-enumerating copy                                                                  |
| F07 | Set password: `src/features/auth/presentation/ResetPasswordScreen.tsx`                                          | P2                                       | Verifying/invalid/expired/update/success states; visual work does not claim verified recovery integration                               |
| F08 | Onboarding: `src/features/onboarding/presentation/OnboardingScreen.tsx`, step components                        | P2                                       | Actual step count/order, progress/back/skip and save-failure states mapped; option labels/product decisions approved                    |
| F09 | Home: `src/features/home/presentation/HomeScreen.tsx`                                                           | P3                                       | Approved composition/tabs and partial/loading/empty/stale/error states; placeholder data clearly labeled in development                 |
| F10 | Scan chooser: `src/features/scan/presentation/ScanModeScreen.tsx`                                               | P4                                       | Mode descriptions and entry/exit actions approved; local-processing wording reflects actual planned behavior                            |
| F11 | Capture: `src/features/scan/presentation/ScanCaptureScreen.tsx`                                                 | P4                                       | Permission/denial/cancel/retake states and platform chrome designed; static visual slice does not add camera integration                |
| F12 | Review/validation: `src/features/scan/presentation/ScanReviewScreen.tsx` or inline feedback                     | P4                                       | Correct mode-specific invalid-image/face states and retake/back actions; avoid invented universal face gates                            |
| F13 | Analysis: `src/features/scan/presentation/ScanAnalyzingScreen.tsx` or status component                          | P4                                       | Cancel/background/error states specified; no timer presented as measured inference percentage                                           |
| F14 | Acne result: `src/features/acne/presentation/AcneResultScreen.tsx`                                              | P4                                       | Concern counts, zero/unavailable states, overlay fit and save statuses approved; no accuracy/diagnosis claims                           |
| F15 | Face-shape result: `src/features/hairstyles/presentation/FaceShapeResultScreen.tsx`                             | P4                                       | Shape/confidence wording and offline/unsaved/error states; no invented hairstyle match percentage                                       |
| F16 | Hairstyle list/detail: `src/features/hairstyles/presentation/HairstylesScreen.tsx`, `HairstyleDetailScreen.tsx` | P5                                       | Confirm whether detail is a separate frame; empty/offline/image-failure and real catalog aspect ratios covered                          |
| F17 | Routine: `src/features/routines/presentation/RoutineScreen.tsx`                                                 | P5                                       | AM/PM/day/checked/pending/error/no-plan states; completion actions have clear feedback                                                  |
| F18 | Journal: `src/features/journal/presentation/JournalScreen.tsx`                                                  | P6                                       | Empty/edit/save/failure, keyboard layout and approved local-only retention copy                                                         |
| F19 | Progress: `src/features/progress/presentation/ProgressScreen.tsx`                                               | P5                                       | Empty/incompatible/unavailable/worsening states; charts have text equivalents and truthful labels                                       |
| F20 | Environment: `src/features/environment/presentation/EnvironmentScreen.tsx`                                      | P6                                       | Source/time/stale/fallback/current-vs-daily-max labels; history provider/range decision before chart acceptance                         |
| F21 | Profile/edit: `src/features/profile/presentation/ProfileScreen.tsx`, `EditProfileScreen.tsx`                    | P6                                       | Form/avatar/legacy values and image-permission/failure states; approved image sources and crop rules                                    |
| F22 | Settings: `src/features/settings/presentation/SettingsScreen.tsx`                                               | P6                                       | Only supported actions; logout/reauth/pending/failure behavior and platform settings links specified                                    |
| F23 | Delete account: `src/features/settings/presentation/DeleteAccountScreen.tsx` or confirmation component          | P6                                       | Confirmation, reauth, pending, partial failure/retry and completion focus semantics                                                     |
| F24 | Legal: `src/features/legal/presentation/PrivacyScreen.tsx`, `TermsScreen.tsx`                                   | P1 alongside entry flow, then P2 routing | Approved content/version, scrolling/text scaling and signed-out/in destinations                                                         |
| F25 | Discover/detail: future `src/features/commerce/presentation/DiscoverScreen.tsx`, `ProductDetailScreen.tsx`      | Deferred                                 | Product scope approval and actual design/backend contract required; do not implement from this proposal                                 |
| F26 | Saved/cart: future `src/features/commerce/presentation/SavedProductsScreen.tsx`, `CartScreen.tsx`               | Deferred                                 | Scope/ownership/quantity/conflict semantics required; no implied checkout                                                               |
| F27 | Chat: no implementation path assigned                                                                           | Excluded functional feature              | Existing scope retires functional chat; reconcile any Figma placeholder before adding a route                                           |
| F28 | Orders/checkout/payment: no implementation path assigned                                                        | Excluded                                 | Separate product/backend/payment architecture decision required                                                                         |

Recommended first screen is **Welcome (F02)** after the canonical frame is inspected, because it already has a route and isolates initial font, spacing, logo, safe-area and action patterns without requiring AI/backend behavior. This recommendation does not assert that Figma contains a frame named Welcome; if its actual entry flow differs, revise this first slice before coding.

### Navigation evidence and future reconciliation

**Existing verified connection:** RootNavigator renders Welcome only. No other entry/exit connection is implemented or design-verified.

**Architecture proposal only:** bootstrap resolves signed-out/recovery/authenticated state; auth leads to onboarding or the main app. Proposed main tabs are Home/Routine/Progress/Profile, with Scan as a separate action and result/hairstyle flows on stacks. Settings/legal and recovery entry points need explicit accessibility/back behavior. None of these are confirmed Figma prototype connections, and bottom-tabs is not currently a direct dependency. Determine the actual graph from design and approved behavior before changing navigation.

For each actual frame, capture: file URL/revision/page, exact frame name and ID, width/height, state/variant/platform, entry/exit prototype node IDs and trigger/action, route/typed parameters, proposed source path, token/component/style IDs, assets and export settings, interactions, missing behavior states, and design owner/sign-off. Record overlays/components separately from route screens. Include every relevant page and note excluded/archive frames explicitly, so inventory completeness can be assessed.

## 6. Missing references, risks and decisions

| Area                      | Evidence / risk                                                                                | Needed decision or evidence                                                                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design access             | Connected account, missing target file                                                         | Canonical file and relevant page/frame links; verify inspect/export access and revision                                                                                     |
| Scope                     | F01–F28 are provisional and include deferred features                                          | Reconcile actual designs with release scope; decide handling of design-only commerce/chat/payment content                                                                   |
| Branding/fonts/assets     | Only template PNGs and system fonts                                                            | Approved logo variants, font files/weights/licenses, icons, imagery and export rights; inspect actual file before naming individual missing assets                          |
| Responsive layout         | Screen hardcodes a 24-unit inset; no scrolling/keyboard variants                               | Define inset ownership, edge-to-edge sections, scroll behavior, min/max widths and small-screen rules from designs                                                          |
| Platform text             | Default Android/iOS fonts differ; no font-loading/error handling                               | Agree fonts and line-height/baseline behavior; test text scaling and localized/long copy                                                                                    |
| System UI/navigation      | Dark status-bar content, hidden headers, safe-area wrapper                                     | Confirm system bar colors/insets, Android back, iOS back gestures, keyboard avoidance and modal dismissal                                                                   |
| Tablets/orientation/modes | iPad support enabled, portrait/light configured                                                | Confirm tablet scope and layout; whether designs require other orientations or dark mode; no configuration change here                                                      |
| Vector/effects/motion     | No direct SVG/chart/motion integration                                                         | Actual unsupported elements cannot yet be identified. Inspect effects/masks/vectors/blur/charts/prototypes; choose native rendering or approved adaptation after inspection |
| Accessibility             | One accessible heading; no component-state coverage                                            | Agree labels, focus order, contrast, minimum touch targets, reduced motion, loading announcements and text alternatives                                                     |
| iOS QA                    | Current developer directory is CommandLineTools; `simctl` unavailable; `pod` not found on PATH | Restore full iOS development tooling/device test route before claiming Android/iOS visual acceptance; no installs/builds in this audit                                      |
| Product content/data      | Backend and AI integrations absent on main                                                     | Approved copy/state contracts and clearly identified development fixtures; runtime/backend completion is a later integration gate                                           |

No actual Figma element has been classified as unsupported, because none has been inspected. Capability gaps above are items to check, not invented features or reasons to install packages now.

## 7. Acceptance criteria for later implementation

Before each screen begins, its actual frame/variant links and revision, in-scope behavior, assets, token values and navigation destinations must be recorded. Missing error/loading/empty states should be resolved with the designer/product owner rather than extrapolated into a claimed Figma specification.

For each future screen:

1. Compare Android and iOS screenshots with the inspected frame at its actual reference viewport; document approved platform differences. Agree the visual review tolerance before calling a screen complete.
2. Verify responsive constraints and scrolling at smaller/larger approved viewports and increased text size. Candidate phone QA widths of 320/360/390/430 logical units are a proposed stress set, not Figma dimensions or an approved device policy; select the final matrix with the design owner. Include iPad only after its scope is decided.
3. Verify correct font weight/line height, spacing, icon/asset aspect and crop mode, safe areas, status/navigation bars and keyboard behavior. Use native layout and interactive controls; preserve semantics instead of flattening the design.
4. Exercise approved pressed/disabled/loading/focus/validation/empty/error/retry states. Check TalkBack/VoiceOver order and labels, touch targets and text alternatives on actual platform builds.
5. Validate entry/exit actions, Android back and iOS gestures against the approved graph, using typed stable IDs for parameters. Keep visual fixtures and service integration acceptance separate.
6. Pass TypeScript/lint and relevant component/interaction checks once those implementations/test tools exist; record screenshot/device evidence and designer sign-off. Existing bootstrap tests do not establish screen acceptance.

## 8. Checks and completion status

Executed in main during this audit: `npm run typecheck` **passed**, `npm run lint` **passed**, and `npm test` **passed all five bootstrap/environment tests**. No new tests were added and no UI, native build or visual/device QA ran. The new report was checked with the existing Prettier binary and `git diff --check`.

Only this report is added. No screens, dependencies, navigation, native configuration, Supabase or AI integration changed. No original Kotlin or experimental-worktree access/modification was needed for this audit; no merge or push occurred.

**Next required input:** canonical WeGlow Figma file URL plus relevant page/frame links with inspect/export access, or exported design references if file access cannot be granted. Exports can support visual inspection but may omit variable IDs, exact measurements and prototype connections; mark those fields unverified until source evidence is provided. Actual screen inventory, design-derived patterns, verified per-frame mappings and final implementation ordering remain blocked on that input.
