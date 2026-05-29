/**
 * UX/UI Agent — HomeScreen
 * Tela principal: trilha atual, streak, XP, carteira simulada e missão do dia.
 * Skills: ui-ux-pro-max, sleek-design-mobile-apps, frontend-design
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '@/design-system/tokens';
import { StreakCounter } from '@/components/StreakCounter';
import { XPInline } from '@/components/XPBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { LessonCard, BossCard } from '@/components/LessonCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { LessonStatus } from '@/components/LessonCard';

// ─── Dados fictícios (substituir por Zustand store) ───────
const MOCK_USER = {
  name: 'Ana',
  level: 2,
  levelTitle: 'Curioso',
  totalXP: 350,
  streakDays: 5,
  isStreakActive: true,
};

const MOCK_TRAIL = {
  id: '1',
  name: 'Fundamentos',
  emoji: '🌱',
  progress: 60,             // % concluída
  completedLessons: 3,
  totalLessons: 5,
};

const MOCK_LESSONS: Array<{
  id: string;
  title: string;
  description: string;
  status: LessonStatus;
  progress?: number;
  xpReward: number;
  durationMinutes: number;
  emoji: string;
}> = [
  { id: '1.1', title: 'Dinheiro trabalhando por você', description: 'O conceito que muda tudo', status: 'completed', xpReward: 30, durationMinutes: 5, emoji: '💡' },
  { id: '1.2', title: 'Risco x Retorno', description: 'O que esperar de cada investimento', status: 'completed', xpReward: 30, durationMinutes: 5, emoji: '⚖️' },
  { id: '1.3', title: 'O poder dos juros compostos', description: 'A oitava maravilha do mundo', status: 'completed', xpReward: 50, durationMinutes: 6, emoji: '📈' },
  { id: '1.4', title: 'Inflação — o ladrão silencioso', description: 'Por que dinheiro na gaveta perde valor', status: 'in_progress', progress: 40, xpReward: 40, durationMinutes: 5, emoji: '💸' },
  { id: '1.5', title: 'Seu perfil de investidor', description: 'Descubra quem você é', status: 'locked', xpReward: 30, durationMinutes: 5, emoji: '🪞' },
];

const MOCK_PORTFOLIO = {
  totalVirtual: 1247.83,
  monthlyReturn: 12.34,
  returnPercent: 1.0,
};

const MOCK_DAILY_MISSION = {
  description: 'Complete 1 lição hoje',
  xpReward: 20,
  done: false,
};

// ─────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleLessonPress = (id: string) => {
    // TODO: router.push(`/lesson/${id}`)
    console.log('Navegar para lição:', id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Oi, {MOCK_USER.name}! 👋</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelText}>
                Nível {MOCK_USER.level} · {MOCK_USER.levelTitle}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <StreakCounter
              days={MOCK_USER.streakDays}
              isActive={MOCK_USER.isStreakActive}
              variant="compact"
            />
            <XPInline value={MOCK_USER.totalXP} />
          </View>
        </View>

        {/* ── Missão do dia ─────────────────────────────── */}
        <DailyMissionCard
          description={MOCK_DAILY_MISSION.description}
          xpReward={MOCK_DAILY_MISSION.xpReward}
          done={MOCK_DAILY_MISSION.done}
        />

        {/* ── Trilha atual ──────────────────────────────── */}
        <SectionHeader title="Trilha atual" emoji={MOCK_TRAIL.emoji} />

        <View style={styles.trailHeader}>
          <View style={styles.trailTitleRow}>
            <Text style={styles.trailName}>{MOCK_TRAIL.name}</Text>
            <Text style={styles.trailCount}>
              {MOCK_TRAIL.completedLessons}/{MOCK_TRAIL.totalLessons} lições
            </Text>
          </View>
          <ProgressBar
            progress={MOCK_TRAIL.progress}
            color={colors.success}
            height={10}
            showLabel
            labelPosition="right"
          />
        </View>

        {/* ── Lições ───────────────────────────────────── */}
        <View style={styles.lessonList}>
          {MOCK_LESSONS.map((lesson) => (
            <LessonCard
              key={lesson.id}
              {...lesson}
              onPress={handleLessonPress}
            />
          ))}

          {/* BOSS */}
          <BossCard
            title="Monte sua primeira carteira"
            description="Use tudo que aprendeu e crie uma carteira real com R$ 1.000 virtuais"
            xpReward={100}
            status="locked"
            onPress={() => console.log('Boss!')}
          />
        </View>

        {/* ── Carteira simulada ─────────────────────────── */}
        <SectionHeader title="Sua carteira simulada" emoji="💼" />
        <PortfolioSummaryCard portfolio={MOCK_PORTFOLIO} />

        {/* ── Espaço do bottom tab ──────────────────────── */}
        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; emoji: string }> = ({ title, emoji }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionEmoji}>{emoji}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const DailyMissionCard: React.FC<{
  description: string;
  xpReward: number;
  done: boolean;
}> = ({ description, xpReward, done }) => (
  <View
    style={[styles.missionCard, done && styles.missionCardDone]}
    accessibilityRole="none"
    accessibilityLabel={`Missão do dia: ${description}. ${xpReward} XP. ${done ? 'Concluída' : 'Pendente'}`}
  >
    <Text style={styles.missionEmoji}>{done ? '✅' : '🎯'}</Text>
    <View style={styles.missionContent}>
      <Text style={styles.missionLabel}>MISSÃO DO DIA</Text>
      <Text style={styles.missionText}>{description}</Text>
    </View>
    <View style={styles.missionXP}>
      <Text style={styles.missionXPText}>+{xpReward} XP</Text>
    </View>
  </View>
);

