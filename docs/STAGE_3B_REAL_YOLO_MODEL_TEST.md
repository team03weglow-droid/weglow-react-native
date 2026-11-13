# WeGlow Stage 3B.7 — Real YOLO acne model feasibility test

Date: 2026-11-13. **PASS: the unchanged real model loaded, accepted its expected float32 input, executed one CPU inference on Android, and returned the expected shape with all values finite.**

## Scope and isolation

Worked only in `/private/tmp/weglow-stage3b3-onnx`, branch `poc/stage3b3-onnx-android`. Read the Stage [3B.1](STAGE_3B_AI_FEASIBILITY.md), [3B.2](STAGE_3B_DEPENDENCY_COMPATIBILITY.md), [3B.3](STAGE_3B_ONNX_ANDROID_POC.md), [3B.4](STAGE_3B_ONNX_ANDROID_PATCH.md), [3B.5](STAGE_3B_ONNX_RUNTIME_SMOKE_TEST.md), and [3B.6](STAGE_3B_ONNX_NATIVE_REGISTRATION.md) reports and the original Kotlin sources/assets read-only.

The main React Native checkout and original Kotlin application were not modified. No dependencies or native configuration changed; no prebuild, Gradle build, APK installation/replacement, merge, push, camera, Supabase, acne postprocessing or accuracy work was performed. No commit was created. The large model was read directly from the original project and staged on the emulator only; no host worktree copy or Git binary addition was necessary.

Added a separate Android `__DEV__` opt-in control in `src/dev/onnx-yolo/` and rendered it beside the existing smoke control on the welcome screen. Runtime import, model load and inference happen only on an explicit tap. The YOLO button disables after the first tap, allowing one run per mounted control/reload. The runner checks runtime metadata, logs timings and every output's type/shape/finite count, reports the failing stage if an error occurs, and releases the session in `finally`.

## Model identity and Kotlin contract

Original project root: `/Users/mac/Downloads/WeGlow_MASTER_Phase1_Phase2_FINAL_v2`.

| Item                                                    | Verified value                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Actual binary                                           | `app/src/main/assets/acne/model.onnx`                                                       |
| Companion metadata                                      | `app/src/main/assets/acne/model.json`                                                       |
| Architecture recorded in metadata                       | YOLOv8s, Ultralytics 8.4.145                                                                |
| Binary size                                             | **44,733,219 bytes**                                                                        |
| SHA-256, original and emulator copy                     | **`f562b417738082c7e90414bc691806fd0588f8a196599dd843fe012cb752fa1a`**                      |
| ONNX graph                                              | IR **8**, default-domain opset **17**                                                       |
| Input, confirmed by Android ORT metadata                | `images`, float32, **`[1,3,640,640]`**                                                      |
| Output, confirmed by Android ORT metadata and execution | `output0`, float32, **`[1,14,8400]`**                                                       |
| Output interpretation from Kotlin                       | 8,400 anchors, 4 `cx,cy,w,h` values in input pixels + 10 class scores; no objectness column |

Metadata label order: `Acne scars`, `Dark spots`, `black heads`, `cysts`, `freckles`, `nodules`, `open pores`, `papules`, `pustules`, `whiteheads`.

Read `app/src/main/java/com/example/weglow/data/repository/LocalAcneScanRepository.kt`, `data/scan/YoloPostProcessor.kt`, and `core/image/ScanPhotoDecoder.kt`. Kotlin decodes an oriented/mirrored image with bounded sampling and software sRGB on the newer Android path. It proportionally letterboxes to 640 square, rounds resized dimensions, centers using integer padding offsets, fills RGB 114, and uses filtered Canvas bitmap scaling. It then packs float32 RGB in NCHW order, dividing each channel by 255.

Kotlin maps the uncompressed model asset, caches the session, enables all graph optimizations, uses 1–4 intra-op threads and one inter-op thread, and checks the tensor shapes. Its actual acne path passes confidence **0.05** despite metadata's **0.15**; class selection uses strict `>` and per-class NMS uses IoU 0.7/max 300. It undoes letterboxing, normalizes/clamps boxes and retains centers inside the largest detected face using integer containment. No face produces `InvalidImage`. These behaviors were inspected only and were not implemented or exercised here.

