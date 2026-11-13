const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packageDirectory = path.join(
  root,
  'node_modules/onnxruntime-react-native',
);
const installed = JSON.parse(
  readFileSync(path.join(packageDirectory, 'package.json'), 'utf8'),
);
if (installed.version !== '1.24.3') {
  throw new Error(
    `ONNX Gradle patch requires 1.24.3; found ${installed.version}`,
  );
}

const patch = path.join(root, 'patches/onnxruntime-react-native+1.24.3.patch');
const options = { cwd: root, stdio: 'pipe' };
try {
  execFileSync('git', ['apply', '--reverse', '--check', patch], options);
  console.log('ONNX 1.24.3 Gradle patch already applied.');
} catch {
  // Fail if the expected upstream context has changed; never apply partially.
  execFileSync('git', ['apply', '--check', patch], options);
  execFileSync('git', ['apply', patch], options);
  console.log('Applied ONNX 1.24.3 Gradle VersionNumber patch.');
}
