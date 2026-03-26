/**
 * Design System Tokens
 * Single source of truth for all design decisions
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Brand palette with light/dark mode variants
  brand: {
    amethyst: { light: '#5835B0', dark: '#8B6AFF' },
    lilac: { light: '#BF92F0', dark: '#BF92F0' },
    rose: { light: '#D78F8D', dark: '#D78F8D' },
    gold: { light: '#DBA166', dark: '#DBA166' },
    peridot: { light: '#87AA61', dark: '#87AA61' },
  },

  // Semantic colors
  semantic: {
    accent: { light: '#5835B0', dark: '#8B6AFF' },
    error: { light: '#DC2626', dark: '#EF4444' },
    success: { light: '#16A34A', dark: '#22C55E' },
    warning: { light: '#D97706', dark: '#F59E0B' },
  },

  // Background colors
  background: {
    dark: '#0a0a0a',
    light: '#FAF8F4',
    surface: { light: '#FFFFFF', dark: '#141414' },
  },

  // Text colors
  text: {
    primary: { light: '#1A1A1A', dark: '#FAFAFA' },
    secondary: { light: '#4A4A4A', dark: '#A1A1A1' },
    muted: { light: '#6B6B6B', dark: '#737373' },
  },

  // Border colors
  border: {
    light: 'rgba(0, 0, 0, 0.08)',
    dark: 'rgba(255, 255, 255, 0.08)',
  },
}

// Palette order for charts, gradients, sequences
export const paletteOrder = ['amethyst', 'lilac', 'rose', 'gold', 'peridot']

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fonts: {
    display: "'Silk Serif', serif",
    body: "'Satoshi', sans-serif",
    mono: "'Azeret Mono', monospace",
  },

  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },

  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  leading: {
    none: 1,
    tight: 1.15,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.625,
  },

  tracking: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
}

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
}

// =============================================================================
// ANIMATION
// =============================================================================

export const animation = {
  easing: {
    default: 'cubic-bezier(0.22, 1, 0.36, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    snappy: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  stagger: {
    fast: 50,
    normal: 100,
    slow: 150,
  },
}

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// =============================================================================
// EFFECTS
// =============================================================================

export const effects = {
  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },

  blur: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
  },
}

// =============================================================================
// HELPERS
// =============================================================================

export const getColor = (colorKey, isDark) =>
  colors.brand[colorKey]?.[isDark ? 'dark' : 'light'] ||
  colors.brand[colorKey]?.light

export const getPaletteColors = (isDark) =>
  paletteOrder.map((key) => getColor(key, isDark))

export const getSemanticColor = (key, isDark) =>
  colors.semantic[key]?.[isDark ? 'dark' : 'light']
