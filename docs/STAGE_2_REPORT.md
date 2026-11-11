# WeGlow 2.0 — Stage 2 Architecture Planning Report

Date: 2026-11-11. Status: planning only; Stage 3 awaits explicit confirmation.

This report combines the architecture, migration plan and provisional Figma screen mapping. Verified audit findings, proposals and unresolved decisions are distinguished in each document.

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


---

# WeGlow 2.0 — Migration and delivery plan

Date: 2026-11-11. Status: proposed, Stage 2 only. Depends on [ARCHITECTURE.md](ARCHITECTURE.md), [SYSTEM_AUDIT.md](SYSTEM_AUDIT.md) and [FIGMA_SCREEN_MAPPING.md](FIGMA_SCREEN_MAPPING.md).

## 1. Evidence and migration boundaries

**Audit facts:** the Kotlin project is an Android-only behavior reference. Active models run locally; backend histories and profiles can be reused only after deployment verification. Existing model tests were inventoried but not run in Stage 1. Old CI covers Android debug checks, not cross-platform release acceptance. Existing notes are local SharedPreferences data; no automatic transfer to a new app/iOS exists.

**Stage 2 verified:** this delivery adds planning documents only. No packages, scaffolds, model copies/execution, Kotlin changes, SQL, hosted service writes or deployment are part of this stage. The model/runtime stack, feature scope, target minimums and migration strategy below are proposals. No Figma frame mapping or hosted verification is complete.

This is a new application implementation, not a mechanical Compose-to-JSX translation. Reuse domain behavior and external contracts; replace presentation and platform adapters. Do not modify the reference Kotlin repository or binaries. Do not rerun fresh setup or old migrations against the existing Supabase project. Any later infrastructure/auth configuration change is a separately reviewable action outside Stage 2.

## 2. Ordered delivery gates

Stage 3 below is a proposed bounded foundation/feasibility stage. Later milestones are sequencing guidance, not automatic authorization for the full roadmap.

| Milestone | Work proposed after relevant approval | Exit evidence / dependency |
| --- | --- | --- |
| 0 — Approve architecture | Resolve D1–D9 owners; confirm Stage 3 scope | Explicit user confirmation; unresolved items tracked with owner and impact |
| 1 — Contracts and design inventory | Read-only Figma inspection once link supplied; approved release matrix; sanitized backend schema/policy/function/auth inventory; model rights and fixture selection | Actual node links; deployment differences listed; no inferred production-security assurance; development/test target identified |
| 2 — Native feasibility (Stage 3) | Initialize isolated RN/Expo app in this repository, after confirmation; bundle approved unchanged models; test native adapters/face detector; test protected session-storage adapter and app-link parsing | Android/iOS physical CPU inference with golden comparisons; release builds; clean CNG regeneration; large-session/read/write/reinstall tests; device measurements |
| 3 — Foundation lock (Stage 3) | Select compatible pinned SDK/RN/runtime/Nitro versions, device minimums, CI toolchains; theme/primitives; dependency injection, navigation shell, environment validation and account-generation cleanup | ADR for Expo vs bare; no unresolved blocker to either platform; baseline CI and documented budgets. Stop for decision if native feasibility fails |
| 4 — Identity vertical slice | Supabase login/signup/confirmation/Google/recovery, profile resolution, onboarding, legal and logout | Cold/warm link cases, network failures, secure restore, account switch isolation; staging only |
| 5 — Scan vertical slice | Still capture/import → validation → both local models → overlays/results → explicit save/retry; startup stale-file sweep | Approved parity fixtures on both OSes; airplane-mode inference; permission/cancel/memory-pressure tests; saved ID and processing fingerprint compatibility |
| 6 — Routines/progress/hairstyles | Pure rule ports, product-independent routine RPCs, paginated progress, actual hairstyle catalog | Kotlin golden rule parity; DST/zone/interval fixtures; cross-account isolation; empty/unavailable states; no fabricated match scores |
| 7 — Environment/profile/journal | Current weather, verified history route, labeled fallbacks, profile images, local notes, notifications/settings/deletion | API contract/error tests; private upload reconciliation; local retention/deletion proof; approved history labels/cooldown |
| 8 — Release hardening | Full design QA, accessibility, consent/privacy content, device matrix, native release signing and observability | All critical acceptance gates below; store/release owner approval |
| 9 — Controlled rollout | Internal distribution → limited beta → phased production | Monitor agreed error/latency/auth/save metrics; documented halt/rollback ownership; user feedback triage |

