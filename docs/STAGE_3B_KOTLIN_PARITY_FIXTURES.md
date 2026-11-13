# WeGlow Stage 3B.8A — Kotlin acne parity fixture preparation

Date: 2026-11-13. **Five synthetic source images exist. No Kotlin decoded-pixel, tensor, raw-output or detection reference has been captured. No parity result is claimed.**

## Scope and stopping point

Worked only in `/private/tmp/weglow-stage3b3-onnx`, branch `poc/stage3b3-onnx-android`. Read [Stage 3B.7](STAGE_3B_REAL_YOLO_MODEL_TEST.md) and the original Kotlin sources under `/Users/mac/Downloads/WeGlow_MASTER_Phase1_Phase2_FINAL_v2` read-only. Preserved the existing Stage 3B.7 changes and Stage 3B.6 smoke test. The original Kotlin and main React Native projects were not modified. No dependencies installed, native configuration changed, APK built, inference run, production preprocessing implemented, model copied/retrained, camera/Supabase added, commit, merge or push performed.

The existing `BundledAcneModelTest` asserts raw shape/finiteness on an all-ones tensor but exports nothing. `OfflineAcneScanTest` checks repeated rejection of a faceless synthetic JPEG but exports nothing. `LocalAcneScanRepository.analyze()` exposes only a final `Result`; its `prepareInput`, session handle and `filterToFace` are private. No usable intermediate exporter was found in these paths. Running the original build would also write its build/cache files. Therefore **Kotlin reference generation stops here**: it requires a separately authorized disposable Kotlin copy and test instrumentation described below. No reflection, runtime injection, desktop approximation, or reconstructed reference values were used.

## Existing input inventory

All five inputs are locally generated synthetic calibration images, with no face photographs, downloaded media or personal data. They cover image geometry, not acne accuracy. The new image assets/manifest carry a CC0-1.0 dedication in `tests/fixtures/acne-parity/LICENSE.txt`; this excludes existing code, model and third-party tools.

| ID / file in `tests/fixtures/acne-parity/` | Encoded size | Orientation                            | Coverage                                                                                           |
| ------------------------------------------ | ------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `normal-square.png`                        | 640 × 640    | Default 1                              | Normal square, solid RGB 114; no resize/padding; links conceptually to Stage 3B.7's constant input |
| `portrait.png`                             | 480 × 800    | Default 1                              | Portrait chart, left/right letterbox padding                                                       |
| `landscape.png`                            | 960 × 540    | Default 1                              | Landscape chart, top/bottom letterbox padding                                                      |
| `odd-dimensions.png`                       | 641 × 479    | Default 1                              | Odd dimensions, float scale/rounding and asymmetric remaining padding                              |
| `orientation-sampling.jpg`                 | 1801 × 1201  | EXIF 7 (transverse: mirror + rotation) | Orientation, sampling above 1600, JPEG decode, padding after orientation                           |

The nonuniform images contain integer channel ramps, a checker pattern and unequal red/green/blue/yellow corner markers. Markers expose channel swaps, reflection, rotation and crop errors. PNGs are opaque RGB; JPEG uses quality 95, no chroma subsampling, baseline/nonoptimized encoding, and one explicit orientation tag. No external fonts or assets are used.

Exact source-byte identities:

| File                       | Bytes  | SHA-256                                                            |
| -------------------------- | ------ | ------------------------------------------------------------------ |
| `normal-square.png`        | 2080   | `ac8b08c54e01a2ac24fe70411e8be9844cc73383a7403790adff31bbb82cce7b` |
| `portrait.png`             | 3226   | `28edf2b183c29aa6c957daf856b92c0d70f595381fbdb98ae6fe229ada42690c` |
| `landscape.png`            | 3426   | `8eacb53e1555bc4667f030e402a3863d6f8a3e3ff66dd8c58ecdc49c548a3853` |
| `odd-dimensions.png`       | 2315   | `1530a587461896b4e814fefe622ff7f8e47d9c7c06d526f1f2c928e3e04c7951` |
| `orientation-sampling.jpg` | 980624 | `7fa9feea3160d441e30bf7e812cc87dd48213b51caea3f3400b3b801ac43cc9e` |

