/**
 * LessonCard — Card de lição na trilha de aprendizado
 * UX/UI Agent | Tier 1
 *
 * Exibe estado da lição: bloqueada, disponível, em progresso, concluída.
 * Design gamificado — visual de "nó" na trilha estilo Duolingo.
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radius, typography, animation, shadows, touchTarget } from '@/design-system/tokens';
import { ProgressBar } from './ProgressBar';
import { XPInline } from './XPBadge';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface LessonCardProps {
  /** ID único da lição */
  id: string;
  /** Título da lição */
  title: string;
  /** Descrição curta */
  description?: string;
  /** Estado atual */
  status: LessonStatus;
  /** Progresso (0-100) — para status in_progress */
  progress?: number;
  /** XP que a lição concede */
  xpReward: number;
  /** Duração estimada em minutos */
  durationMinutes?: number;
  /** Emoji representativo do conteúdo */
  emoji?: string;
  /** Callback ao pressionar */
  onPress: (id: string) => void;
  /** Estilo externo */
  style?: ViewStyle;
}

// ─────────────────────────────────────────────
// MAPA DE STATUS → visual
// ─────────────────────────────────────────────
const statusConfig: Record<LessonStatus, {
  background: string;
  border: string;
  iconBackground: string;
  icon: string;
  labelColor: string;
  badgeText: string;
  badgeBackground: string;
  disabled: boolean;
}> = {
  locked: {
    background: colors.surface,
    border: colors.border,
    iconBackground: colors.border,
    icon: '🔒',
    labelColor: colors.textMuted,
    badgeText: 'Bloqueada',
    badgeBackground: colors.border,
    disabled: true,
  },
  available: {
    background: colors.surface,
    border: colors.primary,
    iconBackground: colors.primaryMuted,
    icon: '▶️',
    labelColor: colors.textPrimary,
    badgeText: 'Iniciar',
    badgeBackground: colors.primary,
    disabled: false,
  },
  in_progress: {
    background: colors.surface,
    border: colors.warning,
    iconBackground: colors.warningMuted,
    icon: '📖',
    labelColor: colors.textPrimary,
    badgeText: 'Continuar',
    badgeBackground: colors.warning,
    disabled: false,
  },
  completed: {
    background: colors.successMuted,
    border: colors.success,
    iconBackground: colors.success,
    icon: '✅',
    labelColor: colors.textPrimary,
    badgeText: 'Revisitar',
    badgeBackground: colors.success,
    disabled: false,
  },
};

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
export const LessonCard: React.FC<LessonCardProps> = ({
  id,
  title,
  description,
  status,
  progress = 0,
  xpReward,
  durationMinutes,
  emoji = '📚',
  onPress,
  style,
}) => {
  const config = statusConfig[status];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (config.disabled) return;
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const accessibilityHint = {
    locked: 'Complete a lição anterior para desbloquear',
    available: 'Toque para iniciar esta lição',
    in_progress: 'Toque para continuar de onde parou',
    completed: 'Toque para revisar o conteúdo',
  }[status];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => !config.disabled && onPress(id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={config.disabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`Lição: ${title}`}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: config.disabled }}
        style={[
          styles.card,
          {
            backgroundColor: config.background,
            borderColor: config.border,
          },
          config.disabled && styles.cardDisabled,
          style,
        ]}
      >
        {/* Ícone da lição */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: config.iconBackground },
          ]}
        >
          <Text style={styles.icon}>
            {status === 'completed' || status === 'locked' ? config.icon : emoji}
          </Text>
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: config.labelColor }]}
              numberOfLines={2}
            >
              {title}
            </Text>
          </View>

          {description && status !== 'locked' && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}

          {/* Barra de progresso — só para in_progress */}
          {status === 'in_progress' && (
            <ProgressBar
              progress={progress}
              color={colors.warning}
              height={5}
              style={styles.progressBar}
            />
          )}

          {/* Metadados */}
          <View style={styles.meta}>
            <XPInline value={xpReward} />
            {durationMinutes && (
              <View style={styles.duration}>
                <Text style={styles.durationText}>⏱ {durationMinutes} min</Text>
              </View>
            )}
          </View>
        </View>

        {/* Badge de ação */}
        <View
          style={[
            styles.badge,
            { backgroundColor: config.badgeBackground },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              config.disabled && { color: colors.textMuted },
            ]}
          >
            {config.badgeText}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// VARIANTE: BOSS (lição final da trilha)
// ─────────────────────────────────────────────
interface BossCardProps {
  title: string;
  description: string;
  xpReward: number;
  status: LessonStatus;
  onPress: () => void;
  style?: ViewStyle;
}

export const BossCard: React.FC<BossCardProps> = ({
  title,
  description,
  xpReward,
  status,
  onPress,
  style,
}) => {
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      accessibilityRole="button"
      accessibilityLabel={`Desafio Final: ${title}`}
      style={[
        styles.bossCard,
        isCompleted && styles.bossCompleted,
        isLocked && styles.bossLocked,
        style,
      ]}
    >
      <Text style={styles.bossEmoji}>{isCompleted ? '🏆' : isLocked ? '🔒' : '⚔️'}</Text>
      <View style={styles.bossContent}>
        <Text style={styles.bossTag}>DESAFIO FINAL</Text>
        <Text style={styles.bossTitle}>{title}</Text>
        <Text style={styles.bossDescription} numberOfLines={2}>
          {description}
        </Text>
        <View style={styles.bossReward}>
          <Text style={styles.bossXP}>⚡ {xpReward} XP</Text>
          {isCompleted && <Text style={styles.bossDone}>Completado ✓</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: spacing.md,
    ...shadows.sm,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 26,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    ...typography.bodyBold,
    flex: 1,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressBar: {
    marginVertical: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  duration: {},
  durationText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    minHeight: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    ...typography.captionBold,
    color: colors.textOnPrimary,
  },

  // Boss card
  bossCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    gap: spacing.md,
    ...shadows.lg,
  },
  bossCompleted: {
    backgroundColor: colors.success,
  },
  bossLocked: {
    backgroundColor: colors.border,
    opacity: 0.7,
  },
  bossEmoji: {
    fontSize: 40,
    flexShrink: 0,
  },
  bossContent: {
    flex: 1,
    gap: spacing.xs,
  },
  bossTag: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.7)',
  },
  bossTitle: {
    ...typography.h3,
    color: colors.textOnPrimary,
  },
  bossDescription: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  bossReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  bossXP: {
    ...typography.label,
    color: colors.xp,
    fontWeight: '700',
  },
  bossDone: {
    ...typography.captionBold,
    color: 'rgba(255,255,255,0.9)',
  },
});
