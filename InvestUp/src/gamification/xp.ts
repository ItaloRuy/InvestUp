/**
 * Gamification Agent — Sistema de XP e Níveis
 * Lógica de pontuação, níveis e progressão do investidor.
 */

// ─── Tabela de níveis ──────────────────────────────────────
export interface Level {
  level: number;
  title: string;
  emoji: string;
  xpRequired: number;        // XP total para atingir esse nível
  xpToNext: number;          // XP necessário para o próximo nível
  perk: string;              // Benefício desbloqueado
}

export const LEVELS: Level[] = [
  { level: 1,  title: 'Poupador',        emoji: '🌱', xpRequired: 0,     xpToNext: 200,   perk: 'Trilha 1 desbloqueada' },
  { level: 2,  title: 'Curioso',         emoji: '🔍', xpRequired: 200,   xpToNext: 300,   perk: 'Simulador básico desbloqueado' },
  { level: 3,  title: 'Aprendiz',        emoji: '📚', xpRequired: 500,   xpToNext: 500,   perk: 'Trilha 2 desbloqueada' },
  { level: 4,  title: 'Investidor',      emoji: '💼', xpRequired: 1000,  xpToNext: 700,   perk: 'Modo duelo desbloqueado' },
  { level: 5,  title: 'Analista',        emoji: '📊', xpRequired: 1700,  xpToNext: 800,   perk: 'Trilha 3 desbloqueada' },
  { level: 6,  title: 'Trader',          emoji: '📈', xpRequired: 2500,  xpToNext: 1000,  perk: 'Simulador avançado desbloqueado' },
  { level: 7,  title: 'Gestor',          emoji: '🏦', xpRequired: 3500,  xpToNext: 1500,  perk: 'Carteiras ilimitadas' },
  { level: 8,  title: 'Expert',          emoji: '🎯', xpRequired: 5000,  xpToNext: 2000,  perk: 'Badge exclusivo Expert' },
  { level: 9,  title: 'Mestre',          emoji: '🏆', xpRequired: 7000,  xpToNext: 3000,  perk: 'Acesso antecipado a novas trilhas' },
  { level: 10, title: 'Lenda Financeira',emoji: '👑', xpRequired: 10000, xpToNext: 999999, perk: 'Tudo desbloqueado + badge Lenda' },
];

// ─── Recompensas de XP ────────────────────────────────────
export const XP_REWARDS = {
  // Lições
  lessonComplete: 30,
  lessonPerfectQuiz: 10,       // bônus por 100% no quiz
  lessonReview: 5,             // revisitar lição já feita

  // Simulações
  simulationRun: 20,
  simulationShared: 10,

  // BOSS
  bossComplete: 100,
  bossPerfect: 50,             // bônus por acertar todas as perguntas

  // Streaks
  streakBonus7days: 50,
  streakBonus30days: 200,
  streakBonus100days: 500,

  // Daily
  dailyLogin: 5,
  dailyMission: 20,

  // Weekly
  weeklyMission: 150,

  // Social
  inviteFriend: 100,
  friendCompletedLesson: 10,

  // Conquistas
  achievementUnlock: 25,
} as const;

export type XPRewardKey = keyof typeof XP_REWARDS;

// ─── Funções de XP ────────────────────────────────────────

/** Retorna o nível atual baseado no XP total */
export function getCurrentLevel(totalXP: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/** Retorna progresso no nível atual (0-100%) */
export function getLevelProgress(totalXP: number): number {
  const current = getCurrentLevel(totalXP);
  const xpInCurrentLevel = totalXP - current.xpRequired;
  return Math.min(100, Math.round((xpInCurrentLevel / current.xpToNext) * 100));
}

/** Verifica se ganhar XP causa subida de nível */
export function checkLevelUp(
  previousXP: number,
  gainedXP: number
): { leveledUp: boolean; newLevel?: Level; previousLevel?: Level } {
  const before = getCurrentLevel(previousXP);
  const after = getCurrentLevel(previousXP + gainedXP);

  if (after.level > before.level) {
    return { leveledUp: true, newLevel: after, previousLevel: before };
  }

  return { leveledUp: false };
}

/** Calcula multiplicador de XP para streak */
export function streakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 1.5;
  if (streakDays >= 14) return 1.3;
  if (streakDays >= 7)  return 1.2;
  if (streakDays >= 3)  return 1.1;
  return 1.0;
}

/** Calcula XP final com multiplicadores */
export function calculateXP(
  rewardKey: XPRewardKey,
  streakDays: number = 0,
  multipliers: number[] = []
): number {
  const base = XP_REWARDS[rewardKey];
  const streak = streakMultiplier(streakDays);
  const extra = multipliers.reduce((acc, m) => acc * m, 1);
  return Math.round(base * streak * extra);
}