`manifest.json` records sizes, hashes, coverage, generator hash, encoding versions and `kotlin_reference_status: "not_captured"` for each input. It contains encoded dimensions only, not invented Android decode dimensions. Use the checked image bytes as the portable fixtures; regenerating with a different encoder version may produce different bytes and must not silently replace them.

```sh
# From the isolated worktree; uses already installed Pillow, no downloads.
python3 scripts/generate-acne-parity-fixtures.py --check
# Explicit regeneration, only when intentionally refreshing these source inputs:
python3 scripts/generate-acne-parity-fixtures.py
```

Generation and byte-for-byte regeneration verification passed using existing Pillow **12.3.0**, reported libjpeg **6.2**, zlib **1.3.1.zlib-ng**. The generator checks each image's dimensions, RGB mode, readability and EXIF orientation after encoding. These host checks are not Kotlin decode evidence.

## Frozen model, runtime and source identity

Model: original `app/src/main/assets/acne/model.onnx`, **44,733,219 bytes**, SHA-256 **`f562b417738082c7e90414bc691806fd0588f8a196599dd843fe012cb752fa1a`**. ONNX IR 8/opset 17. Verify the actual asset bytes again before reference capture; do not rely solely on `model.json`.

Kotlin's `gradle/libs.versions.toml` pins Android ONNX Runtime **1.23.2** and ML Kit face detection **16.1.7**. Capture the actual `OrtEnvironment.getVersion()`, resolved dependency evidence and APK hash during execution; a source pin alone does not establish a running binary. Stage 3B.7's RN binding/common are **1.24.3** with native Android ORT **1.31.1**, per that report. Record this mismatch in every comparison; change no versions in this stage.

Source hashes inspected in this stage (relative to original Kotlin root):

| Source                                                                            | SHA-256                                                            |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `app/src/main/java/com/example/weglow/core/image/ScanPhotoDecoder.kt`             | `06885d87e6d53943a44b1be6c7a68b2e3a004c512d4bf84f56ba155abd593013` |
| `app/src/main/java/com/example/weglow/data/repository/LocalAcneScanRepository.kt` | `9e1bf7825e6f8f22fe10a54ac8ab98923acfa95ae906938533fa0856bdc05221` |
| `app/src/main/java/com/example/weglow/data/scan/YoloPostProcessor.kt`             | `d93219ba3ea6a3410ef5186db04f13505a3b555b832c9fd86a735e9f3cbf9056` |

Preserve and hash companion `model.json`, `AcneScanResult.kt`, `ScanFailure.kt`, version catalog, capture test and instrumentation diff with the eventual run. Capture source identities before instrumentation and retain the exact instrumented diff.

## Behavior the capture must preserve

- `ScanPhotoDecoder.decode`: API 28+ uses software `ImageDecoder`, target sRGB and `setTargetSampleSize(ceil(longestSide / 1600))`; the older path uses power-of-two BitmapFactory sampling and explicit EXIF transforms. Record actual decoded dimensions/config/color space and API path. Do not infer the odd JPEG's sampled dimensions from host Pillow output. Run API 24–27 as a separately identified future reference set if legacy coverage is required.
- `Letterbox`: float32 scale `min(640f / width, 640f / height)`, `kotlin.math.round` (ties to even), dimensions clamped to 1…640, integer left/top offsets; right/bottom may differ by one. Canvas fills RGB 114, then draws into that integer rectangle with `Paint.FILTER_BITMAP_FLAG`.
- `prepareInput`: use the actual Canvas bitmap pixels, packed RGB channel-first, normalized by float32 `/255f`; `images` float32 `[1,3,640,640]`. No alternate resize, crop or normalization.
- Session: original CPU defaults, intra-op `availableProcessors().coerceIn(1,4)`, inter-op 1, optimization ALL; record the actual thread count. Do not silently substitute Stage 3B.7's one-thread setting. Optional controlled one-thread captures must be separate runs with their own configuration identity.
- `output0`: float32 `[1,14,8400]`, four `cx,cy,w,h` coordinates in input pixels plus ten class scores; no objectness or extra softmax.
- Label order: `Acne scars`, `Dark spots`, `black heads`, `cysts`, `freckles`, `nodules`, `open pores`, `papules`, `pustules`, `whiteheads`.
- Production call uses **0.05f**, despite metadata/default decode threshold 0.15. Best class wins with strict `>`, finite scores at most 1; equal scores keep the earlier label. Reject invalid box values or nonpositive width/height. Stable confidence sorting preserves anchor order on ties. Per-class NMS suppresses only when IoU **>0.7f**; max 300 is applied before inverse letterbox/clamp and invalid-result removal.
- Face filtering runs after decode/NMS: ML Kit ACCURATE, largest integer box by area, retain normalized detection centers mapped to photo pixels and converted with Kotlin `toInt()` before `Rect.contains` (right/bottom exclusive). No face throws `InvalidImage`, including when the pre-face detection list is empty. Never substitute a successful empty result for that failure.

