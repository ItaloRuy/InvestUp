/**
 * InvestUp Design System — Tokens
 * UX/UI Agent | 2026-05-28
 *
 * Fonte de verdade para cores, tipografia, espaçamento e outros valores visuais.
 * Nunca use valores literais nos componentes — sempre importe daqui.
 */

// ─────────────────────────────────────────────
// CORES
// ─────────────────────────────────────────────
export const colors = {
  // Primárias — identidade do app
  primary: '#1E3A5F',        // Azul Confiança — botões principais, headers
  primaryLight: '#2E5080',   // Azul claro — hover / pressed state
  primaryMuted: '#EBF0F7',   // Azul pastel — backgrounds de destaque leve

  // Sucesso / Crescimento
  success: '#00A86B',        // Verde Crescimento — ganhos, progresso positivo
  successLight: '#00C27C',   // Verde claro — hover
  successMuted: '#E6F7F1',   // Verde pastel — backgrounds de sucesso

  // Alerta / Atenção
  warning: '#FF7B00',        // Laranja — streaks, alertas, destaques
  warningLight: '#FF9933',
  warningMuted: '#FFF3E6',

  // Erro / Perigo
  danger: '#E63946',         // Vermelho — erros, quiz incorreto, perda
  dangerLight: '#FF5A65',
  dangerMuted: '#FDECEA',

  // Neutras
  background: '#F8F9FA',     // Fundo principal de todas as telas
  surface: '#FFFFFF',        // Cards, modais, inputs
  surfaceElevated: '#FFFFFF', // Superfície com sombra
  border: '#E5E7EB',         // Bordas e divisores
  borderStrong: '#D1D5DB',

  // Texto
  textPrimary: '#1A1A2E',    // Texto principal — alta legibilidade
  textSecondary: '#4B5563',  // Texto secundário — descrições
  textMuted: '#9CA3AF',      // Placeholders, labels desabilitados
  textOnPrimary: '#FFFFFF',  // Texto sobre fundo primário (azul)
  textOnSuccess: '#FFFFFF',
  textLink: '#1E3A5F',       // Links

  // Gamificação
  xp: '#FFD700',             // Dourado XP — sempre que mostrar pontos
  streak: '#FF6B35',         // Laranja streak — diferente do warning
  streakMuted: '#FFF0EB',

  // Ligas
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold: '#FFD700',
  diamond: '#60E3F7',
  legendary: '#B467FF',

  // Transparência (para overlays)
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.15)',
} as const;

export type ColorKey = keyof typeof colors;

// ─────────────────────────────────────────────
// TIPOGRAFIA
// ─────────────────────────────────────────────
export const typography = {
  // Display — títulos de telas de destaque
  display: {
    fontSize: 36,
    fontWeight: '800' as const,
    lineHeight: 44,
    letterSpacing: -0.5,
  },

  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },

  // Body
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22,
  },

  // Utilitários
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700' as const,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },

  // Números financeiros — mono para alinhamento
  number: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    fontVariant: ['tabular-nums'] as const,
  },
  numberSmall: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

// ─────────────────────────────────────────────
// ESPAÇAMENTO (base 4px)
// ─────────────────────────────────────────────
export const spacing = {
  px: 1,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ─────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

// ─────────────────────────────────────────────
// SOMBRAS
// ─────────────────────────────────────────────
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

// ─────────────────────────────────────────────
// TAMANHOS DE TOQUE (WCAG — mínimo 44x44px)
// ─────────────────────────────────────────────
export const touchTarget = {
  min: 44,   // mínimo WCAG
  sm: 48,
  md: 56,    // botão padrão
  lg: 64,
} as const;

// ─────────────────────────────────────────────
// ANIMAÇÕES
// ─────────────────────────────────────────────
export const animation = {
  fast: 150,    // micro-interações (hover, press)
  normal: 250,  // transições de estado
  slow: 350,    // modais, sheets
  xSlow: 500,   // celebrações, onboarding
} as const;

// ─────────────────────────────────────────────
// BREAKPOINTS (para tablets futuros)
// ─────────────────────────────────────────────
export const breakpoints = {
  phone: 0,
  tablet: 768,
} as const;

// ─────────────────────────────────────────────
// Z-INDEX
// ─────────────────────────────────────────────
export const zIndex = {
  base: 0,
  card: 10,
  dropdown: 100,
  modal: 200,
  toast: 300,
  tooltip: 400,
} as const;
