import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseEnvironment } from './environment';

test('a clean checkout defaults to isolated development configuration', () => {
  assert.deepEqual(parseEnvironment({ appEnvironment: undefined }), {
    appEnvironment: 'development',
  });
});

test('all supported environments are accepted without coercion', () => {
  for (const value of ['development', 'staging', 'production']) {
    assert.equal(
      parseEnvironment({ appEnvironment: value }).appEnvironment,
      value,
    );
  }
});

test('blank, misspelled and padded selectors fail instead of choosing an environment', () => {
  for (const value of ['', 'prod', 'Production', ' staging ', 'test']) {
    assert.throws(() => parseEnvironment({ appEnvironment: value }), {
      message:
        'EXPO_PUBLIC_APP_ENV must be development, staging, or production.',
    });
  }
});

test('validation failures do not disclose supplied values', () => {
  const sensitiveValue = 'sensitive-input-that-must-not-appear';
  assert.throws(
    () => parseEnvironment({ appEnvironment: sensitiveValue }),
    (error: unknown) =>
      error instanceof Error && !error.message.includes(sensitiveValue),
  );
});

test('validated configuration is immutable', () => {
  assert.ok(Object.isFrozen(parseEnvironment({ appEnvironment: undefined })));
});
