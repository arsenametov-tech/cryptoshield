export const colors = {
  // Dark theme colors
  background: '#0a0e1a',
  backgroundSecondary: '#131925',
  surface: '#1a2235',
  surfaceLight: '#252d3f',

  // Primary colors (Teal/Green)
  primary: '#00ffc8',
  primaryDark: '#00d4a8',
  primaryGlow: 'rgba(0, 255, 200, 0.3)',

  // Status colors
  success: '#00ff88',
  warning: '#ffaa00',
  danger: '#ff3366',
  dangerDark: '#cc0033',

  // Text colors
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',

  // Other colors
  border: '#2a3448',
  borderLight: '#3a4558',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    huge: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