Milestone 1 evidence collection may proceed alongside local feasibility once Stage 3 is approved; production backend integration remains gated on hosted evidence. Screen visual implementation follows actual Figma reconciliation. No dates/effort estimates are promised until design count, devices, team capacity and native slice results are known.

## 3. Behavior reuse and data compatibility

| Area | Preserve / port | Deliberate adaptation and release gate |
| --- | --- | --- |
| Auth | Email/Google, PKCE, confirmation, verified recovery session, logout cleanup | Protected persistence; environment callbacks; distinguish profile errors from missing onboarding |
| Onboarding | Required age/gender/sensitivity, optional skin type; existing legacy cohort values | Do not rewrite old `14–24` rows or submit that value as a new choice; confirm deployed constraints |
| Acne | Exact binary, labels, 0.05 threshold, NMS/letterbox/face filtering | Fingerprint and count parity; differing detector/resize behavior requires versioned baseline |
| Face shape | Float RGB 0–255, crop, five labels, argmax confidence semantics | Native iOS interpreter/face gating; do not add normalization/softmax or invent hairstyle match percentages |
| Scan persistence | Case-sensitive schema, same logical scan timestamp/ID on retry, derived data only | Prove Java UUID byte/string behavior; expose separate history/profile-summary failures |
| Routines | Release own-product AM/PM checklist and versioned RPC schedules | Preserve schedule-zone activation and idempotent SET writes; no direct table write shortcut |
| Progress | Consecutive compatible scans, signed change, unavailable states, due-task coverage | Time zone/DST-aware pure TS port with golden fixtures and full pagination |
| Environment | Existing current-weather contract, fallback labels/cache intent | Verify history semantics/range; replace Android telephony fallback on iOS |
| Profile photos | Private paths/ownership, 5 MiB image limits | Cross-platform re-encode/private caching and upload-pointer-cleanup reconciliation |
| Local notes | Account-local behavior | Choose encrypted storage; no implied sync/import; retention explicitly approved |
| Commerce/chat/orders | Audited release flags/retirement | Deferred unless product explicitly expands scope; no checkout backend assumed |

Shared Supabase user UUIDs must remain unchanged. Successful hosted login restores server-side profile/history/routines through the verified schema, without bulk client-side migration or auth-user recreation. Inventory data anomalies before choosing adapters; any schema repair needs a separate plan and approval.

App identity is an unresolved release decision. Replacing the Android app requires the same application ID and valid signing/upgrade lineage plus a tested upgrade path. A new application ID creates an independent sandbox and does not read old app-local notes or sessions. iOS has no prior app-local Android state. Never promise that login transfers local notes, photos or SharedPreferences. Default proposal: do not import Kotlin local data automatically; if retention is required, design an explicit consented export/import or separately authorized upgrade migration. Leave old local data untouched. Confirm whether any legacy cloud rows with incompatible/missing fingerprints remain visible as history but unavailable for combined comparisons.

## 4. Acceptance and test strategy

All tests here are future work. No test suite or model ran during Stage 2.