A dependency-free read-only protobuf field inspection found these standard-domain operator counts: Add 9, Concat 17, Constant 24, Conv 64, Div 2, Gather 1, MaxPool 3, Mul 59, Reshape 8, Resize 2, Shape 1, Sigmoid 57, Slice 2, Softmax 1, Split 8, Sub 2, Transpose 1. This limited inspection is not an ONNX checker pass. Python ONNX/ORT packages were unavailable; no packages were installed. Actual Android ORT session creation and inference provided the compatibility evidence.

## Android setup and reproducible procedure

Used existing AVD `medium_phone`, **emulator-5554**, Android **16**, **arm64-v8a**. Restarted the emulator and an isolated Metro server on port **8089**. The existing installed Stage 3B.6 APK SHA-256 was verified as:

`88617e1bad735697bfe06b40f4fdaf4c9b0e746cfb3b2c98ebdcf0d0395c961a`

This matches Stage 3B.6 exactly. ONNX RN/common remain **1.24.3**; this APK's native runtime is the Stage 3B.6 **onnxruntime-android 1.31.1** build artifact, distinct from the JS binding version. The original model metadata records ONNX Runtime **1.23.2**, so identical runtime numerics are not presumed. Expo 58.0.23, RN 0.88.1, React 19.3.0, Hermes, native registration and the Gradle patch were unchanged.

Commands ran from the isolated worktree. `adb` below means `/Users/mac/Library/Android/sdk/platform-tools/adb`:

```sh
# If stopped, start the existing AVD; no snapshot is saved on exit.
/Users/mac/Library/Android/sdk/emulator/emulator -avd medium_phone -no-snapshot-save
CI=1 ./node_modules/.bin/expo start --dev-client --localhost --port 8089

adb -s emulator-5554 push /Users/mac/Downloads/WeGlow_MASTER_Phase1_Phase2_FINAL_v2/app/src/main/assets/acne/model.onnx /data/local/tmp/weglow-stage3b7-acne.onnx
adb -s emulator-5554 shell run-as com.weglow.mobile.dev mkdir -p files
adb -s emulator-5554 shell run-as com.weglow.mobile.dev cp /data/local/tmp/weglow-stage3b7-acne.onnx files/stage3b7-acne.onnx
adb -s emulator-5554 shell run-as com.weglow.mobile.dev sha256sum files/stage3b7-acne.onnx
adb -s emulator-5554 reverse tcp:8089 tcp:8089
adb -s emulator-5554 shell am force-stop com.weglow.mobile.dev
adb -s emulator-5554 shell am start -a android.intent.action.VIEW -d 'weglow-development://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8089' com.weglow.mobile.dev
adb -s emulator-5554 shell uiautomator dump /sdcard/weglow-stage3b7-idle.xml
# After observing the real-YOLO button bounds [127,1298][954,1391]:
adb -s emulator-5554 shell input tap 540 1344
adb -s emulator-5554 logcat -d --pid=9226 -v time
```

The runner loads the native-readable app-private path `/data/user/0/com.weglow.mobile.dev/files/stage3b7-acne.onnx`. Its recorded hash/size constants identify the expected model; the independent ADB hash check above verified the actual file before loading. This is temporary emulator staging, not a bundled/offline distribution solution. Model copies remain in emulator app storage and `/data/local/tmp` for review, and Metro remains on 8089.

Session options: **CPU only**, intra-op **1**, inter-op **1**, graph optimization **all**. One input allocation contains **1,228,800 float32 values / 4,915,200 bytes**, all set to `114 / 255` (stored float32 **0.4470588266849518**). This represents a uniform RGB 114 square in the expected normalized layout. No photograph, image decode, resizing, face detection or acne postprocessing is involved. Exactly **one real-model `session.run()`** was performed; there was no warm-up or retry.

## Actual results and errors

| Required outcome                         | Result                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| Real model found and loaded              | **PASS**, hash matches Kotlin metadata; session created in **221.59275 ms**                  |
| Expected tensor accepted                 | **PASS**, `images` float32 `[1,3,640,640]`                                                   |
| Android emulator CPU inference completed | **PASS**, one run, **396.504167 ms**                                                         |
| Output names and shapes valid            | **PASS**, only `output0`, float32 `[1,14,8400]`, **117,600** values                          |
| Output values finite                     | **PASS**, **0** nonfinite values; minimum **-7.808837890625**, maximum **634.5072021484375** |
| Session cleanup                          | Released successfully                                                                        |

