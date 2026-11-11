# WeGlow 2.0 — Architecture proposal

Date: 2026-11-11. Status: Stage 2 planning; awaiting approval. No application, native project, model, or infrastructure changes are authorized by this document.

## 1. Evidence and scope

**Verified in this repository:** the existing [Stage 1 audit](SYSTEM_AUDIT.md) was read in full. This repository has no React Native application or package manifest. The audit was already untracked when Stage 2 began; preserve it as supplied.

**Audit-verified facts:** statements below marked **Audit fact** inherit the source/check evidence and limitations of the audit, rather than claiming a new inspection or runtime test. Its source links point to the separate Kotlin reference project. **Documentation fact** means confirmed in the linked official documentation on this planning date; it does not prove compatibility in WeGlow. **Proposal** means a recommended future implementation. **Open** means evidence or a decision is still required. Unless explicitly labeled otherwise, all architectural choices below are proposals.

**Audit facts:** Android uses local ONNX acne inference and local LiteRT face-shape inference; Supabase stores derived results and serves hairstyle recommendations. Release/staging disable commerce/demo; chat returns 410; checkout/orders are absent. SQL defines ownership policies, private images, routine RPCs and deletion, but hosted deployment was not verified. See audit sections 1, 3–8.

**User-provided facts:** completed Figma designs and existing backend/API/model assets are available. No Figma URL, node inventory, hosted schema inventory, or target device matrix was supplied in this stage. No claim is made that designs have been inspected, hosted policies tested, or either model executed on iOS.

Proposed first release: authentication/recovery, onboarding, Home/environment, both scans, hairstyle recommendations, product-independent routines, progress, local journal, profile/settings/legal/account deletion. Commerce, chat, orders, payments and continuous background monitoring require separate scope approval. The [screen mapping](FIGMA_SCREEN_MAPPING.md) makes design reconciliation explicit.

## 2. Setup decision: Expo development builds first

**Recommendation:** React Native + strict TypeScript, Expo development builds, Continuous Native Generation (CNG), Hermes and the React Native architecture supported by the selected Expo SDK. Prove both AI pipelines in an early native feasibility slice before committing to the SDK/runtime matrix. Expo Go cannot host our arbitrary native AI integrations.