| Layer | Proposed tools / cases | Required evidence |
| --- | --- | --- |
| Static and boundaries | TypeScript strict, ESLint/import rules, formatting, dependency/secret/license scanning | PR checks; no sensitive literals or architecture-boundary violations |
| Domain parity | Jest golden cases for ranking, AM/PM rules, progress, UUID bytes, timestamps/rounding | Kotlin behavior matched or approved documented differences |
| Presentation | React Native Testing Library for forms, recovery/profile startup, empty/error/save states, accessibility labels | Meaningful behavior assertions; no reliance on snapshot-only tests |
| Native AI/media | Native fixture tests + actual release-device runs; decode/tensor/output/face/NMS/overlay comparisons | Versioned consented fixture set, numeric tolerances, model/processing manifest and per-platform results |
| Backend contracts | SDK adapter/function fixtures; disposable Supabase ownership/storage/RPC tests | User A cannot read/write user B data; anonymous denial; expired auth and malformed requests; no destructive production fixtures |
| Auth/end-to-end | Maestro on Android/iOS; cold/warm OAuth/recovery links, confirmation, refresh, logout and rapid account switch | Old work never appears in next account; back button cannot reopen prior account screens; recovery cannot update wrong user |
| Time/history | DST gaps/folds, travel, midnight, 08:00/20:00, interval endpoints, pagination and zero baseline | Stable due occurrence identities and explicit unavailable score states |
| Failure/privacy | Permission denial, offline, quota/timeout, duplicate saves, process death, cancelled native job, cleanup failure | Correct retry semantics; no raw scan uploads; no gallery-original deletion; sanitized logs and bounded temp-file retention |
| Accessibility/design | TalkBack/VoiceOver, font scaling, contrast, keyboard focus, small screens, reduced motion, safe areas | Actual Figma frame/device screenshot review; approved intentional platform differences |
| Release/performance | Signed Android/iOS builds, package size/RSS, cold/warm p50/p95, thermal loops, Android native page-size compatibility | Agreed device/OS matrix and budgets; release builds pass independently of debug/simulator results |

Do not derive parity tolerances from convenience after seeing failing outputs. Have model/product owners approve numeric tolerances, detection-boundary exceptions and whether the same fingerprint remains valid. Evaluate representative demographic performance and score wording before making user claims; legacy output scores are not validated diagnoses or calibrated probabilities.

## 5. Git, CI and environment workflow

Use protected `main` and short-lived topic branches; small PRs tied to a design frame/issue and acceptance gate. Require type/lint/unit/component checks on PRs. Run native builds and AI smoke/parity fixtures when models/media/runtime/config/plugins change; establish full Android/iOS release checks at milestones and before rollout. Keep at least one clean CNG generation build in CI to detect hidden hand edits. Builds require pinned Node/package manager, Java/Android SDK/NDK, Xcode and CocoaPods versions selected by the compatibility slice, not copied from Kotlin.

Run SQL ownership fixtures only in a disposable seeded environment with separate authorized credentials. Use a macOS runner for iOS. Do not put signing secrets on untrusted fork PRs; restrict release jobs and artifacts. Record dependency provenance/licenses and generate an SBOM at release. Commit lockfiles and reviewed native config/module sources. Model fixtures must be synthetic or consented and rights-cleared; keep private photos out of Git. Choose Git LFS vs controlled build-time artifact retrieval for model distribution before models enter the repo; validate immutable hashes either way.

Define development, staging and production app IDs/schemes and public configuration separately. Hosted project separation must be verified, not inferred from names. App config fails fast for missing/mismatched environment identifiers. Use CI secrets only for privileged build operations; mobile publishable keys remain public, with RLS doing authorization. No production writes during development verification.

No auto-merge or auto-production deployment. A release PR records versions, native/runtime compatibility, processing fingerprint, backend assumptions, test evidence and known limits. An owner explicitly promotes a signed artifact after acceptance. EAS is optional and requires an account/credential/CI ownership decision; local native builds remain a supported baseline.

## 6. Rollout and rollback

Plan a small internal cohort first, then a staged public rollout after metrics and privacy configuration are approved. Track only redacted operational signals: crash-free sessions, inference failure/latency, auth completion/refresh failure, save failure/retries, API error/quota rates and startup regressions. Agree numeric halt thresholds and a responsible release owner after baseline measurement.

