# WeGlow 2.0 — Stage 3B.2 dependency compatibility

Date: 2026-11-11. **Published-artifact inspection only; no compatibility claim from builds.** Read [Stage 3B.1](STAGE_3B_AI_FEASIBILITY.md) and `package.json`. Queried npm registry dist-tags/version metadata, downloaded the three release archives into `/private/tmp` for text inspection, and verified each archive against npm's SHA-512 integrity value. No installation/scripts, application changes, prebuild or app builds were performed. Only this report was added to the repository; the pre-existing untracked Stage 3B.1 report was preserved.

## Exact published candidates

These were npm's **latest stable** versions at inspection, not GitHub `main` versions. They are evaluation candidates, not an approved compatible set.

| Package | Exact version / publication (UTC) | Published constraints and assessment |
| --- | --- | --- |
| `onnxruntime-react-native` | **1.24.3**, 2026-03-05 | React/RN peers `*`; Node `>=18`; depends on `onnxruntime-common` **1.24.3**. Android/iOS sources and Expo plugin included. Known Android blockers below make an unchanged integration unsuitable to assume. |
| `react-native-fast-tflite` | **3.0.1**, 2026-04-21 | React/RN/Nitro peers all `*`; Node `>=18`. Ships native sources, generated Nitrogen bindings and delegate config plugin. Android release asset loading has a confirmed source-level defect. |
| `react-native-nitro-modules` | **0.37.2**, 2026-11-03 | React/RN peers `*`; exact dependency `nitro-core` **0.37.2**; no engines field. Its published development manifest uses RN **0.88.0**, React **19.3.0** and matching React types. Useful alignment evidence, not proof for RN 0.88.1 or fast-tflite. |

