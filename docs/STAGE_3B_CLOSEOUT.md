# WeGlow Stage 3B.8B — AI research closeout

Date: 2026-11-13. **Experimental Android feasibility research preserved; production AI integration remains deferred. Kotlin parity and iOS compatibility are not established.**

## Repository state and scope

Experimental worktree: `/private/tmp/weglow-stage3b3-onnx`, branch `poc/stage3b3-onnx-android`. Main worktree: `/Users/mac/Documents/weglow-react-native`, clean on `main` at **`f1294f0315ca077afc0c61d0b05ff8849c6edaff`** when inspected. The original Kotlin project remains read-only and was not modified.

At the start of closeout the experimental tree was also clean, at **`96d31027bf49030c9d7b2d65ae8e8b2e0b8b71ba`**. All Stage 3B.3–3B.8A implementation and fixture files had already been committed. There were no untracked source files to recover. Existing commits were retained without rewriting or duplicating them; this stage adds the closeout report in a new descriptive commit.

Configured remote: `origin`, `https://github.com/team03weglow-droid/weglow-react-native.git` for fetch/push. Local remote-tracking refs initially matched the local main and experimental tips. This is a local observation, not a network verification. **No fetch, push, merge, main checkout change, dependency/native configuration change, original Kotlin modification, worktree deletion or Stage 4 UI work occurred.**

## Preserved commit inventory

| Stage      | Existing commit                            | Preserved result                                                                                          |
| ---------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 3B.3       | `46ad83765eba9afbe4c7bbb2d42b958a7314379f` | Isolated ONNX dependency/plugin experiment and first Gradle blocker report                                |
| 3B.4       | `b98355d7d06380e105f0fb49cdd3ff79a209473b` | Reproducible Gradle version-comparison patch and successful Android build report                          |
| 3B.5       | `a17ba9728332e36bcecd6d7793e1aa225d51e7f8` | Opt-in synthetic smoke implementation and native-registration blocker evidence                            |
| 3B.6       | `81a3ec282a381c60b6f0ab41b242cdf565f4fd72` | Explicit Android package registration and successful emulator smoke inference                             |
| 3B.7–3B.8A | `96d31027bf49030c9d7b2d65ae8e8b2e0b8b71ba` | Real YOLO opt-in test, five synthetic images/generator, model test report and Kotlin fixture/capture plan |

The closeout commit is the commit that adds this file. Its full ID and the final backup checksum are recorded in the backup's `VERIFICATION.json`, rather than embedding a circular self-commit ID in this document.

Important files differing from main:

- `package.json`, `package-lock.json`, `app.config.ts`: exact ONNX RN/common 1.24.3 dependency and Expo plugin registration from the experiment. No new changes to them in closeout.
- `patches/onnxruntime-react-native+1.24.3.patch` and `scripts/apply-onnx-gradle-patch.cjs`: version-guarded, context-checked Gradle patch/postinstall mechanism.
- `react-native.config.js`: explicit `ai.onnxruntime.reactnative.OnnxruntimePackage` registration through RN autolinking.
- `src/dev/onnx-smoke/`: control, runner, 123-byte `add-bias.onnx` and identical JSON fixture; `scripts/generate-onnx-smoke-fixture.cjs` regenerates this tiny synthetic graph.
- `src/dev/onnx-yolo/`: separate opt-in real-model control and CPU runner; `src/features/welcome/presentation/WelcomeScreen.tsx` hosts the two Android development-only controls.
- `scripts/generate-acne-parity-fixtures.py` and `tests/fixtures/acne-parity/`: five synthetic PNG/JPEG source images, CC0 dedication and hash/provenance manifest. Total image bytes **991,671**. They are test inputs, not Kotlin references.
- `docs/STAGE_3B_ONNX_ANDROID_POC.md`, `STAGE_3B_ONNX_ANDROID_PATCH.md`, `STAGE_3B_ONNX_RUNTIME_SMOKE_TEST.md`, `STAGE_3B_ONNX_NATIVE_REGISTRATION.md`, `STAGE_3B_REAL_YOLO_MODEL_TEST.md`, `STAGE_3B_KOTLIN_PARITY_FIXTURES.md`, and this closeout. Stage 3B.1/3B.2 reports are inherited through main's history and included in the backup.