## Exact instrumentation required — future disposable copy only

Do not change or build the original checkout. For a future capture, make an independent source copy below the isolated worktree's ignored `artifacts/` directory, excluding `.git`, `.gradle`, `.kotlin`, `build`, and `app/build`. Copy only after verifying the source hashes above. Reuse installed dependencies/caches in offline mode; if resolution requires a download or native/dependency changes, stop. This copy, test code and capture run have **not** been created or executed here.

Add an Android instrumented `AcneParityCaptureTest` in that disposable copy, using its existing JUnit/Android test dependencies. Add a nullable, test-only observer to the copied repository and these exact hooks; retain originals and instrumented diff. No observer must alter a pixel, buffer position, runtime option, postprocessing order or return value:

1. In `analyze`, immediately after `ScanPhotoDecoder.decode`, before geometry/preparation or recycling: export the oriented bitmap's actual RGB pixels. Record decoder branch, width/height, bitmap config, color space and alpha/premultiplication state. Use `getPixels`, extract R/G/B, rather than native ARGB memory or compressed PNG as the comparison authority.
2. Immediately after constructing `Letterbox`, record source dimensions, input size, float scale and resizedWidth/resizedHeight/left/top plus derived right/bottom padding. In `prepareInput`, immediately after Canvas drawing and `getPixels`, export the exact 640-square RGB pixels before recycling. This extra checkpoint isolates resize differences from normalization differences.
3. After the input buffer is filled and rewound, before `OnnxTensor.createTensor`: snapshot `pixels.duplicate()` with position 0 and explicit expected element count. Serialize each float to little-endian without changing the live buffer. Capture the full tensor, not a sample, min/max or hash alone.
4. Within `prediction.use`, immediately after output shape validation and before `YoloPostProcessor.decode`: serialize `rows[channel][anchor]` in channel-major order. Preserve the full output before the native result is closed. Check type, exact shape, count and every element for finiteness; mark a failed capture if nonfinite values occur.
5. Immediately after `YoloPostProcessor.decode`, export the returned list as `detections-pre-face.json` in its existing order. In `filterToFace`, observe the **same** ML Kit task result used by that call; record all boxes in returned order and the selected largest box. Do not call the detector twice to reconstruct state. Export the filtered list before returning it. Record the mapped integer center for each pre-face detection if investigating boundary mismatches.
6. At the `analyze` caller, persist the actual final `Result`: success fields (`imageWidth`, `imageHeight`, `modelVersion`, `confidenceThreshold`, `detectionSettings`, detections) or typed failure (`InvalidImage`, `DeviceOutOfMemory`, `ModelUnavailable`, `Unknown`) and failing stage. On no-face failure, keep the previously captured pixels/tensor/raw/pre-face artifacts and write failure status; do not fabricate a final detection list. Capture observer/export exceptions must fail the test separately, not masquerade as app failures.