const PortfolioSummaryCard: React.FC<{
  portfolio: typeof MOCK_PORTFOLIO;
}> = ({ portfolio }) => (
  <View style={styles.portfolioCard}>
    <View style={styles.portfolioRow}>
      <View>
        <Text style={styles.portfolioLabel}>Saldo virtual</Text>
        <Text style={styles.portfolioValue}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            portfolio.totalVirtual
          )}
        </Text>
      </View>
      <View style={styles.portfolioReturn}>
        <Text style={styles.portfolioReturnLabel}>Este mês</Text>
        <Text style={styles.portfolioReturnValue}>
          +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            portfolio.monthlyReturn
          )}{' '}
          <Text style={styles.portfolioReturnPct}>({portfolio.returnPercent}%)</Text>
        </Text>
      </View>
    </View>

    <PrimaryButton
      label="Ver carteira completa"
      onPress={() => console.log('Navegar para simulador')}
      variant="outline"
      size="sm"
      fullWidth
      style={styles.portfolioButton}
    />
  </View>
);

// ─────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  levelRow: {
    marginTop: spacing.xs,
  },
  levelText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },

  // Missão
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  missionCardDone: {
    backgroundColor: colors.successMuted,
    borderColor: colors.success + '33',
  },
  missionEmoji: { fontSize: 24 },
  missionContent: { flex: 1 },
  missionLabel: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: 2,
  },
  missionText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  missionXP: {
    backgroundColor: colors.xp,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  missionXPText: {
    ...typography.captionBold,
    color: '#1A1A00',
  },

  // Seção
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },

  // Trilha
  trailHeader: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  trailTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trailName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  trailCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Lições
  lessonList: {
    gap: spacing.sm,
  },

  // Carteira
  portfolioCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.md,
  },
  portfolioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  portfolioLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  portfolioValue: {
    ...typography.number,
    color: colors.textPrimary,
  },
  portfolioReturn: { alignItems: 'flex-end' },
  portfolioReturnLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  portfolioReturnValue: {
    ...typography.bodyBold,
    color: colors.success,
  },
  portfolioReturnPct: {
    ...typography.caption,
    color: colors.success,
  },
  portfolioButton: { marginTop: spacing.xs },
});
