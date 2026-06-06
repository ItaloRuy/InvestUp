export interface LevelInfo {
  level: number
  title: string
  emoji: string
  minXp: number
  maxXp: number
  color: string
  bg: string
  border: string
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Poupador',   emoji: '🌱', minXp: 0,     maxXp: 199,   color: 'text-gray-600',   bg: 'bg-gray-100',        border: 'border-gray-300'   },
  { level: 2, title: 'Curioso',    emoji: '🔍', minXp: 200,   maxXp: 499,   color: 'text-blue-600',   bg: 'bg-blue-50',         border: 'border-blue-300'   },
  { level: 3, title: 'Aprendiz',   emoji: '📚', minXp: 500,   maxXp: 999,   color: 'text-cyan-600',   bg: 'bg-cyan-50',         border: 'border-cyan-300'   },
  { level: 4, title: 'Investidor', emoji: '💼', minXp: 1000,  maxXp: 2499,  color: 'text-green-600',  bg: 'bg-green-50',        border: 'border-green-300'  },
  { level: 5, title: 'Analista',   emoji: '📊', minXp: 2500,  maxXp: 4999,  color: 'text-primary',    bg: 'bg-primary-muted',   border: 'border-primary/30' },
  { level: 6, title: 'Trader',     emoji: '📈', minXp: 5000,  maxXp: 9999,  color: 'text-purple-600', bg: 'bg-purple-50',       border: 'border-purple-300' },
  { level: 7, title: 'Gestor',     emoji: '🎩', minXp: 10000, maxXp: 19999, color: 'text-orange-600', bg: 'bg-orange-50',       border: 'border-orange-300' },
  { level: 8, title: 'Mestre',     emoji: '🏆', minXp: 20000, maxXp: 49999, color: 'text-yellow-600', bg: 'bg-yellow-50',       border: 'border-yellow-300' },
  { level: 9, title: 'Lenda',      emoji: '👑', minXp: 50000, maxXp: Infinity, color: 'text-red-600', bg: 'bg-red-50',          border: 'border-red-300'    },
]

export function getLevelInfo(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getLevelProgress(xp: number): { current: LevelInfo; next: LevelInfo | null; pct: number; xpInLevel: number; xpNeeded: number } {
  const current = getLevelInfo(xp)
  const next    = current.level < LEVELS.length ? LEVELS[current.level] : null
  if (!next) return { current, next: null, pct: 100, xpInLevel: xp - current.minXp, xpNeeded: 0 }
  const xpInLevel = xp - current.minXp
  const xpNeeded  = next.minXp - current.minXp
  const pct       = Math.min(100, (xpInLevel / xpNeeded) * 100)
  return { current, next, pct, xpInLevel, xpNeeded }
}
