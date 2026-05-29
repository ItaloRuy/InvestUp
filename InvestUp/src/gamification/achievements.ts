/**
 * Gamification Agent — Sistema de Conquistas (Achievements)
 * Define todas as conquistas do app e lógica de desbloqueio.
 */

import { XP_REWARDS } from './xp';

// ─── Tipos ────────────────────────────────────────────────
export type AchievementCategory =
  | 'aprendizado'
  | 'simulacao'
  | 'streak'
  | 'social'
  | 'perfil'
  | 'especial';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  xpReward: number;
  isSecret: boolean;          // conquistas secretas — aparecem só ao desbloquear
  condition: string;          // descrição legível da condição
}

// ─── Catálogo de conquistas ───────────────────────────────
export const ACHIEVEMENTS: Achievement[] = [
  // ── Aprendizado
  {
    id: 'first_lesson',
    title: 'Primeiro Passo',
    description: 'Completou a primeira lição do InvestUp!',
    emoji: '🌱',
    category: 'aprendizado',
    xpReward: XP_REWARDS.achievementUnlock,
    isSecret: false,
    condition: 'Complete 1 lição',
  },
  {
    id: 'trail_1_complete',
    title: 'Fundações Sólidas',
    description: 'Concluiu a Trilha 1 — Fundamentos completa!',
    emoji: '🏗️',
    category: 'aprendizado',
    xpReward: 75,
    isSecret: false,
    condition: 'Conclua todas as lições da Trilha 1',
  },
  {
    id: 'trail_2_complete',
    title: 'Mestre da Renda Fixa',
    description: 'Dominou todos os conceitos de renda fixa!',
    emoji: '🏦',
    category: 'aprendizado',
    xpReward: 100,
    isSecret: false,
    condition: 'Conclua todas as lições da Trilha 2',
  },
  {
    id: 'trail_3_complete',
    title: 'Investidor da Bolsa',
    description: 'Entendeu o mundo da renda variável!',
    emoji: '📈',
    category: 'aprendizado',
    xpReward: 150,
    isSecret: false,
    condition: 'Conclua todas as lições da Trilha 3',
  },
  {
    id: 'all_trails_complete',
    title: 'Investidor Completo',
    description: 'Completou todas as trilhas do InvestUp!',
    emoji: '👑',
    category: 'aprendizado',
    xpReward: 500,
    isSecret: false,
    condition: 'Conclua todas as trilhas disponíveis',
  },
  {
    id: 'perfect_quiz',
    title: 'Mente Afiada',
    description: 'Acertou 100% de um quiz sem errar nenhuma!',
    emoji: '🎯',
    category: 'aprendizado',
    xpReward: 25,
    isSecret: false,
    condition: 'Acerte todas as questões de um quiz',
  },
  {
    id: 'perfect_boss',
    title: 'Sem Erro no Chefe',
    description: 'Completou um BOSS com 100% de acerto!',
    emoji: '⚔️',
    category: 'aprendizado',
    xpReward: 50,
    isSecret: false,
    condition: 'Acerte todas as questões de um BOSS',
  },

  // ── Simulação
  {
    id: 'first_simulation',
    title: 'Pequeno Gestor',
    description: 'Rodou a primeira simulação de carteira!',
    emoji: '📊',
    category: 'simulacao',
    xpReward: 25,
    isSecret: false,
    condition: 'Execute 1 simulação',
  },
  {
    id: 'diversified_portfolio',
    title: 'Diversificador',
    description: 'Montou uma carteira com 4 ou mais ativos diferentes!',
    emoji: '🥚',
    category: 'simulacao',
    xpReward: 50,
    isSecret: false,
    condition: 'Crie uma carteira com 4+ ativos',
  },
  {
    id: 'simulation_30_years',
    title: 'Visão de Longo Prazo',
    description: 'Simulou uma carteira por 30 anos!',
    emoji: '🔭',
    category: 'simulacao',
    xpReward: 30,
    isSecret: false,
    condition: 'Simule por 30 anos',
  },
  {
    id: 'millionaire_simulation',
    title: 'Milionário Virtual',
    description: 'Sua simulação chegou a R$ 1.000.000!',
    emoji: '💰',
    category: 'simulacao',
    xpReward: 100,
    isSecret: false,
    condition: 'Simule uma carteira que chega a R$ 1 milhão',
  },

  // ── Streaks
  {
    id: 'streak_3',
    title: 'Começando o Hábito',
    description: 'Estudou 3 dias seguidos!',
    emoji: '🔥',
    category: 'streak',
    xpReward: 20,
    isSecret: false,
    condition: 'Mantenha um streak de 3 dias',
  },
  {
    id: 'streak_7',
    title: 'Uma Semana Inteira',
    description: 'Sete dias consecutivos de estudo!',
    emoji: '🔥🔥',
    category: 'streak',
    xpReward: 50,
    isSecret: false,
    condition: 'Mantenha um streak de 7 dias',
  },
  {
    id: 'streak_30',
    title: 'Um Mês de Dedicação',
    description: 'Trinta dias seguidos — isso é comprometimento!',
    emoji: '💪',
    category: 'streak',
    xpReward: 200,
    isSecret: false,
    condition: 'Mantenha um streak de 30 dias',
  },
  {
    id: 'streak_100',
    title: 'Lenda do Hábito',
    description: '100 dias consecutivos — você é incrível!',
    emoji: '🏅',
    category: 'streak',
    xpReward: 500,
    isSecret: false,
    condition: 'Mantenha um streak de 100 dias',
  },

  // ── Perfil
  {
    id: 'profile_complete',
    title: 'Me Conheço Bem',
    description: 'Completou o quiz de perfil de investidor!',
    emoji: '🪞',
    category: 'perfil',
    xpReward: 20,
    isSecret: false,
    condition: 'Complete o quiz de perfil',
  },

  // ── Social
  {
    id: 'first_invite',
    title: 'Recrutador',
    description: 'Convidou o primeiro amigo para o InvestUp!',
    emoji: '🤝',
    category: 'social',
    xpReward: 100,
    isSecret: false,
    condition: 'Convide 1 amigo',
  },

  // ── Especial (secretas)
  {
    id: 'night_owl',
    title: 'Coruja Financeira',
    description: 'Completou uma lição depois da meia-noite.',
    emoji: '🦉',
    category: 'especial',
    xpReward: 30,
    isSecret: true,
    condition: 'Estude após a meia-noite',
  },
  {
    id: 'speed_learner',
    title: 'Relâmpago',
    description: 'Completou 3 lições em menos de 30 minutos.',
    emoji: '⚡',
    category: 'especial',
    xpReward: 40,
    isSecret: true,
    condition: 'Secreta',
  },
];

// ─── Helpers ──────────────────────────────────────────────
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

/** Retorna conquistas desbloqueadas de uma lista de IDs */
export function getUnlockedAchievements(unlockedIds: string[]): Achievement[] {
  const idSet = new Set(unlockedIds);
  return ACHIEVEMENTS.filter((a) => idSet.has(a.id));
}

/** Retorna conquistas ainda bloqueadas (exceto secretas) */
export function getLockedAchievements(unlockedIds: string[]): Achievement[] {
  const idSet = new Set(unlockedIds);
  return ACHIEVEMENTS.filter((a) => !idSet.has(a.id) && !a.isSecret);
}
