export interface User {
  id: number
  name: string
  email: string
  totalXp: number
  streakDays: number
  lessonsCompleted: number
  investorProfile: 'NAO_DEFINIDO' | 'CONSERVADOR' | 'MODERADO' | 'ARROJADO'
}

export interface AuthResponse {
  token: string
  type: string
  user: User
}

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface Lesson {
  id: string
  title: string
  description: string
  emoji: string
  xpReward: number
  durationMinutes: number
  status: LessonStatus
  progress?: number
}

export interface Trail {
  id: number
  name: string
  emoji: string
  description: string
  lessons: Lesson[]
  progress: number   // 0-100
}

export interface SimulationResult {
  months: number
  totalInvested: number
  finalValue: number
  totalEarnings: number
  annualizedReturn: number
  benchmarks: { poupanca: number; cdi: number; ipca: number }
  dataPoints: { month: number; value: number; invested: number }[]
}