Keep backend changes out of the initial migration wherever compatible reuse allows. New-client writes must remain readable by the Kotlin release while both clients may exist. If a future change breaks compatibility, require a separately approved versioned backend rollout and recovery plan before deployment.

On regression, halt further rollout and distribute a corrective build. Store rollout halt does not uninstall updates or guarantee a binary downgrade; returning to Kotlin behavior may require a newly signed higher-version build of the previous implementation. Confirm signing/app identity before promising this option. Do not use OTA to swap incompatible native runtimes or silently change model baselines. Preserve server data; client rollback must not delete user records or replay setup scripts. Reproduce account-local retention implications in the release runbook.

## 7. Approval required before implementation

Approve the bounded Stage 3 feasibility/foundation work and Expo-first direction; the user must explicitly confirm before packages or application code are introduced. Supply actual Figma file/node access and an approved feature scope before screen implementation. Confirm a safe backend environment and sanitized deployment evidence before integration. Assign owners for model rights/parity, platform minimums/budgets, privacy/local-data retention, app IDs/signing, weather history, and distribution choices (D1–D9 in the architecture).

Dependencies can remain pending while unrelated approved work proceeds, but each gate blocks its dependent implementation. Stage 2 documentation does not approve infrastructure changes, model conversions, Figma writes, store publication or Stage 3 execution.


---

# WeGlow 2.0 — Figma screen mapping plan

Date: 2026-11-11. Status: provisional inventory, awaiting Figma access and product approval.

## 1. Evidence boundary

**User-provided:** UI/UX designs are complete. **Verified in Stage 2:** no Figma link, file key, node IDs or exports were supplied or inspected. Consequently this is a behavior-to-proposed-screen matrix, not a verified inventory of the completed designs. Frame names, routes, hierarchy and component names below are proposals; every Figma mapping is explicitly pending. Do not infer that a screen is missing from Figma because it appears here.

The behavior basis is [SYSTEM_AUDIT.md](SYSTEM_AUDIT.md), especially sections 4–7. The audited release excludes commerce/demo and retires chat. Differences between actual Figma scope and this release baseline need product decisions before implementation. Architecture and delivery gates are in [ARCHITECTURE.md](ARCHITECTURE.md) and [MIGRATION_PLAN.md](MIGRATION_PLAN.md).

## 2. Provisional mapping

All rows: Figma file/node link **pending**; visual validation **not started**. Route identifiers are proposed logical names, not existing routes. Several rows may map to multiple frames/variants or one composed screen.