Feed each immutable image through a local `file://` URI in the copied test app's private files directory; invoke the real repository under `runBlocking` serially, using one repository instance per capture run. No UI/camera/backend path is needed. Load original metadata and model unchanged. Use a dedicated Android emulator/device with recorded API/build fingerprint, ABI, density, available processor count, app ID and APK hash. Include ML Kit version/options and actual native ORT version. First capture and a second independent capture must agree under the tolerances below before the reference is accepted. Preserve both runs; never average them.

Write files under `context.filesDir/parity-v1/<run-id>/<fixture-id>/`, export via `adb exec-out run-as <capture-app-id> cat files/parity-v1/.../<file>`, then independently verify sizes/hashes on the host under `artifacts/stage3b8a/kotlin-reference/<run-id>/`. Resolve the actual copied app ID/test runner from its build configuration; do not assume the RN package. A copied Android instrumentation build/test is a future step, not authorized or executed by this preparation report.

## Deterministic reference artifact contract (schema v1)

Use UTF-8 JSON, LF newline, sorted object keys, fixed semantic array order, no whitespace-dependent comparisons. Serialize finite float32 values as round-trip numbers using Kotlin/Java float string conversion; include each detection numeric field's raw float32 bits as eight lowercase hexadecimal digits so decimal rendering cannot erase a difference. No NaN/Infinity JSON literals. Binary files have **no header**, no row padding and no compression; JSON sidecars carry shape, dtype, layout, byte order, element count, byte length and SHA-256. Hashes verify transfer integrity, not numeric parity between runtimes.

| Artifact per fixture                    | Exact representation                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `capture.json`                          | schemaVersion, fixture/source hash, model/metadata/source hashes, capture code hash, run identity/environment/runtime/options, observed geometry, stage statuses, artifact list with hashes/sizes. Missing stages marked `not_captured` or `failed`, never zero-filled. Record the settings fingerprint verbatim from the repository. |
| `decoded.rgb8` + `decoded.json`         | `[height,width,3]`, uint8 RGB, top-left origin, row-major; length `height*width*3`. The dimensions are observed Kotlin output. Optional preview PNG is convenience only.                                                                                                                                                              |
| `letterboxed.rgb8` + `letterboxed.json` | `[640,640,3]`, same RGB format, exactly **1,228,800 bytes**. Include observed letterbox geometry.                                                                                                                                                                                                                                     |
| `images.f32le` + `images.json`          | float32 little-endian, contiguous `[1,3,640,640]`, index `(c*640+y)*640+x`; **1,228,800 elements / 4,915,200 bytes**. No batch/header prefix.                                                                                                                                                                                         |
| `output0.f32le` + `output0.json`        | float32 little-endian `[1,14,8400]`, index `channel*8400+anchor`; **117,600 elements / 470,400 bytes**. Preserve native output values exactly.                                                                                                                                                                                        |
| `detections-pre-face.json`              | Ordered array of actual decode/NMS results, each with label, confidence, normalized left/top/right/bottom and raw bits; records applied 0.05/0.7/300 settings and label order. No fabricated anchor indices (the current return type does not expose them).                                                                           |
| `faces.json`                            | Same-call detector boxes `[left,top,right,bottom]` as integer pixel coordinates, original detector order, selected index or null, image size and options. No invented face boxes for faceless inputs.                                                                                                                                 |
| `result.json`                           | Tagged `success` with the actual final AcneScanResult fields, or tagged `failure` with actual typed failure/stage. Missing final detections on failure, rather than `[]` presented as success.                                                                                                                                        |

Capture timestamps/run IDs belong in provenance, not pixel/tensor files. Endian conversion must use `ByteOrder.LITTLE_ENDIAN` regardless of the device's native order; write floats explicitly, not an unsafely reinterpreted `FloatBuffer.array()`. The binary counts above are format requirements, not existing reference data.

## Small comparison plan and acceptance tolerances

These are **proposed initial engineering gates**, not measured model/runtime error limits or acne accuracy criteria. Freeze them before the first comparison; report maximum absolute/relative error and mismatch indices. Do not loosen them to make a failed comparison pass. For numeric arrays require every element to satisfy `abs(candidate-reference) <= atol + rtol*abs(reference)`, and require finiteness, names, shapes, layout and counts exactly.

