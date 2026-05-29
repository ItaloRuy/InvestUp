/**
 * XPBadge — Exibe pontos XP ganhos e saldo atual
 * UX/UI Agent | Tier 1
 *
 * Dois modos:
 *   - "gain": animação de +XP ao ganhar pontos (celebração)
 *   - "total": saldo atual de XP do usuário
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { colors, spacing, radius, typography, animation } from '@/design-system/tokens';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
interface XPBadgeProps {
  /** Quantidade de XP a exibir */
  value: number;
  /** 'gain' mostra "+30 XP" com animação; 'total' mostra saldo */
  mode?: 'gain' | 'total';
  /** Tamanho do badge */
  size?: 'sm' | 'md' | 'lg';
  /** Acionar animação de ganho */
  animate?: boolean;
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
export const XPBadge: React.FC<XPBadgeProps> = ({
  value,
  mode = 'total',
  size = 'md',
  animate = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(mode === 'gain' ? 0 : 1)).current;
  const translateYAnim = useRef(new Animated.Value(mode === 'gain' ? 10 : 0)).current;

  useEffect(() => {
    if (animate && mode === 'gain') {
      AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
        if (reduced) {
          opacityAnim.setValue(1);
          return;
        }

        // Aparece subindo + escala
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: animation.normal,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: -8,
              duration: animation.normal,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: animation.fast,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: animation.fast,
                useNativeDriver: true,
              }),
            ]),
          ]),
          // Espera e desaparece
          Animated.delay(800),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: animation.normal,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [animate]);

  const sizeStyle = sizeMap[size];

  const label =
    mode === 'gain'
      ? `+${value} XP`
      : `${value.toLocaleString('pt-BR')} XP`;

  return (
    <Animated.View
      style={[
        styles.badge,
        sizeStyle.badge,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={mode === 'gain' ? `Ganhou ${value} XP` : `${value} XP no total`}
    >
      <Text style={[styles.icon, sizeStyle.icon]}>⚡</Text>
      <Text style={[styles.text, sizeStyle.text]}>{label}</Text>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// VARIANTE INLINE — para usar em headers e cards
// ─────────────────────────────────────────────
interface XPInlineProps {
  value: number;
  label?: string;
}

export const XPInline: React.FC<XPInlineProps> = ({ value, label = 'XP' }) => (
  <View style={styles.inline} accessibilityLabel={`${value} ${label}`}>
    <Text style={styles.inlineIcon}>⚡</Text>
    <Text style={styles.inlineText}>
      {value.toLocaleString('pt-BR')} {label}
    </Text>
  </View>
);

// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────
const sizeMap = {
  sm: {
    badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, gap: 3 },
    icon: { fontSize: 11 },
    text: { ...typography.captionBold, color: '#1A1A00' },
  },
  md: {
    badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 4 },
    icon: { fontSize: 14 },
    text: { ...typography.label, fontWeight: '700' as const, color: '#1A1A00' },
  },
  lg: {
    badge: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + spacing.xs, gap: 6 },
    icon: { fontSize: 18 },
    text: { ...typography.bodyBold, color: '#1A1A00' },
  },
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.xp,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  icon: {},
  text: {},
  // Inline — sem background, só ícone + número
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  inlineIcon: {
    fontSize: 14,
  },
  inlineText: {
    ...typography.label,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