## Exclusions and sensitive-data review

The backup is Git history only, not a filesystem copy of the worktree. Existing ignore rules exclude `android/`, `ios/`, `node_modules/`, `.expo/`, `artifacts/`, logs, APK/AAB/IPA outputs, signing files and local environment files. Inspection found ignored generated Android files, dependency files, Expo state, 23 files under `artifacts/`, and the Metro log; none are tracked or included by the Git bundle. No force-add was used.

The original **44,733,219-byte** acne model is **not** in Git or the backup. Its identity remains documented as SHA-256 `f562b417738082c7e90414bc691806fd0588f8a196599dd843fe012cb752fa1a`. Emulator-staged copies, native libraries, downloaded runtimes, APKs, logs and caches remain local and are not backup dependencies. Raw runtime logs/screenshots are intentionally not preserved in Git; the reports retain selected evidence, commands and hashes. Historical build/test evidence in reports was not rerun during closeout.

Reviewed the tracked binary inventory: existing app icons, the tiny synthetic ONNX graph, and five generated chart images. The fixture regeneration check reproduces the exact image bytes and EXIF metadata; the orientation JPEG was also visually confirmed as a chart. There are no personal face photographs in these experimental fixtures.

A credential-pattern scan covered all **73 reachable blobs** before the closeout commit, including earlier revisions, and found no private-key headers, AWS access-key IDs, GitHub tokens, JWT-shaped tokens, OpenAI live/project keys, Stripe live keys or Slack token matches. The tracked `.env.example` contains only a public development selector and comments. No reachable blob exceeds **2 MiB**; no tracked file exceeds **1,000,000 bytes** before this report. This is a bounded source review/pattern scan, not a claim that every possible secret format can be detected. No credentials or large production model binaries were identified for inclusion.

## Validation results

| Check                                                      | Result and limit                                                                                                                                                                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                        | **PASS**                                                                                                                                                                                                                                    |
| Targeted ESLint                                            | **PASS** for app config, RN config, smoke/Yolo controls/runners, welcome screen and synthetic ONNX generator                                                                                                                                |
| Patch-script lint with `--global __dirname`                | **PASS**; explicitly supplies the actual CommonJS global for this targeted invocation only; no config/source changed                                                                                                                        |
| `npm run lint`                                             | **FAIL**, the previously documented `scripts/apply-onnx-gradle-patch.cjs:5` `__dirname` / `no-undef` error. Retained and reported, not silently waived as a full pass                                                                       |
| Targeted Prettier                                          | **PASS** for current implementation/config, fixture manifest, patch/smoke/model/parity reports; closeout checked before commit                                                                                                              |
| `npm run format:check`                                     | **FAIL**, existing formatting findings in `STAGE_3A_PROGRESS.md`, `STAGE_3B_AI_FEASIBILITY.md`, `STAGE_3B_DEPENDENCY_COMPATIBILITY.md`, `STAGE_3B_ONNX_ANDROID_POC.md`, `STAGE_3B_ONNX_NATIVE_REGISTRATION.md`, `WeGlow_Progress_Report.md` |
| `npm test`                                                 | **PASS**, 5 environment/bootstrap tests; not inference or parity tests                                                                                                                                                                      |
| `python3 scripts/generate-acne-parity-fixtures.py --check` | **PASS**, five source images and manifest reproduce byte-for-byte using existing Pillow 12.3.0                                                                                                                                              |
| `git fsck --full`                                          | **PASS**, no object-integrity errors                                                                                                                                                                                                        |
| Working/index closeout diff checks                         | `git diff --check` passed before staging; staged report checked before committing                                                                                                                                                           |
| `git diff --check main...HEAD` before closeout             | One inherited trailing-whitespace finding at patch file line 7: the single-space unified-diff context marker for a blank line. Preserved as valid patch syntax; no native patch changed                                                     |