| ID | Proposed screen / route | Feature owner | Audited behavior / data contract | Required states / review notes | Release proposal |
| --- | --- | --- | --- | --- | --- |
| F01 | Bootstrap / `Bootstrap` | app/auth | Session restore then profile resolution | Restoring, failed refresh, profile unavailable/retry; no onboarding redirect on fetch error | Core |
| F02 | Welcome / `Welcome` | auth | Signed-out entry; exact design unknown | Login/signup links, legal links, accessible actions | Confirm against Figma |
| F03 | Login / `Login` | auth | Email/password and Google OAuth | Invalid input, submitting, wrong credentials, network, cancelled OAuth | Core |
| F04 | Signup / `Signup` | auth | Full name/email/password; legacy UI requires ≥8 chars + digit | Validation, duplicate/opaque response, submitting, consent copy if designed; hosted policy must be verified | Core |
| F05 | Confirm email / `ConfirmEmail` | auth | Signup may return no session | Awaiting verification, resend throttling/error, expired/used link, return to login | Core |
| F06 | Recovery request / `ForgotPassword` | auth | Non-enumerating request notice | Input/error/loading, neutral sent state, retry | Core |
| F07 | Set password / `ResetPassword` | auth | Strict verified recovery session, local cleanup | Verifying, expired/invalid link, wrong flow, updating, success/signout, failure | Core |
| F08 | Onboarding steps / `Onboarding` | onboarding | Age/gender/sensitivity required; skin type optional | Step/back/progress, validation, skip skin type, save/retry; legacy age display separate from new choices | Core |
| F09 | Home / `Home` | home | Environment/routine/progress composition | Partial loading/error, new user/no scans, stale/fallback weather, no demo masquerading as live data | Core |
| F10 | Scan chooser / `ScanMode` | scan | Acne versus face-shape modes | Explain mode and local processing, camera/gallery actions | Core |
| F11 | Capture / `ScanCapture` | scan | Still camera/gallery, orientation/mirroring | Permission request/denied/restricted, settings link, camera unavailable, gallery cancel, retake | Core |
| F12 | Validation / `ScanReview` | scan | Decode and face validation | Invalid/corrupt/large image, no/multiple/small/angled/edge-crossing faces as applicable; no unsupported universal acne gate | Core; may be inline |
| F13 | Analysis / `ScanAnalyzing` | scan | Native queued inference with cancellation | Loading/model unavailable, cancel, app background/resume; timers are not measured progress percentages | Core |
| F14 | Acne result / `AcneResult` | acne | Detections/counts/model settings; local result separate from persistence | Zero detections, overlay transforms, saving/saved/failed retry, partial profile-summary failure; no diagnosis claims | Core |
| F15 | Face-shape result / `FaceShapeResult` | hairstyles | Five classes + confidence/traits; save shape | Local result while offline, persistence failure/retry; model confidence is not hairstyle match score | Core |
| F16 | Hairstyle list/detail / `Hairstyles`, `HairstyleDetail` | hairstyles | Supabase catalog by saved shape/applicable gender | Loading, empty match, unreadable catalog, offline, image failure; no synthetic cards/match percentages | Core; detail frame confirmation needed |
| F17 | Routine / `Routine` | routines | Own-product AM cleanser/moisturizer/sunscreen; PM cleanser/moisturizer | No plan, active/pending version, loading, set completion pending/error/retry, day/AM/PM navigation | Core |
| F18 | Journal / `Journal` | journal | Account-local notes distinct from server task completions | Empty/edit/save/failure, local-only explanation and approved retention wording | Core subject to retention approval |
| F19 | Progress / `Progress` | progress | Compatible scan change + adherence, 50/50 engagement score | No/one scan, incompatible fingerprint, zero baseline, insufficient routine coverage, signed worsening, pagination/failure | Core |
| F20 | Environment detail / `Environment` | environment | UV/weather/air quality, direct history caveat | Current vs daily max labels, observed time, fallback location, stale/partial/offline, quota, location denied | Core; history gated by provider proof |
| F21 | Profile/edit / `Profile`, `EditProfile` | profile | Fields and private image object path | Loading/update validation, legacy cohort display, image permission/size/format/upload/pointer/cleanup failure | Core |
| F22 | Settings/security / `Settings` | settings/auth | Logout, account/security actions | Reauthentication needed, logging out despite remote failure, notification permissions; only supported settings shown | Core |
| F23 | Delete account / `DeleteAccount` | settings/auth | Explicit DELETE; recent sign-in; partial deletion possible | Confirmation, reauthenticate, pending, partial failure/retry, completed local purge | Core |
| F24 | Legal / `Privacy`, `Terms` | legal | Audited legal destinations | Signed-out/in access, scroll/font scaling, content approval/versioning | Core |
| F25 | Discover/product detail / `Discover`, `ProductDetail` | future commerce | Deterministic catalog matches; integer catalog key | Empty catalog, filters/pagination, price/currency; no fabricated stock | Deferred; approval required |
| F26 | Saved/cart / `SavedProducts`, `Cart` | future commerce | Owned rows; quantities 1–999; no checkout | Empty/error/conflict/retry; display ID vs integer FK | Deferred; approval required |
| F27 | Chat / route TBD | future feature | Audited chat returns 410/coming soon | Hide by default; any designed placeholder requires product decision | Excluded functional chat |
| F28 | Orders/checkout/payment / route TBD | future feature | No implemented route/payment backend in audit | Requires new product/backend/payment architecture | Excluded |

