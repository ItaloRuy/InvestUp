/**
 * StreakCounter — Contador de dias consecutivos de estudo
 * UX/UI Agent | Tier 1
 *
 * Exibe chama animada 🔥, contador de dias e estado (ativo/quebrado).
 * Variantes: compact (header), full (profile), card (dashboard).
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radius, typography, animation, shadows } from '@/design-system/tokens';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
interface StreakCounterProps {
  /** Número de dias consecutivos */
  days: number;
  /** Se o streak está ativo hoje */
  isActive?: boolean;
  /** Exibição compacta (só ícone + número) */
  variant?: 'compact' | 'full' | 'card';
  /** Estilo externo */
  style?: ViewStyle;
}

// ─────────────────────────────────────────────
// HOOK — animação da chama
// ─────────────────────────────────────────────
function useFlameAnimation(isActive: boolean) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) return;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) return;

      const flicker = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.08,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 0.95,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      flicker.start();
      return () => flicker.stop();
    });
  }, [isActive]);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-4deg', '4deg'],
  });

  return { scaleAnim, rotate };
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
export const StreakCounter: React.FC<StreakCounterProps> = ({
  days,
  isActive = true,
  variant = 'compact',
  style,
}) => {
  const { scaleAnim, rotate } = useFlameAnimation(isActive);

  if (variant === 'compact') {
    return (
      <View
        style={[styles.compact, style]}
        accessibilityRole="text"
        accessibilityLabel={`Streak: ${days} dias${isActive ? ' ativo' : ' — quebrado'}`}
      >
        <Animated.Text
          style={[
            styles.flameEmoji,
            { transform: [{ scale: scaleAnim }, { rotate }] },
            !isActive && styles.inactiveEmoji,
          ]}
        >
          🔥
        </Animated.Text>
        <Text style={[styles.compactNumber, !isActive && styles.inactiveText]}>
          {days}
        </Text>
      </View>
    );
  }

  if (variant === 'full') {
    return (
      <View
        style={[styles.full, style]}
        accessibilityRole="text"
        accessibilityLabel={`Streak de ${days} dias${isActive ? ' ativo' : ', quebrado'}`}
      >
        <Animated.Text
          style={[
            styles.flameLarge,
            { transform: [{ scale: scaleAnim }, { rotate }] },
            !isActive && styles.inactiveEmoji,
          ]}
        >
          {isActive ? '🔥' : '🩶'}
        </Animated.Text>
        <Text style={[styles.fullNumber, !isActive && styles.inactiveText]}>
          {days}
        </Text>
        <Text style={[styles.fullLabel, !isActive && styles.inactiveText]}>
          {days === 1 ? 'dia' : 'dias'}
        </Text>
        {!isActive && (
          <Text style={styles.brokenLabel}>Streak perdido</Text>
        )}
      </View>
    );
  }

  // variant === 'card'
  return (
    <View
      style={[styles.card, style]}
      accessibilityRole="text"
      accessibilityLabel={`Sequência de estudos: ${days} dias`}
    >
      <View style={styles.cardHeader}>
        <Animated.Text
          style={[
            styles.flameEmoji,
            { transform: [{ scale: scaleAnim }, { rotate }] },
          ]}
        >
          🔥
        </Animated.Text>
        <Text style={styles.cardTitle}>Sequência</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardNumber}>{days}</Text>
        <Text style={styles.cardUnit}>dias</Text>
      </View>

      {isActive ? (
        <Text style={styles.cardStatus}>✅ Estudou hoje!</Text>
      ) : (
        <Text style={[styles.cardStatus, { color: colors.textMuted }]}>
          Estude hoje para manter
        </Text>
      )}

      {/* Mini calendário dos últimos 7 dias */}
      <WeekCalendar activeCount={Math.min(days, 7)} />
    </View>
  );
};

// ─────────────────────────────────────────────
// SUB-COMPONENTE: mini calendário 7 dias
// ─────────────────────────────────────────────
const DAYS_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const WeekCalendar: React.FC<{ activeCount: number }> = ({ activeCount }) => (
  <View style={styles.week}>
    {DAYS_LABELS.map((day, i) => {
      const isStudied = i < activeCount;
      const isToday = i === 6;
      return (
        <View key={i} style={styles.dayContainer}>
          <Text style={styles.dayLabel}>{day}</Text>
          <View
            style={[
              styles.dayDot,
              isStudied ? styles.dayDotActive : styles.dayDotInactive,
              isToday && styles.dayDotToday,
            ]}
          >
            {isStudied && <Text style={styles.dayDotCheck}>✓</Text>}
          </View>
        </View>
      );
    })}
  </View>
);

// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  // Compact
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flameEmoji: {
    fontSize: 20,
  },
  compactNumber: {
    ...typography.bodyBold,
    color: colors.streak,
  },

  // Full
  full: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  flameLarge: {
    fontSize: 48,
  },
  fullNumber: {
    ...typography.display,
    color: colors.streak,
  },
  fullLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  brokenLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.label,
    color: colors.textSecondary,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  cardNumber: {
    ...typography.number,
    color: colors.streak,
  },
  cardUnit: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  cardStatus: {
    ...typography.caption,
    color: colors.success,
  },

  // Week calendar
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  dayContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotActive: {
    backgroundColor: colors.streak,
  },
  dayDotInactive: {
    backgroundColor: colors.border,
  },
  dayDotToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayDotCheck: {
    fontSize: 12,
    color: colors.textOnPrimary,
    fontWeight: '700',
  },

  // Estado inativo
  inactiveEmoji: {
    opacity: 0.4,
  },
  inactiveText: {
    color: colors.textMuted,
  },
});
