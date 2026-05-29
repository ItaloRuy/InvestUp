/**
 * InvestUp Components — Barrel Export
 * Importe componentes de '@components' em vez de paths individuais.
 *
 * Tier 1 — MVP (UX Agent, sprint 1)
 */

// Botão principal
export { PrimaryButton } from './PrimaryButton';

// Progresso
export { ProgressBar, SegmentedProgress } from './ProgressBar';

// Gamificação
export { XPBadge, XPInline } from './XPBadge';
export { StreakCounter } from './StreakCounter';

// Trilha de aprendizado
export { LessonCard, BossCard } from './LessonCard';
export type { LessonStatus } from './LessonCard';

/**
 * Tier 2 — Próxima sprint
 * export { QuizOption } from './QuizOption';
 * export { InvestmentCard } from './InvestmentCard';
 * export { StatCard } from './StatCard';
 * export { AchievementBadge } from './AchievementBadge';
 * export { TrailMap } from './TrailMap';
 */