## 3. Design-to-React-Native workflow

1. Obtain the canonical Figma file link, relevant pages, inspect/export permission, design version/date and owner. Inventory actual frame/node IDs, prototypes, component variants, tokens, fonts and asset rights. Figma reading at this point is future work; use the required Figma design-to-code skill before any later `get_design_context` call. No Figma write is needed to implement the mobile app.
2. Replace each pending mapping with real frame links and verify navigation/feature parity with product. Track discrepancies as decisions: supported behavior, missing state, design-only feature, platform adaptation or explicitly deferred feature. Do not fabricate node IDs or assume every Kotlin debug screen belongs in 2.0.
3. Extract semantic color, typography, spacing, radius, elevation and motion tokens into a reviewed TypeScript theme. Record source variable/style IDs and supported modes. Confirm font licensing and platform font metrics. Keep design values sourced; no made-up token palette in Stage 2.
4. Export approved logos/illustrations/icons as appropriately licensed SVG or raster assets. Rebuild text, forms and interactive layout with native components; do not use flattened screen images as the UI. Record image scale/aspect behavior and icon accessibility/decorative status.
5. Build shared primitives and state patterns before feature screens. Translate Figma auto-layout into flex layout, constraints and safe-area rules rather than absolute positioning. Respect Android back, iOS gestures, system bars, keyboard avoidance, Dynamic Type/font scaling and reduced motion. Fixed overlay geometry is reserved for camera/detection coordinate transforms with explicit measurements.
6. Implement one approved vertical slice at a time: screen shell → fixture-driven states → feature hooks/use cases → repository integration. Screens never embed raw Supabase calls or native model invocation. Add complex motion only after interaction and accessibility acceptance.
7. Compare Android/iOS screenshots at the design reference viewport and at small/large supported viewports; review typography, spacing, clipping, asset rendering, keyboard, contrast and interaction states. Verify VoiceOver/TalkBack. Document approved platform differences; obtain design sign-off before marking a row complete.

## 4. Reusable UI mapping candidates

These component names are proposals pending actual Figma inspection:

| Candidate | Intended consumers | Contract to validate with design |
| --- | --- | --- |
| Screen / Header / BottomTabs | All screen shells | Safe areas, scroll behavior, title/back/action states |
| Button / IconButton / Input / SelectionCard | Auth/onboarding/settings | Disabled/loading/error/focus, accessibility targets, validation wording |
| Card / SectionHeader / Loading / Empty / Error | Home/detail/list screens | Stable layout, retry semantics, partial content and announcements |
| CameraGuide / DetectionOverlay / ScanStatus | Both scan flows | Preview mirroring, source-to-display transforms, cancel/retake and face guidance |
| ConcernSummary / FaceShapeSummary | Scan results | Count vs confidence wording; zero/unknown/error states |
| RoutineTask / PeriodSelector | Routine/journal | Checked/pending/failed, AM/PM/day, server authority |
| ProgressSummary / ComparisonChart | Home/progress | Signed change, unavailable/incompatible baselines, accessible data alternative |
| EnvironmentCard / UVChart / LocationBadge | Home/environment | Source/time/staleness and current vs daily maximum distinction |
| Avatar / ConfirmDialog / FormFeedback | Profile/settings/security | Private image fallback, destructive action focus and partial failure |

## 5. Mapping completion contract

For each real frame record: stable mapping ID, Figma URL + node ID, design revision, screen/variant name, platform/viewports, route and typed params, feature owner, entry/exit links, data/RPC/permission dependencies, tokens/components/assets, all interaction/error states, accessibility requirements, implementation PR, Android/iOS QA evidence and design approver/date.

Suggested row statuses: pending access → inspected → scope approved → state contract approved → implemented → device QA → design approved. Current status for every row is **pending access**. A design link alone does not mean behavior or release scope is approved.

Stage 3 confirmation is still required before creating any screen or application code.