**Documentation facts:** development builds support custom native libraries; CNG regenerates native projects from app configuration, modules and config plugins. Native dependency/configuration changes require a new binary. Sources: [development builds](https://docs.expo.dev/develop/development-builds/introduction/), [CNG](https://docs.expo.dev/workflow/continuous-native-generation/).

| Criterion | Expo development builds + CNG | Bare React Native |
| --- | --- | --- |
| Native ONNX/TFLite execution | Possible through compatible native libraries or local modules; WeGlow compatibility remains unproven | Possible through autolinked libraries or custom native modules; compatibility still needs proof |
| Native ownership | Version local modules/config plugins; generated `android/` and `ios/` are disposable | Version and maintain Android/iOS projects, Gradle, Pods and platform configuration directly |
| Image/model custom work | Local Expo module can contain Kotlin/Swift/C++; expose an asynchronous API | Native module/TurboModule or equivalent platform integration |
| Reproducibility/upgrades | SDK compatibility matrix reduces choices; plugins must reproduce every change | More flexibility; team owns a larger dependency/toolchain compatibility matrix |
| Builds | Local Android/Xcode builds; EAS optional | Local or hosted CI builds; Expo services can also be used if desired |
| Main tradeoff | Plugin maintenance and SDK constraints | More native project maintenance and platform drift |

Native models alone do not justify choosing bare. Choose bare if the feasibility slice demonstrates an essential dependency cannot work reliably with the supported SDK/CNG approach, or requires extensive persistent native project customization that cannot reasonably be encoded in a module/plugin. Record evidence and an architecture decision before changing approach; TypeScript features and repository interfaces remain portable.

No exact SDK, RN, runtime or package versions are approved yet. Pin a tested compatible set after the slice, including Nitro dependencies if required by the selected TFLite release. Do not assume old architecture fallback is available in the chosen RN version. Device minimums must follow the strictest selected native dependency; the Kotlin app's Android API 24 minimum is a legacy fact, not a promise for 2.0.

## 3. Feature-based source layout

Proposed layout only; none of these application directories are created in Stage 2:

```text
src/
  app/
    bootstrap/              # composition root, configuration validation
    providers/              # session, query client, theme, dependencies
    navigation/             # typed stacks, links, route access rules
  features/
    auth/
    onboarding/
    home/
    scan/                   # capture/analyze coordinator shared by scan modes
    acne/
    hairstyles/
    environment/
    routines/
    progress/
    journal/
    profile/
    settings/
    legal/
  shared/
    ui/                     # accessible primitives, feedback, layouts
    theme/                  # semantic tokens and typography
    domain/                 # shared identity, time and error types only
    lib/                    # small pure utilities, not feature logic
  infrastructure/
    supabase/               # client, generated DB types, function transport
    auth/                   # protected session storage, callback parsing
    ai/                     # runtime adapters, manifest, native facade
    media/                  # decode, face detection, file lifetime
    location/
    notifications/
    persistence/            # account-local journal storage
    observability/          # redacted logging/metrics
assets/
  models/                   # immutable approved binaries + manifests
  fonts/
  images/
modules/
  weglow-ai/                # local native pipeline module if slice requires it
plugins/                    # reproducible native config/asset plugins
tests/
  fixtures/                 # synthetic or approved consented fixtures
  contracts/
  e2e/
docs/
```

Each nontrivial feature contains `domain/` (models, rules, repository ports), `application/` (use cases/coordinators), `data/` (DTOs/repository adapters), `presentation/` (screens/components/hooks), and a small public `index.ts`. Keep small features simple; empty layers are unnecessary.

Dependency rule: screens call application hooks/use cases; use cases depend on domain ports; data adapters implement ports using infrastructure. Domain imports no React, native or Supabase SDK. `app/bootstrap` injects concrete adapters. Infrastructure may consume domain contracts, but never presentation code. Cross-feature access uses public contracts; no deep imports or UI-to-UI dependencies. Share an invariant only when multiple features actually need it. Enforce import boundaries with linting during implementation.

## 4. Navigation, state and UI

Use React Navigation native stack + bottom tabs, typed route parameters and conditional session groups. Proposed root: bootstrap → signed-out auth group / recovery group / authenticated profile-resolution group → onboarding or main app. Profile read failures get a retry state; they must not imply incomplete onboarding. The main tabs are Home, Routine, Progress and Profile, with Scan as a stack/modal action; placement and labels await Figma reconciliation. Hairstyle flow shares capture infrastructure. Legal screens are reachable before and after login.

Auth state owns route availability; recovery is isolated from normal signed-in navigation. Reset the account group on identity/generation changes, closing old stacks. Route parameters carry stable IDs and scan job IDs, never tokens, raw images or large tensors. Parse only allowlisted auth callback paths; defer approved ordinary deep links until the required session/profile state exists. Source basis: [React Navigation auth flows](https://reactnavigation.org/docs/auth-flow/).

| State | Proposed owner | Lifetime |
| --- | --- | --- |
| Session/identity/account generation | Auth service + context subscription | App session; credentials only in protected adapter |
| Profile, routine records, history, hairstyle catalog, environment | TanStack Query through feature repositories | In-memory cache keyed by environment + user + query inputs |
| Capture mode, current scan job/result, cross-screen draft | Feature-scoped Zustand store | Scan/feature lifetime; no persisted photo/tensor/result store |
| Inputs and validation | React Hook Form + Zod; React state for simple interactions | Screen/form lifetime |
| Derived progress/recommendations | Pure TypeScript functions | Recompute from source data |
| Journal notes | Dedicated account-scoped local repository | Explicit retention policy; no implied cloud sync |

Use query focus/connectivity integration, bounded retries and stale states; TanStack provides React Native integration guidance ([official guide](https://tanstack.com/query/latest/docs/framework/react/react-native)). Do not duplicate server records in Zustand. Use a reducer/discriminated union for capture states: idle, acquiring, validating, analyzing, ready, failed, cancelled. Saved/unsaved/saving/save-failed is a separate result persistence state.

UI: React Native primitives + StyleSheet, semantic Figma-derived tokens, safe areas and platform-aware accessible behavior. Build Button, Text, Input, Card, Screen, Dialog, Loading/Empty/Error states first, then concern summaries, UV cards, routine tasks and progress charts. Feature components may use domain types; generic UI may not call repositories. Consider `react-native-svg` for approved vectors/overlays/charts. Add gesture/animation libraries only where the approved design needs them. Never hardcode unverified Figma colors, fonts or metrics into this plan.

## 5. Supabase integration

### Authentication and identity isolation

Use one configured `@supabase/supabase-js` client per environment with a publishable key (or verified legacy anon key), `persistSession`, explicit PKCE, and manual native callback handling. The Supabase React Native quickstart illustrates foreground refresh and manual URL handling, but its AsyncStorage example is not our protected-storage policy ([official quickstart](https://supabase.com/docs/guides/auth/quickstarts/react-native), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow)).

Propose an SDK-compatible storage adapter using Expo SecureStore: Android Keystore-backed encryption and iOS Keychain. Full session payloads can exceed platform item limits; the feasibility slice must test large sessions and interrupted writes. Use bounded versioned chunks with a committed manifest, cleanup of incomplete generations and serialized writes, or select a vetted encrypted-file store with its key in SecureStore if chunking proves unsuitable. Fail closed with recoverable reauthentication on unreadable state; never fall back to plaintext. Avoid mandatory biometric prompts for background token refresh. Handle reinstall/keychain persistence and exclude protected state from backup. These are implementation requirements, not a claim that SecureStore supplies chunk transactions ([SecureStore limits and lifecycle](https://docs.expo.dev/versions/latest/sdk/securestore/)).

Preserve email login/signup/confirmation, Google browser OAuth and recovery semantics from audit section 4. Validate callback environment/scheme/host/path and response mode; use the SDK PKCE exchange for code callbacks. The audited recovery flow uses verified recovery token hashes: preserve strict parsing/OTP verification and bind password changes to the verified recovery session, with a single validated handler rather than treating every auth link as normal login. Confirm hosted templates/allowlists before acceptance. Keep auth event callbacks lightweight; schedule dependent network operations outside them. Subscribe to app foreground/background once to manage refresh, and unsubscribe on teardown.

Every account operation captures user ID + account generation. On logout/account switch: increment generation, abort requests, prevent stale completions from rendering or starting new writes, cancel queries and clear caches, dispose scan state/files, reset navigation and clear local credentials even if remote logout fails. Requests already accepted by the server cannot be undone by cancellation; they must remain bound to the original session/owner. Recheck ownership before upload/save and after async work. Decide journal retention separately; default proposal is encrypted account-local notes retained on ordinary logout, inaccessible to other accounts, purged on successful deletion.

### Database contracts

Generate TypeScript DB types from an authorized verified schema snapshot in a later stage; supplement with runtime validation for JSON/functions/legacy catalogs. Separate database DTO names from canonical domain names. Do not rename backend tables or replay migrations to make the client convenient.

| Audit fact (section 3) | Proposed client contract |
| --- | --- |
| `profiles.id` is auth UUID; onboarding has required age/gender/sensitivity, optional skin type | Targeted updates; distinguish missing profile, incomplete profile and failed fetch. Preserve legacy `14–24`; new choices use approved adult ranges including `18–24` |
| `"Scan-profiles"`, `"Date_time"`, `user_prof_id`, ten counts, fingerprint | Exact case-sensitive mapping; stable timestamp/ID per scan and retry; no raw image/box upload |
| Java `UUID.nameUUIDFromBytes` scan identity | Port exact UTF-8 input serialization, MD5/version/variant byte semantics with Kotlin fixtures; do not substitute a generic namespace-based UUID v3 call |
| Routine tables are authenticated-read-only; writes use bounded RPCs | Obtain exact deployed RPC names/arguments from schema evidence; use idempotent SET completion calls, not direct table mutations or toggles |
| `hairstyles` filtered by saved shape and applicable gender | Return real catalog entries; label empty/offline separately; never display placeholder `matchPercent=0` as model confidence |
| Product FK is integer `products."No"` | Keep display IDs distinct; adapters/catalog pagination only if commerce approved |

Owner filters express intent; server RLS remains the authorization boundary. No service-role credentials in the app. Paginate history (audit used 500-row pages) with deterministic ordering/tie-breaking; retrieve enough coverage for progress rather than computing from a truncated first page. Use abortable reads and safe idempotent retries. Reconcile separately saved history and best-effort profile summary; refresh canonical history after successful save and expose partial failures. No new realtime subscriptions are needed initially; add only for an approved requirement and verified policies.

Preserve UTC instants, saved IANA time zones, versioned schedules, due times 08:00/20:00, and `(previousScan,currentScan]` boundaries. The audit's combined progress is a 50/50 scan/adherence engagement measure; incompatible fingerprints, zero previous concerns or insufficient coverage may make it unavailable. Do not invent a numeric score for unavailable cases (audit section 7).

### Storage and deletion

**Audit fact:** `profile-images` is private; accepts JPEG/PNG/WebP up to 5 MiB. `profile_image_url` stores an object path under `<userId>/<uuid>`, not a public URL.

Validate MIME signature, dimensions and size; sanitize/re-encode profile images and remove unnecessary metadata before upload. Use unique paths. Upload → update profile pointer → delete replaced object; remove the new upload if pointer update fails, with bounded retry/reconciliation for cleanup failure. Access through authenticated downloads into private cache; short-lived signed URLs are an optional later choice and must never be logged or persisted as profile values. Purge account image caches on account changes. Do not upload scan photos by default.

Use the existing deletion function after its deployed contract is confirmed. Respect explicit DELETE confirmation and recent-sign-in requirement (audit: 15 minutes). Storage cleanup and account deletion are not atomic; show partial failure and allow safe retry. Successful deletion clears protected credentials, local notes, photos and caches. Never perform privileged deletion from the client.

## 6. AI model packaging and execution

### Artifact and adapter strategy

**Audit facts (section 5):** ONNX is 44,733,219 bytes; TFLite is 16,722,672 bytes; combined about 58.6 MiB before runtimes. Their hashes matched metadata in Stage 1. No iOS execution, clinical validation, demographic validation, rights review or device performance proof exists.

Bundle the exact approved binaries and metadata in the initial application for first-launch offline inference. Record SHA-256, byte length, model version, tensor names/shapes, labels, processing version, thresholds and provenance in a model manifest. Copy/read only after rights approval in a later stage. No conversion, quantization, replacement, remote model downloads or cloud inference fallback is proposed for initial parity.

**Documentation facts:** ONNX Runtime publishes `onnxruntime-react-native` ([official guide](https://onnxruntime.ai/docs/get-started/with-javascript/react-native.html)). `react-native-fast-tflite` provides a native TFLite binding, model asset loading, and a Nitro dependency in its current README ([maintainer source](https://github.com/margelo/react-native-fast-tflite)). Neither proves compatibility with these binaries or the chosen SDK.

Evaluate these bindings first behind `AcneInference` and `FaceShapeInference` ports. Keep decoding, resizing and any large postprocessing off the JS/UI thread; a Promise wrapper alone does not move JS work to a worker. If bindings cannot meet scheduling/lifecycle requirements, use a local asynchronous Expo native pipeline module with ONNX Runtime and a compatible LiteRT/TFLite interpreter directly on each OS. Avoid linking two copies of the same runtime in that fallback. JS receives compact validated detections/results, timings and opaque job IDs, not base64 photos or full output tensors. Camera proposal: Expo Camera + ImagePicker for still capture/import; realtime frame analysis is outside the first release.

Propose ML Kit face detection on both platforms through the same local native facade; confirm required angle/box outputs, licensing, initialization and offline availability. ML Kit documents both platforms, but equivalent detector behavior is an open parity question ([official overview](https://developers.google.com/ml-kit/vision/face-detection)). A platform-specific detector substitute requires explicit parity evidence and may change the processing baseline.

| Packaging concern | Android proposal | iOS proposal |
| --- | --- | --- |
| Binary assets | Include `.onnx`/`.tflite` as bundled assets; add Metro extensions if loaded through Metro; plugin sets no-compress where memory mapping requires it | Include model bundle resources through asset/module configuration; resolve sandbox-local readable paths |
| Runtime linkage | Verify Gradle/autolinking, required ABIs, release shrink rules and 16 KiB page-size compatibility of every native library | Verify Pods/framework linkage, deployment target, device arm64 and supported simulator architecture; use physical devices for acceptance |
| Asset loading | Use native asset/file descriptor or copy once to private versioned storage if runtime needs a real path | Resolve bundle URI to runtime-readable file path; copy only if required |
| Build proof | Clean generated debug and release builds, airplane-mode first launch | Clean generated development and release/archive builds, airplane-mode first launch |

Generated assets/plugins must survive clean prebuild without hand edits. Verify manifest/hash before execution; corrupted or missing models produce an actionable failure. Bundle size, unpacked size, duplicate copies and peak RSS all need measurement. Keep model changes tied to binary releases initially; any later OTA policy must bind code, processing fingerprint and native runtime compatibility.

### Frozen processing contracts

The following are **audit facts**, not newly measured results. Port active behavior first, and use Kotlin source fixtures to resolve any ambiguity before implementation acceptance:

| Step | Acne | Face shape |
| --- | --- | --- |
| Decode | Apply EXIF orientation/mirroring, bounded decode (~1600 px longest-side target), sRGB where supported; specify actual rounding/filter details in parity fixtures | Same decode contract |
| Geometry/input | Proportional letterbox to 640×640, RGB 114 padding, float32 NCHW `[1,3,640,640]`, RGB /255 | Center square crop, filtered resize 224×224, float32 NHWC `[1,224,224,3]`, RGB **0–255** (embedded rescaling) |
| Output | `[1,14,8400]`, cx/cy/w/h plus ten scores; no objectness | `[1,5]`, Heart / Oblong / Oval / Round / Square |
| Postprocess | Best class per anchor, confidence **strictly >0.05**, per-class NMS IoU 0.7, max 300; undo letterbox, clamp normalized xyxy, discard invalid/empty boxes, filter centers by largest face box | Finite outputs, argmax, rounded/clamped top score ×100; no extra softmax or new confidence rejection |
| Face validation | Largest-face filtering is separate from the face-shape validation path; freeze no-face behavior from active source | Reject no/multiple faces, face dimension <20%, yaw/roll >25°, pitch >20°, crossing 2% inset |

Acne label order: Acne scars, Dark spots, black heads, cysts, freckles, nodules, open pores, papules, pustules, whiteheads. Metadata/default threshold 0.15 differs from active 0.05. Metadata alone is insufficient. Preserve the exact processing fingerprint only if actual parity is demonstrated; otherwise version it and start a new compatible progress baseline. UI overlays need an explicit original-image → normalized-detection → displayed-image transform, including aspect-fit crop/letterbox and preview mirroring.

### Scheduling, lifetime and acceptance

Serialize inference jobs initially, lazy-load reusable sessions, bound thread counts through device benchmarks, and run native work on dedicated background queues. Release per-run tensors/images in `finally`/native RAII. Retain one session per needed model only while useful; respond to memory pressure and define explicit service disposal/reload. Cancel before execution where possible; when native execution cannot be interrupted, invalidate job/account generation and discard its output. Never resolve an old account's result into a new account's state. Cleanup owned temporary files on completion/cancel/logout plus a startup stale-file sweep; never delete gallery originals.

Start CPU-only for parity. GPU/CoreML/other delegates require a new measured equivalence and performance decision. Compare decode/tensors, raw outputs, NMS boxes/counts, face gates, labels/confidence, overlay geometry, save IDs and fingerprints on approved golden inputs across Kotlin Android, new Android and iOS. Boundary scores may drift; document agreed numeric tolerances and any changed detection decisions rather than silently accepting them. Test EXIF rotations/mirroring, portrait/landscape, no/multiple faces, threshold ties, NMS ties and malformed inputs. UI timers from Kotlin are not latency benchmarks.

Record cold/warm p50/p95 latency, peak memory, load time, package size and repeated-run thermal behavior on the agreed low/mid/high device matrix. Numeric release budgets and acceptable parity tolerances require approval after baseline measurement. No performance or medical accuracy claims are made here.

Offline inference may succeed while saving/history/hairstyle catalogs fail. Keep local result and explicit unsaved/retry state. Default: no durable offline scan outbox and no persisted raw scan photo; process death can lose an unsaved result. Durable encrypted retries need a separate approved retention and conflict design.

## 7. Environment APIs and platform services

Keep upstream weather secrets on the server. Route authenticated current environment calls through the existing verified Edge Function contract; do not embed WeatherAPI keys. Use a typed transport with timeout/AbortController, validated responses, safe error categories, one coordinated refresh attempt for auth failure, bounded jittered retry for safe reads, and Retry-After handling for quota responses. No automatic retry of ambiguous non-idempotent writes. Never downgrade failures into demo data.

**Audit facts (section 6):** environment cache is 20 minutes within 7 km and cleared on account reset. History currently uses direct Open-Meteo daily maximum UV, while today is current UV; requested 30-day availability is unverified. Weather quotas in source are 30/minute, 500/UTC day and four concurrent leases; hosted values remain unverified.

Preserve cache intent and label source/time/staleness, precise versus fallback location, and daily maximum versus current UV separately. Decide one verified history provider/route before implementing the chart; defer unsupported history rather than fabricate it. Use foreground-only Expo Location with permission-denied/manual city/locale fallback; iOS must not assume Android network/SIM-country APIs. Use Expo Notifications for approved foreground UV alerts with a defined cooldown; continuous/background delivery and routine reminders are separate scope decisions.

## 8. Testing, security and delivery

Testing proposal: Jest + React Native Testing Library for rules/hooks/UI, native Kotlin/Swift or C++ fixture tests for preprocessing/inference, and Maestro for cross-platform end-to-end flows. Native output parity and signed release-device checks cannot be replaced by mocked JS tests. Detailed gates and workflow are in [MIGRATION_PLAN.md](MIGRATION_PLAN.md).

Security requirements: protected sessions/notes, private temporary photos and backup exclusions; minimal just-in-time camera/photo/location permissions; strict auth link parsing; RLS/ownership verification in a disposable environment; TLS; runtime input validation; no raw infrastructure errors in UI. Redact tokens, callback URLs, coordinates, photos, journal text, signed URLs and sensitive skin/profile payloads from logs/crash reports. Start with operational metrics only. Bundled keys/config are inspectable, and bundled models are extractable; encryption/obfuscation is not a substitute for rights or server authorization. Feature flags are not access control. Define privacy/retention text and deletion behavior before release.

Git proposal: protected `main`, short-lived `feat/`, `fix/`, `docs/` branches, reviewable PRs with issue/design references, checks, platform screenshots and evidence appropriate to risk. Architecture/model/auth/backend changes need an owner review and an ADR. Commit lockfile, app config, plugins and local native modules; under CNG ignore generated native directories and prove regeneration in CI. Do not maintain manual native edits alongside a supposedly disposable CNG setup. Bare fallback would version native projects under an explicit ownership decision. Secrets/signing material stay in approved CI secret stores; `.env.example` has names/placeholders only. Model binary versioning (Git LFS or approved artifact source) requires a rights/CI availability decision; no models are copied now.

## 9. Recommended stack and decision register

Recommended stack: Expo development builds/CNG, React Native/Hermes/strict TypeScript, React Navigation, TanStack Query, feature-scoped Zustand, React Hook Form + Zod, Supabase JS, protected SecureStore adapter, Expo still-camera/gallery/location services, native ONNX Runtime + TFLite adapters, accessible token-based React Native UI, Jest/RNTL + Maestro + native parity fixtures. Exact versions, optional animation/chart packages and EAS adoption remain unapproved.

| Decision / risk | Proposed direction | Approval/evidence gate |
| --- | --- | --- |
| D1 Setup and native compatibility | Expo dev builds/CNG; bare fallback on demonstrated need | Approve Stage 3 feasibility slice; clean Android/iOS release proof before foundation lock |
| D2 Scope/Figma | Audited release scope, commerce/demo off, chat/orders excluded | Product approval and actual file/node mapping |
| D3 Backend reuse | Preserve contracts, no infrastructure changes | Sanitized hosted schema/RLS/bucket/function/auth inventory; authorized test environment |
| D4 AI baseline and rights | Exact binaries, active 0.05 acne pipeline, CPU first | Redistribution/data rights, golden fixtures, fingerprints and parity sign-off |
| D5 Target matrix/budgets | Supported SDK/runtime minimums; measure on physical devices | Approve Android/iOS minimums, device matrix, memory/latency/size thresholds |
| D6 Persistence/privacy | Local inference, ephemeral photos/results, encrypted local journal; no durable scan outbox | Approve retention, logout/delete behavior, local-only note migration and telemetry policy |
| D7 Auth/release identity | Environment-specific links/IDs, protected sessions, email + Google | Confirm app identifiers/store ownership, recovery templates/redirects and iOS provider/review requirements; any additional provider is separately scoped |
| D8 Environment/history/alerts | Existing server current weather, separately labeled verified history | Confirm history route/range, iOS fallback UX and alert cooldown; no background expansion |
| D9 Distribution/migration | New source repository; conservative staged rollout | Decide replacement vs separate app IDs, signing access, local data import, EAS/CI ownership and rollback procedure |

Implementation order: approve Stage 3 → reconcile evidence/Figma/contracts → prove native models and secure auth storage on both platforms → lock stack/foundation → auth/onboarding → scan/result/save → routines/progress/hairstyles → environment/profile/journal → accessibility/security/release gates. The migration plan details dependencies. Stage 3 must wait for explicit user confirmation.
