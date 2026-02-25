// src/theme/theme.ts

export const COLORS = {
  dark: {
    background: '#0D0D0D',
    surface: '#161616',
    surfaceElevated: '#1E1E1E',
    card: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.1)',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textMuted: '#666666',
    accent: '#7F5AF0',
    accentSecondary: '#2CB67D',
    accentTertiary: '#FF6B6B',
    gradientStart: '#7F5AF0',
    gradientEnd: '#2CB67D',
    glow: 'rgba(127, 90, 240, 0.4)',
    glowGreen: 'rgba(44, 182, 125, 0.4)',
    success: '#2CB67D',
    warning: '#F4A261',
    error: '#FF6B6B',
  },
  light: {
    background: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceElevated: '#EEEEEE',
    card: 'rgba(0,0,0,0.04)',
    border: 'rgba(0,0,0,0.1)',
    text: '#0D0D0D',
    textSecondary: '#444444',
    textMuted: '#999999',
    accent: '#6040D0',
    accentSecondary: '#1A9B5C',
    accentTertiary: '#E05555',
    gradientStart: '#6040D0',
    gradientEnd: '#1A9B5C',
    glow: 'rgba(96, 64, 208, 0.2)',
    glowGreen: 'rgba(26, 155, 92, 0.2)',
    success: '#1A9B5C',
    warning: '#E08040',
    error: '#E05555',
  }
};

export const FONTS = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
    display: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export type ThemeMode = 'dark' | 'light';
export type Theme = typeof COLORS.dark;