| Gate                                                          | Initial rule                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source identity and geometry                                  | Input bytes/model hash/labels/settings exact. Decoded dimensions, orientation and integer letterbox geometry exact.                                                                                                                                                                                      |
| Android decoded RGB and Canvas RGB                            | Exact byte equality on the same Android decode path. Any JPEG/resize difference is a failed pixel gate requiring diagnosis; record max channel error and differing-pixel count, without treating those diagnostics as a pass. Cross-platform decoder tolerance would require a separately agreed policy. |
| Normalized input                                              | From identical letterboxed bytes: float32 `atol=1e-7`, `rtol=0`. Check channel order and every element. Do not use tensor tolerance to excuse failed pixel geometry.                                                                                                                                     |
| Raw coordinate channels 0–3                                   | Same input bytes: `atol=1e-3` input pixels, `rtol=1e-4`. This specifically compares ORT 1.23.2 against the RN build's 1.31.1.                                                                                                                                                                            |
| Raw score channels 4–13                                       | Same input bytes: `atol=1e-5`, `rtol=1e-4`; do not combine score and coordinate metrics into one average.                                                                                                                                                                                                |
| Pure postprocessing on identical captured raw output/geometry | Same ordered labels/count, normalized boxes `atol=1e-6`, confidence `atol=1e-7`, both `rtol=0`. Preserve tie order. Separate synthetic raw-output unit fixtures should later cover strict thresholds, equal scores/IoU, clipping and max limits. None were captured here.                                |
| Full pipeline                                                 | Same success/failure, ordered detection count/labels and selected face box; apply the box/confidence rules above. A discrete threshold/NMS/face-boundary change is a failure to investigate even if all raw values meet numeric tolerances.                                                              |

Run comparisons in three steps: (1) compare Kotlin-to-RN image preparation stage by stage; (2) feed **the identical captured Kotlin tensor** to RN ORT to isolate runtime differences; (3) feed **the identical captured Kotlin raw output** through the later RN postprocessor, then compare the integrated pipeline. No production RN preprocessing/postprocessing is implemented in this stage.

These inputs are faceless by construction. The source path is intended to reject them at face filtering, but the actual detector result and failure must be captured, not assumed. They can exercise preprocessing, inference and pre-face postprocessing even if the final app result is `InvalidImage`. An empty or failed result cannot establish positive acne/face filtering parity. An additional approved licensed/consented face fixture set is needed later for meaningful positive detections, largest-face choice and boundary coverage. No such photo is included or authorized here.

## What exists versus what remains

| Artifact/evidence                                                | Actual status at end of this stage                                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Five synthetic source images, license note, hash manifest        | **Exists** in `tests/fixtures/acne-parity/`; generator and byte verification passed                                |
| Reproducible input generator                                     | **Exists**, `scripts/generate-acne-parity-fixtures.py`                                                             |
| Stage 3B.7 RN constant-input execution evidence                  | **Existing earlier evidence** in `artifacts/stage3b7/`, with report; not Kotlin and not this fixture reference set |
| Kotlin oriented decoded pixels/geometry                          | **Not captured**                                                                                                   |
| Kotlin letterboxed pixels and normalized NCHW tensors            | **Not captured**                                                                                                   |
| Kotlin complete raw ONNX outputs                                 | **Not captured**                                                                                                   |
| Kotlin pre-face detections, same-call face boxes, final results  | **Not captured**                                                                                                   |
| Actual Kotlin runtime/APK/environment capture, repeatability run | **Not captured**; source runtime pin documented only                                                               |
| Instrumented disposable Kotlin copy/exporter                     | **Not created**; exact required hooks and formats specified above                                                  |
| Kotlin-to-RN comparison / accuracy parity                        | **Not performed**                                                                                                  |

No placeholder binary tensors, empty detection arrays or synthetic numbers have been labeled as Kotlin references. Preparation ends at the instrumentation boundary. The next concrete step is a separately authorized offline capture from a disposable instrumented Kotlin copy, leaving the original project untouched.
