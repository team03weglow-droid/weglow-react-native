# WeGlow 2.0 — Stage 3B.1 AI runtime feasibility

Date: 2026-11-11. **Research only; conditional feasibility, no runtime validation.**

Read [SYSTEM_AUDIT.md](SYSTEM_AUDIT.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [MIGRATION_PLAN.md](MIGRATION_PLAN.md) first; reconciled them with the current manifest, Stage 3A reports, Kotlin runner source and upstream documentation. Only this report was added. No packages installed, code changed, prebuild/build run, models copied/executed, or integrations implemented.

## Recommendation and current constraints

Keep **Expo development builds + Continuous Native Generation (CNG)**. Evaluate `onnxruntime-react-native` for acne and `react-native-fast-tflite` for face shape, initially on CPU. Both have Android/iOS native implementations; this establishes a plausible route, not compatibility with WeGlow's binaries or **Expo 58.0.23 / RN 0.88.1 / React 19.3 / Hermes**. No AI dependencies or models are currently integrated. Stage 3A's Android shell build is not an AI build; its generated Android API 24 / iOS 16.4 minimums remain provisional.

The working iPhone Expo Go preview remains useful for UI. It cannot load these arbitrary native modules; AI requires a separately compiled app containing them. Native dependency/plugin changes require rebuilding that app. Local iOS builds remain blocked by the unusable full Xcode setup; Stage 3A also recorded missing CocoaPods. [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)

## Candidate approaches

| Approach | Fit and decision |
| --- | --- |
| **Existing native bindings — first experiment** | Official `onnxruntime-react-native` loads ONNX through native runtimes. Its upstream README documents Expo plugin registration and file-path loading; do not assume ArrayBuffer model loading. `react-native-fast-tflite` uses Nitro Modules, requires `react-native-nitro-modules`, accepts bundled/file assets and exposes asynchronous execution. Lowest initial integration effort, but native build and scheduling compatibility need proof. |
| **Local Expo native pipeline — fallback / likely parity solution** | Kotlin + Swift/Objective-C module owns decode, face detection, tensors, inference and postprocessing on background queues; JS passes a local image URI/job ID and receives compact results. Use native ONNX Runtime and a compatible LiteRT/TFLite interpreter directly. More native ownership, but better control over Kotlin parity, memory and runtime versions. Replace the affected binding rather than link duplicate runtimes. |
| **Bare React Native — conditional fallback** | The same runtimes remain candidates. Consider only after a demonstrated CNG/plugin limitation; removing Expo does not solve model/operator, iOS toolchain or preprocessing problems. |

Sources: [ONNX RN guide](https://onnxruntime.ai/docs/get-started/with-javascript/react-native.html), [ONNX RN upstream README](https://github.com/microsoft/onnxruntime/blob/main/js/react_native/README.md), [fast-tflite README](https://github.com/margelo/react-native-fast-tflite), [Expo Modules](https://docs.expo.dev/modules/overview/), [native iOS LiteRT](https://developers.google.com/edge/litert/ios/quickstart).

**Compatibility uncertainties:** wildcard RN peers do not establish RN 0.88/New Architecture support. Inspect the selected published releases, their plugins, Nitro peers/codegen, Gradle/CMake/Pods and Hermes behavior before pinning. Upstream `main` is moving source, not proof of a published artifact. In particular, the inspected fast-tflite [podspec](https://github.com/margelo/react-native-fast-tflite/blob/main/react-native-fast-tflite.podspec) pins `TensorFlowLiteC` **2.17.0**, whereas Kotlin records LiteRT **2.1.5**: similar naming does not establish equivalent operator support. Confirm exact model operators/op versions, tensor metadata and CPU outputs on each OS; custom/Select TF ops may require a different interpreter build. Do not convert, quantize or replace models to bypass a failing parity gate.

## Packaging, plugins and performance

- Bundle the unchanged approved binaries for first-launch offline use: ONNX **44,733,219 bytes**, TFLite **16,722,672 bytes**, combined **58.6 MiB** before runtimes/face detection. These sizes/hash checks are inherited from Stage 1. Record immutable SHA-256, sizes, labels, tensor contracts and processing version; redistribution rights remain an unresolved gate before copying assets.
- If loading through Metro, extend Expo's default asset extensions with `.onnx`/`.tflite`; ensure release assets are physically bundled rather than served only by Metro. Resolve a native-readable local path, verify hashes and prove first launch in airplane mode. Direct native resources are an alternative; choose one ownership path to avoid duplicate assets/copies.
- Android memory-mapped `openFd` loading needs uncompressed assets; encode the necessary `noCompress` configuration in a reviewed plugin/module. iOS needs model bundle resources and correct resource/path resolution. Verify paths with the selected loader instead of assuming Metro IDs or URI prefixes work identically across OSes.
- Audit the selected ONNX Expo plugin. Fast-tflite documents plugin options for optional delegates; CPU evaluation does not require enabling CoreML/GPU. Additional asset, permission, deployment-target or build changes must survive clean CNG regeneration through modules/plugins. [Config plugin behavior](https://docs.expo.dev/config-plugins/introduction/)
- Serialize jobs, reuse lazy sessions, release per-run buffers, and handle memory pressure/disposal. Keep decode/resize/NMS off JS/UI threads; a Promise alone does not move JS loops to another thread. Avoid base64 and repeated tensor copies. Bound CPU threads using Kotlin's 1–4 intra-op baseline; benchmark cold/warm latency, peak RSS, package size and repeated-run thermals. No speed/memory budget is proven. Defer CoreML/GPU/NNAPI until CPU parity passes.
- Verify Android ABI coverage and **16 KB page-size compatibility for every native library**, including prebuilt runtimes/Nitro. A newer app NDK cannot repair incompatible prebuilt libraries. [Android native page-size guidance](https://developer.android.com/guide/practices/page-sizes)

## Kotlin parity requirements

| Stage | Frozen behavior to reproduce |
| --- | --- |
| Shared decode | EXIF rotation/mirroring, approximately 1600 px longest-side bounded decode, software sRGB where supported. Freeze rounding, interpolation, color/alpha handling and display-coordinate transforms with fixtures; iOS resize defaults need not match Android Canvas. |
| Acne input/output | Float32 RGB NCHW `[1,3,640,640]`, `/255`, proportional letterbox with RGB 114 padding; `images` → `output0` `[1,14,8400]`, four box coordinates plus ten class scores, no objectness. Preserve audit label order. |
| Acne postprocess | Best class per anchor, confidence **strictly >0.05** (metadata says 0.15), per-class NMS IoU 0.7/max 300; undo letterbox, normalize/clamp and discard invalid boxes. Keep centers within the largest face box using Kotlin's integer containment behavior. Source confirms no face throws `InvalidImage`; multiple faces select the largest. |
| Face shape | Center square crop of the decoded image, filtered 224×224 resize; float32 RGB NHWC `[1,224,224,3]` at **0–255**, not `/255`. `[1,5]` → Heart/Oblong/Oval/Round/Square; finite check, argmax, rounded/clamped top score ×100. No added softmax/confidence cutoff. |
| Face-shape validation | Reject absent/multiple faces, width or height <20%, yaw/roll >25°, pitch >20°, crossing a 2% inset. Validation does not imply replacing the center crop with a detected-face crop. |

Use bundled Android ML Kit face detection and evaluate the iOS ML Kit equivalent through a native facade. Both expose face geometry, but detector boxes, Euler conventions and boundary decisions require cross-platform fixtures. Android's unbundled option can require a model download; select bundled operation for first-use offline parity. [Android face detection](https://developers.google.com/ml-kit/vision/face-detection/android), [iOS face detection](https://developers.google.com/ml-kit/vision/face-detection/ios).

## Native build prerequisites

| Route | Required before a future proof of concept |
| --- | --- |
| Android local | Existing Android Studio/SDK/JDK setup, compatible Gradle/NDK/CMake and accepted licenses; resolve added runtime requirements. Stage 3A built with NDK 27.1.12297006 and CMake 3.22.1. Attach a physical Android device for latency/memory evidence; simulator results alone are insufficient. |
| iOS local | Compatible macOS + full Xcode selected as developer directory, accepted license/first-launch components, iOS SDK, CocoaPods and any simulator runtime. Device signing/team/provisioning and Developer Mode as applicable. Command Line Tools alone cannot compile/run the iOS app. |
| iOS remote — practical interim route | EAS cloud build or a compatible macOS CI host supplies Xcode/Pods. EAS needs an Expo account/project/build profile and source/model upload approval; physical iPhone internal distribution needs a paid Apple Developer team, approved bundle ID, signing credentials and registered device UDID/provisioning. Local Xcode is unnecessary for cloud compilation, but remote builds do not provide local simulator/debugging/profiling tools. Simulator artifacts cannot install on iPhone. |

Sources: [Expo build routes](https://docs.expo.dev/develop/development-builds/introduction/), [cloud iOS process](https://docs.expo.dev/build-reference/ios-builds/), [internal distribution/provisioning](https://docs.expo.dev/build/internal-distribution/). No cloud account, signing readiness or SDK 58-compatible cloud image was verified in this audit.

## Minimal future proof of concept — separately authorized

1. Resolve model redistribution/fixture rights, Android+iPhone availability, build route/signing and numeric parity tolerances. Select published runtime/Nitro versions against the existing SDK; document the matrix without an automatic SDK downgrade.
2. In an isolated development slice, add only the candidate runtimes and approved unchanged models. Build a one-action fixture runner, with no backend dependency or production screen work. Prove CPU session creation and raw tensor inference on **both** platforms before camera integration; use the native-module fallback if a binding blocks compilation/operators/scheduling.
3. Compare Kotlin Android → new Android → iPhone at decoded pixels, prepared tensors, raw outputs, boxes/counts, face gates, labels/confidence and overlay coordinates. Include rotations/mirroring, odd aspect ratios, threshold/NMS ties, absent/multiple faces and invalid files. Agree tolerances before interpreting failures; retain the old processing fingerprint only with demonstrated parity, otherwise version it and isolate progress comparisons.
4. Prove bundled first-launch offline execution, missing/corrupt model failure, cancellation/stale-result suppression, repeated runs and temporary-file cleanup. Rebuild from clean CNG configuration; run release-mode device measurements as well as development builds. Record cold/warm p50/p95, peak memory, binary size and thermal behavior against agreed budgets.

**Exit decision:** proceed only with reproducible Android+iOS native builds, operator and preprocessing parity evidence, and acceptable device measurements. Android-only success leaves feasibility incomplete. Keep Expo Go UI previews available while native tooling/signing blockers are resolved; no implementation is authorized by this report.
