// Unmodified upstream files; see assets/fonts/manifest.json and family OFL.txt files.
export const fontFamily = {
  regular: 'Inter-Regular',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  editorialItalic: 'InstrumentSerif-Italic',
} as const;

export const welcomeFonts = {
  [fontFamily.regular]: require('../../../assets/fonts/inter/Inter-Regular.ttf'),
  [fontFamily.semibold]: require('../../../assets/fonts/inter/Inter-SemiBold.ttf'),
  [fontFamily.bold]: require('../../../assets/fonts/inter/Inter-Bold.ttf'),
  [fontFamily.editorialItalic]: require('../../../assets/fonts/instrument-serif/InstrumentSerif-Italic.ttf'),
};

export const jakartaFamily = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extrabold: 'PlusJakartaSans-ExtraBold',
} as const;

export const adultConfirmationFonts = {
  [jakartaFamily.regular]: require('../../../assets/fonts/plus-jakarta-sans/PlusJakartaSans-Regular.ttf'),
  [jakartaFamily.medium]: require('../../../assets/fonts/plus-jakarta-sans/PlusJakartaSans-Medium.ttf'),
  [jakartaFamily.semibold]: require('../../../assets/fonts/plus-jakarta-sans/PlusJakartaSans-SemiBold.ttf'),
  [jakartaFamily.bold]: require('../../../assets/fonts/plus-jakarta-sans/PlusJakartaSans-Bold.ttf'),
  [jakartaFamily.extrabold]: require('../../../assets/fonts/plus-jakarta-sans/PlusJakartaSans-ExtraBold.ttf'),
};
