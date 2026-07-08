// ─── LIGHT THEME — style archibo.tn ────────────────────────────────────────

export const Colors = {
  // ── Backgrounds ──────────────────────────────
  bg:          '#FFFFFF',
  bgAlt:       '#F5F5F7',      // gris très clair iOS-style
  card:        '#FFFFFF',
  cardAlt:     '#F9F9FB',
  surface:     '#F2F2F7',
  surfaceAlt:  '#EBEBF0',

  // ── Borders ──────────────────────────────────
  border:      '#E5E5EA',
  borderMuted: '#EBEBF0',

  // ── Text ─────────────────────────────────────
  textPrimary:   '#1C1C2E',    // navy quasi-noir
  textSecondary: '#48484A',
  textMuted:     '#8E8E93',
  textDisabled:  '#C7C7CC',

  // ── Brand Archibo (extraits du logo & site) ──
  orange:       '#E8674A',     // corail chaud — CTA principal du site
  orangeLight:  '#F28B72',
  orangeDim:    'rgba(232,103,74,0.10)',
  orangeBorder: 'rgba(232,103,74,0.25)',

  navy:         '#2B2D52',     // "BO" du logo — textes forts
  navyLight:    '#3D3F6B',

  teal:         '#1A9E8F',     // vert teal du logo
  tealDim:      'rgba(26,158,143,0.10)',

  gold:         '#D4A843',
  goldDim:      'rgba(212,168,67,0.10)',

  purple:       '#6B5FA6',
  purpleDim:    'rgba(107,95,166,0.10)',

  sky:          '#3A7BD5',
  skyDim:       'rgba(58,123,213,0.10)',

  rose:         '#C86B7A',
  roseDim:      'rgba(200,107,122,0.10)',

  // ── Semantic ─────────────────────────────────
  urgent:       '#FF3B30',
  urgentDim:    'rgba(255,59,48,0.09)',
  urgentBorder: 'rgba(255,59,48,0.22)',

  normal:       '#3A7BD5',
  normalDim:    'rgba(58,123,213,0.09)',
  normalBorder: 'rgba(58,123,213,0.22)',

  low:          '#8E8E93',
  lowDim:       'rgba(142,142,147,0.09)',
  lowBorder:    'rgba(142,142,147,0.22)',

  success:      '#34C759',
  successDim:   'rgba(52,199,89,0.10)',
  successBorder:'rgba(52,199,89,0.25)',

  warning:      '#FF9500',
  warningDim:   'rgba(255,149,0,0.10)',
  warningBorder:'rgba(255,149,0,0.25)',

  // alias pour compat
  get accent()       { return Colors.orange; },
  get accentDim()    { return Colors.orangeDim; },
  get accentBorder() { return Colors.orangeBorder; },

  // ── Mosaïque palette ─────────────────────────
  mosaic: [
    '#3A7BD5','#2B2D52','#1A9E8F','#D4A843',
    '#E8674A','#6B5FA6','#C86B7A','#3D6B4A',
  ],
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#2B2D52',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#2B2D52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: '#2B2D52',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
    elevation: 12,
  },
} as const;

export const Radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl':28,
  full: 999,
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  '2xl':32,
  '3xl':48,
} as const;
