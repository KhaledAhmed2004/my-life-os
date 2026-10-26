/**
 * Vital Serenity design tokens — dark-mode-first health UI.
 */
import tokens from './tokens';

export const Vital = {
  colors: tokens.vitalColors,
  training: tokens.trainingColors,
  fonts: {
    ...tokens.fonts,
    regular: tokens.fonts.sansRegular,
    medium: tokens.fonts.sansMedium,
    semiBold: tokens.fonts.sansSemiBold,
    bold: tokens.fonts.sansBold,
    extraBold: tokens.fonts.sansExtraBold,
  },
  radius: tokens.radius,
} as const;

export const TrainingTheme = tokens.trainingColors;

export const VitalNavTheme = {
  dark: true,
  colors: {
    primary: Vital.colors.primary,
    background: Vital.colors.background,
    card: Vital.colors.surfaceContainer,
    text: Vital.colors.onSurface,
    border: Vital.colors.outlineVariant,
    notification: Vital.colors.secondaryContainer,
  },
  fonts: {
    regular: { fontFamily: 'Manrope_400Regular', fontWeight: '400' as const },
    medium: { fontFamily: 'Manrope_500Medium', fontWeight: '500' as const },
    bold: { fontFamily: 'Manrope_700Bold', fontWeight: '700' as const },
    heavy: { fontFamily: 'Manrope_800ExtraBold', fontWeight: '800' as const },
  },
};
