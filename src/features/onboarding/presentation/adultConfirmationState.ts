export type AdultConfirmationState = Readonly<{ confirmed: boolean }>;

export function createAdultConfirmationState(): AdultConfirmationState {
  return { confirmed: false };
}

export function toggleAdultConfirmation(
  state: AdultConfirmationState,
): AdultConfirmationState {
  return { confirmed: !state.confirmed };
}

export function getContinuePreview(state: AdultConfirmationState) {
  if (!state.confirmed) return null;
  return {
    title: 'Development preview',
    message:
      'The skin questionnaire is not implemented yet. This preview stays on Adult Confirmation. Your confirmation has not been saved or verified.',
  };
}