No dependency installation, APK rebuild or new inference was necessary for preserving the existing work. Repository-wide lint/format checks are **not all green**; the table above is the validation record.

## What passed and what remains unverified

Recorded completed experiments:

- ONNX native Android build after the narrow Gradle patch, and RN package registration through explicit autolinking configuration.
- Stage 3B.6: actual emulator CPU Add graph inference, `[-1,0,5] + [1,2,3] = [0,2,8]`.
- Stage 3B.7: unchanged real YOLO model loaded in **221.6 ms**, accepted float32 `images` `[1,3,640,640]`, executed one CPU run in **396.5 ms**, returned float32 `output0` `[1,14,8400]`; all **117,600** output values finite. These are single emulator observations, not device benchmarks.
- Stage 3B.8A: five synthetic source fixtures and exact capture/format/tolerance plan prepared.

Open gates: Kotlin decoded pixels, normalized tensors, full raw outputs, pre-face detections, same-call ML Kit face boxes and final outcomes are **not captured**. No Kotlin-to-RN numerical/accuracy parity or production image preprocessing/postprocessing exists. Positive face/acne fixtures remain a later approval need. Kotlin's runtime source pin is 1.23.2; the experiment's native Android runtime was 1.31.1 while JS binding/common are 1.24.3. The dynamic Maven selector remains a reproducibility issue. iOS, physical-device performance/memory/thermals, repeated runs, release builds, offline first-launch model packaging and 16 KB native alignment remain unverified. TFLite/face-shape execution remains outside this ONNX experiment.

## Durable backup and recovery

Backup target outside temporary storage:

`/Users/mac/Documents/WeGlow_AI_Research_Backup_2026-11-13/`

Finalization creates:

- `stage3b-ai-research.bundle`: full reachable history for the experimental branch and baseline main, with no prerequisite repository required.
- `research.git/`: an independent bare recovery clone from that bundle, with experimental branch as HEAD; no worktree link or object alternates back to `/private/tmp` or the main checkout.
- `VERIFICATION.json`: exact refs/final commit IDs, bundle SHA-256/size, complete source file tree identity, checked fixture hashes, and integrity/restore check outcomes.

The recorded path is the chosen target; successful creation/verification is established by `VERIFICATION.json` and the closeout completion response. Do not infer backup success merely from the existence of this report. Verification must include `git bundle verify`, a standalone bare clone, `git fsck --full`, matching branch/main commit IDs and tree IDs, byte/hash comparison of all tracked files, fixture hash checks and the presence of this closeout document. Bundle size/hash are recorded outside Git to avoid a self-referential checksum.

To recover into a **new** directory later, without touching main:

```sh
git clone --branch poc/stage3b3-onnx-android \
  /Users/mac/Documents/WeGlow_AI_Research_Backup_2026-11-13/stage3b-ai-research.bundle \
  /Users/mac/Documents/weglow-ai-research-recovered
cd /Users/mac/Documents/weglow-ai-research-recovered
git log --oneline main..HEAD
git fsck --full
python3 scripts/generate-acne-parity-fixtures.py --check
```

Choose an unused destination. The verification command for fixtures requires the recorded Pillow environment; Git retrieval/hash verification itself does not. Cloning a local bundle configures `origin` to the local bundle, not GitHub. Dependencies/build tools and the original model are deliberately absent; review `package.json`, pinned versions and patch mechanism before any future installation. The fixture plan documents original model/source hashes needed to resume capture. No current emulator state is needed to recover source/history.

For later integration, review changes against the then-current main in a separate branch/worktree. Extract research reports/fixtures independently when useful; assess the dependency/plugin, Gradle patch and native registration together before adopting runtime code. Do not automatically merge experimental dependency/native settings or development buttons into Stage 4 UI work. Revalidate runtime compatibility and perform the Kotlin reference capture before production AI behavior is proposed. No integration is performed by this closeout.
