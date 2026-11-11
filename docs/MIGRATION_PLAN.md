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
