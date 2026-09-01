import { createTheme } from '@shopify/restyle';

export const theme = createTheme({
  colors: {
    background: '#FFF8FA',
    surface: '#FFFFFF',
    periodActual: '#E83F70',
    periodAction: '#F2537E',
    periodPredicted: '#FFD8E5',
    symptom: '#8D76C9',
    positive: '#4AAE91',
    textPrimary: '#3C2932',
    textMuted: '#8B7A82',
    border: '#EEE7EA',
  },
  spacing: {
    none: 0,
    xs: 4,
    s: 8,
    m: 16,
    page: 20,
    l: 24,
    xl: 32,
  },
  borderRadii: {
    none: 0,
    s: 4,
    m: 8,
  },
  textVariants: {
    defaults: {
      color: 'textPrimary',
      fontSize: 16,
      lineHeight: 24,
    },
    title: {
      color: 'textPrimary',
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 36,
    },
    body: {
      color: 'textPrimary',
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      color: 'textMuted',
      fontSize: 13,
      lineHeight: 20,
    },
  },
});

export type AppTheme = typeof theme;
