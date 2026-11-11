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
