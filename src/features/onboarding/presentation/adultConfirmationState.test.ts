import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createAdultConfirmationState,
  getContinuePreview,
  toggleAdultConfirmation,
} from './adultConfirmationState';

test('a new visit starts unconfirmed and cannot continue', () => {
  const state = createAdultConfirmationState();
  assert.equal(state.confirmed, false);
  assert.equal(getContinuePreview(state), null);
});

test('confirmation enables only the development-preview outcome', () => {
  const state = toggleAdultConfirmation(createAdultConfirmationState());
  assert.equal(state.confirmed, true);
  assert.deepEqual(getContinuePreview(state), {
    title: 'Development preview',
    message:
      'The skin questionnaire is not implemented yet. This preview stays on Adult Confirmation. Your confirmation has not been saved or verified.',
  });
});

test('unchecking immediately blocks Continue again', () => {
  const confirmed = toggleAdultConfirmation(createAdultConfirmationState());
  const unchecked = toggleAdultConfirmation(confirmed);
  assert.equal(getContinuePreview(unchecked), null);
});

test('a fresh visit does not inherit confirmation from an earlier visit', () => {
  const firstVisit = toggleAdultConfirmation(createAdultConfirmationState());
  const nextVisit = createAdultConfirmationState();
  assert.equal(firstVisit.confirmed, true);
  assert.equal(nextVisit.confirmed, false);
  assert.equal(getContinuePreview(nextVisit), null);
});