Times use `performance.now()` around awaited session creation and `session.run()`. Inference timing includes the JS/native boundary and tensor transfer, excludes allocation and output validation, and is a single emulator observation, not a physical-device benchmark. Host memory pressure caused an emulator software-rendering warning at startup; it does not change the execution result, but further limits performance interpretation. Output min/max cover coordinates and class scores together and carry no acne accuracy meaning.

Selected actual PID **9226** logs on 2026-11-13 (emulator clock):

```text
13:30:49.308 model loaded {"loadMs":221.59275000006892,"inputs":["images"],"outputs":["output0"],"inputMetadata":[{"name":"images","isTensor":true,"type":"float32","shape":[1,3,640,640]}],"outputMetadata":[{"name":"output0","isTensor":true,"type":"float32","shape":[1,14,8400]}]}
13:30:49.314 input prepared {"name":"images","type":"float32","dims":[1,3,640,640],"elements":1228800,"bytes":4915200,"value":0.4470588266849518,"finite":true}
13:30:49.314 inference start {"executionProviders":["cpu"],"runs":1}
13:30:49.712 inference completed {"inferenceMs":396.5041669998318,"outputNames":["output0"]}
13:30:49.730 output {"name":"output0","type":"float32","dims":[1,14,8400],"elements":117600,"nonFinite":0,"finite":true,"min":-7.808837890625,"max":634.5072021484375}
13:30:49.730 PASS {"loadMs":221.59275000006892,"inferenceMs":396.5041669998318}
13:30:49.735 session released
```

No model loading, tensor compatibility, inference or finite-value error occurred. Native startup logged that ORT extensions are disabled and a nonfatal warning that Android telemetry is unavailable because its Java HTTP client was not initialized. Neither prevented loading or inference; no workaround was applied.

Tooling notes: sandboxed ADB could not bind/access its local server and sandboxed Metro reported the requested port unavailable. Both succeeded when rerun with tool approval; no app/native change was needed. The first UI dump returned no root while the JS bundle was still downloading; a later inspection showed the idle controls. These were startup/tool access issues, not model failures. No significant model/runtime blocker appeared.

## Smoke preservation and verification

The entire `src/dev/onnx-smoke/` directory, fixture generator, native registration, dependency manifests/lockfile, app config and Gradle patch remain unchanged. After the real-model run, explicitly tapped the original smoke control using its observed bounds. The same PID logged at **13:31:38.559**:

```text
[WeGlow ONNX smoke] inference output {"input":[-1,0,5],"actual":[0,2,8],"expected":[0,2,8],"dims":[3]}
[WeGlow ONNX smoke] PASS [0,2,8]
```

Final UI displays **WeGlow!**, the original smoke PASS and the real YOLO PASS together. Local ignored evidence: `artifacts/stage3b7/{app-logcat.txt,runtime-log.txt,ui-idle.xml,ui-yolo-result.xml,ui-result.xml,emulator-result.png}`. Historical logcat entries from the restored emulator snapshot were excluded by capturing the new app PID.

Validation: `npm run typecheck`, targeted ESLint for the new runner/control and changed welcome screen, targeted Prettier checks and `git diff --check` passed. No broad lint pass is claimed; the prior report's unrelated patch-script lint issue remains outside this scope.

## What remains before Kotlin accuracy parity can be tested

1. Prepare approved shared photo fixtures and Kotlin reference artifacts: oriented decoded pixels, exact preprocessed tensors, raw model outputs, and final detections. Include EXIF rotations/mirroring, odd aspect ratios, padding and face boundary cases. Define numerical tolerances and record both native runtime versions and the unchanged model hash.
2. Reproduce Kotlin's decode/color handling, filtered resize, letterbox rounding/padding and RGB NCHW normalization, then compare the actual tensors and raw outputs against Kotlin. This synthetic constant input proves execution only.
3. In a later authorized stage, implement and compare class decoding, label order, strict 0.05 threshold, per-class NMS, inverse letterboxing/clamping and largest-face containment/no-face behavior. These stages remain absent here.

Separately, production feasibility still requires physical-device latency/memory/repeated-run testing, bundled first-launch offline loading, native-runtime reproducibility, release/16 KB compatibility and iOS validation. This Android emulator result establishes real-model execution compatibility; it makes no acne accuracy or Kotlin parity claim.
