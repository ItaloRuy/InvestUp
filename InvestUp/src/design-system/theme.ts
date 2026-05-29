/**
 * InvestUp Design System — Theme
 * UX/UI Agent | 2026-05-28
 *
 * Exporta o tema completo como objeto único.
 * Pronto para futura extensão de dark mode.
 */

import { colors, typography, spacing, radius, shadows, touchTarget, animation, zIndex } from './tokens';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  touchTarget,
  animation,
  zIndex,
} as const;

export type Theme = typeof theme;

// ─────────────────────────────────────────────
// VARIANTES DE COMPONENTES
// Centraliza variantes para uso consistente
// ─────────────────────────────────────────────

export const buttonVariants = {
  primary: {
    background: colors.primary,
    text: colors.textOnPrimary,
    border: 'transparent',
  },
  success: {
    background: colors.success,
    text: colors.textOnSuccess,
    border: 'transparent',
  },
  outline: {
    background: 'transparent',
    text: colors.primary,
    border: colors.primary,
  },
  ghost: {
    background: 'transparent',
    text: colors.primary,
    border: 'transparent',
  },
  danger: {
    background: colors.danger,
    text: colors.textOnPrimary,
    border: 'transparent',
  },
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export const badgeVariants = {
  xp: {
    background: colors.xp,
    text: '#1A1A00',
  },
  streak: {
    background: colors.streak,
    text: colors.textOnPrimary,
  },
  success: {
    background: colors.successMuted,
    text: colors.success,
  },
  warning: {
    background: colors.warningMuted,
    text: colors.warning,
  },
  bronze: {
    background: '#F5E6D3',
    text: colors.bronze,
  },
  gold: {
    background: '#FFF8DC',
    text: '#B8860B',
  },
} as const;

export type BadgeVariant = keyof typeof badgeVariants;

// ─────────────────────────────────────────────
// PERFIS DE INVESTIDOR — cores temáticas
// ─────────────────────────────────────────────
export const investorProfileColors = {
  conservador: {
    primary: '#2196F3',     // Azul segurança
    accent: '#E3F2FD',
    label: 'Conservador',
    emoji: '🛡️',
  },
  moderado: {
    primary: '#00A86B',     // Verde equilíbrio
    accent: '#E6F7F1',
    label: 'Moderado',
    emoji: '⚖️',
  },
  arrojado: {
    primary: '#FF7B00',     // Laranja ambição
    accent: '#FFF3E6',
    label: 'Arrojado',
    emoji: '🚀',
  },
} as const;

export type InvestorProfile = keyof typeof investorProfileColors;
