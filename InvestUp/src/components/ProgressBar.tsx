/**
 * ProgressBar — Barra de progresso da trilha de aprendizado
 * UX/UI Agent | Tier 1
 *
 * Animada, acessível, com suporte a reduced motion.
 * Usada em: TrailScreen, LessonHeader, ProfileScreen.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  ViewStyle,
  Text,
} from 'react-native';
import { colors, spacing, radius, animation, typography } from '@/design-system/tokens';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
interface ProgressBarProps {
  /** Valor atual (0-100) */
  progress: number;
  /** Cor da barra preenchida */
  color?: string;
  /** Cor do fundo */
  trackColor?: string;
  /** Altura da barra em px */
  height?: number;
  /** Mostrar label "X%" */
  showLabel?: boolean;
  /** Posição do label */
  labelPosition?: 'right' | 'above';
  /** Animar ao montar */
  animated?: boolean;
  /** Estilo externo do container */
  style?: ViewStyle;
  /** Acessibilidade */
  accessibilityLabel?: string;
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.success,
  trackColor = colors.border,
  height = 8,
  showLabel = false,
  labelPosition = 'right',
  animated = true,
  style,
  accessibilityLabel,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const widthAnim = useRef(new Animated.Value(0)).current;
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setPrefersReducedMotion);
  }, []);

  useEffect(() => {
    if (animated && !prefersReducedMotion) {
      Animated.timing(widthAnim, {
        toValue: clampedProgress,
        duration: animation.slow,
        useNativeDriver: false, // width não suporta native driver
      }).start();
    } else {
      widthAnim.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, prefersReducedMotion]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const label = (
    showLabel ? (
      <Text style={styles.label}>{Math.round(clampedProgress)}%</Text>
    ) : null
  );

  return (
    <View
      style={[
        labelPosition === 'right' ? styles.rowContainer : styles.columnContainer,
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: clampedProgress,
      }}
      accessibilityLabel={accessibilityLabel ?? `Progresso: ${Math.round(clampedProgress)}%`}
    >
      {labelPosition === 'above' && label}

      <View
        style={[
          styles.track,
          { backgroundColor: trackColor, height, borderRadius: height / 2 },
          labelPosition === 'right' && styles.trackFlex,
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              height,
              borderRadius: height / 2,
              width: animatedWidth,
            },
          ]}
        />
      </View>

      {labelPosition === 'right' && label}
    </View>
  );
};

// ─────────────────────────────────────────────
// VARIANTE: Segmentada (para quizzes — X/Y questões)
// ─────────────────────────────────────────────
interface SegmentedProgressProps {
  total: number;
  current: number;
  color?: string;
  style?: ViewStyle;
}

export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({
  total,
  current,
  color = colors.success,
  style,
}) => {
  return (
    <View
      style={[styles.segmented, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current }}
      accessibilityLabel={`Questão ${current} de ${total}`}
    >
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            { flex: 1 },
            index < current
              ? { backgroundColor: color }
              : { backgroundColor: colors.border },
            index < total - 1 && styles.segmentGap,
          ]}
        />
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  columnContainer: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  trackFlex: {
    flex: 1,
  },
  track: {
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    minWidth: 32,
    textAlign: 'right',
  },
  segmented: {
    flexDirection: 'row',
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  segment: {
    borderRadius: radius.full,
  },
  segmentGap: {
    marginRight: 3,
  },
});