Primary metadata: [ONNX 1.24.3](https://registry.npmjs.org/onnxruntime-react-native/1.24.3), [fast-tflite 3.0.1](https://registry.npmjs.org/react-native-fast-tflite/3.0.1), [Nitro 0.37.2](https://registry.npmjs.org/react-native-nitro-modules/0.37.2). Beta/nightly/alpha tags were excluded. Newer ONNX core/Web/Node releases do not imply a newer published RN package.

## Baseline, plugins and code generation

The manifest specifies Expo **~58.0.23**, RN **0.88.1**, React **19.3.0**, Node **>=24.13 <25**, npm **>=11 <12** (`packageManager` npm **11.19.0**). Expo documents SDK 58 with RN 0.88/React 19.3, Android API 24+, compile 37/target 36, iOS 16.4+, Xcode 26.4+. None of the three wildcard peer declarations certifies SDK 58, Hermes or its modern architecture. Keep Hermes and the existing architecture; JS-only typechecking cannot validate JSI/native registration. [Expo SDK matrix](https://docs.expo.dev/versions/latest/)

- **ONNX:** the shipped plugin edits Groovy app Gradle dependencies and inserts a Podfile dependency using text anchors; it rejects non-Groovy app Gradle files. It imports an internal Expo `generateCode` helper. Verify plugin evaluation, anchor matching, autolinking/native registration and clean regeneration on SDK 58. Plugin presence alone is insufficient.
- **fast-tflite:** its plugin only enables optional CoreML/Android GPU configuration; with those options off it makes no changes. It does not fix model packaging, minimum SDK or the loader defect. Extend Metro asset types separately. Native autolinking is still required for CPU use.
- **Nitro:** no Expo config plugin is shipped; RN autolinking and RN Codegen are used. The published `codegenConfig` describes `NitroModulesSpec`. Fast-tflite already includes generated Android/iOS/C++ bindings and autolinking files, so ordinary consumption should not require adding/running Nitrogen in the app. Its published development manifest specifies **`nitrogen: ^0.35.2`**, while the candidate runtime is 0.37.2: generated API compatibility is **unknown**. Nitro 0.37.2 includes a Swift bridge generator fix; updating the runtime does not regenerate fast-tflite's shipped Swift code. [Nitro release notes](https://github.com/margelo/nitro/releases/tag/v0.37.2)

Inspected source: the exact npm archives for [ONNX](https://registry.npmjs.org/onnxruntime-react-native/-/onnxruntime-react-native-1.24.3.tgz), [fast-tflite](https://registry.npmjs.org/react-native-fast-tflite/-/react-native-fast-tflite-3.0.1.tgz), and [Nitro](https://registry.npmjs.org/react-native-nitro-modules/-/react-native-nitro-modules-0.37.2.tgz), especially `app.plugin.js`, Gradle/CMake files, podspecs and generated autolinking files. No downloaded code was executed.

## Native findings and known incompatibilities

| Area | Verified source / upstream report | Implication for WeGlow |
| --- | --- | --- |
| ONNX Android | Release Gradle declares AGP 7.4.2, Java 17, and still calls unqualified `VersionNumber.parse`. Upstream reports that exact check failing Gradle evaluation; the inspected app wrapper is **Gradle 9.4.1**. CMake uses C++17 and an RN >=0.76 library branch. | Expected configuration blocker to test first; newer RN branches do not establish modern Gradle support. No local reproduction performed. [Issue #27281](https://github.com/microsoft/onnxruntime/issues/27281) |
| ONNX reproducibility | Android selects native AARs with **`latest.integration`**; iOS podspec depends on **unversioned `onnxruntime-c`**, minimum iOS 15.1. | Pinning npm 1.24.3 alone does not pin the native runtime. Record/lock actual Maven/Pod resolutions before attributing model parity to a version. |
| ONNX 16 KB pages | Published CMake lacks the later flexible-page-size change. Upstream publication-gap report and merged fix distinguish npm 1.24.3 from newer source. | Do not accept as release-ready on 16 KB Android devices; inspect resulting ELF/ZIP alignment and runtime loading after any future fix. [Publication gap](https://github.com/microsoft/onnxruntime/issues/33971), [alignment fix #27523](https://github.com/microsoft/onnxruntime/pull/27523) |
| fast-tflite Android | AGP declaration 9.1.0, C++20; native **LiteRT + LiteRT GPU 1.4.0** are dependencies even for CPU evaluation. Default minimum API **26**, but Gradle prefers root `minSdkVersion`; default NDK property is spelled `ndkversion` while lookup uses `ndkVersion`. | Confirm resolved AGP/Kotlin/NDK and actual API support; root API 24 may override the library default. Neither automatic API 26 enforcement nor API 24 compatibility is established. |
| fast-tflite assets | Published Kotlin loader uses `URL(path).readBytes()` only. Android release `require()` assets can resolve to scheme-less resource names. Fix #193 merged July 17, after the published archive. | Stock bundled `require()` path is blocked. A verified local `file://` model path is a possible POC workaround, not yet tested; it must work without Metro/network. [Issue #191](https://github.com/margelo/react-native-fast-tflite/issues/191), [fix #193](https://github.com/margelo/react-native-fast-tflite/pull/193) |
| fast-tflite iOS | Podspec pins **TensorFlowLiteC 2.17.0**; generated setup enables C++20/Swift C++ interop and depends on Nitro. | Different runtime from Android 1.4.0 and Kotlin's recorded LiteRT 2.1.5. Operator support and numeric parity remain unknown; no model conversion proposed. |
| Nitro native | AGP declaration 9.3.1; NDK fallback **29.0.14206865**, root properties preferred; C++20 and flexible-page-size flag. iOS inherits RN minimum and enables Swift C++ interop. | Resolve against the app/EAS NDK **27.1.12297006**, Kotlin/AGP and Xcode, rather than assuming fallback versions are mandatory. Flags do not validate every transitive binary. |

The AGP declarations above are library source facts, not observed resolved toolchains. Native linking, duplicate runtime symbols, Hermes JSI lifetime behavior, generated bridge compilation, both model operator sets and physical-device performance remain unverified. No authoritative passing matrix for this exact three-package combination on RN 0.88.1 was established.

## EAS cloud viability

**Available in principle, not tested for this dependency set.** Expo currently lists SDK 58 images `ubuntu-26.04-jdk-17-ndk-r27b-sdk-58` (Java 17, NDK 27.1.12297006) and `macos-tahoe-26.6-xcode-27.1` (Xcode 27.1 RC, CocoaPods 1.17.0). Their defaults are Node **22.23.x / npm 10.9.9**, which do not satisfy this repository's engines. A future profile must select compatible Node 24 and ensure npm 11.19.0; record the actual image/tool versions rather than rely on moving aliases. [EAS infrastructure](https://docs.expo.dev/build-reference/infrastructure/)

Cloud iOS compilation avoids this Mac's missing full Xcode. It still requires an Expo project/account, approved source/model upload, compatible Pods, app identity and signing; physical iPhone ad hoc installation requires a paid Apple Developer team and device provisioning. No account/signing readiness was checked. EAS does not repair package source defects, and local iOS simulation remains unavailable. [iOS build process](https://docs.expo.dev/build-reference/ios-builds/), [internal distribution](https://docs.expo.dev/build/internal-distribution/). Expo Go remains UI-only for these integrations.

## Minimal Android-first POC recommendation — future authorization

1. Keep SDK 58/RN 0.88.1 unchanged. Evaluate exact **ONNX 1.24.3** alone first in an isolated slice: establish plugin/native registration and the expected Gradle blocker before introducing Nitro. If blocked, record the error and choose a reviewed reproducible patch/new published release or local Expo native ONNX adapter; do not silently downgrade the app or consume GitHub main.
2. Evaluate **fast-tflite 3.0.1 + Nitro 0.37.2** separately, CPU/no delegates, with one approved fixed tensor and a bundled model resolved to a verified local file. Test generated bindings and Android release offline loading early. Escalate codegen/loader changes to a separate reviewable scope.
3. Only after individual success, combine them and compare existing model outputs against Kotlin fixtures. Record resolved Maven/Pod versions, ABI/page alignment, memory and cold/warm timing. No camera/backend work is needed for this gate.
4. Follow with an EAS iOS development build and physical iPhone CPU parity run. Android success cannot close cross-platform compatibility. Until both pass, these exact versions remain **provisional candidates with known blockers**, not a production dependency recommendation.
