import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'

interface Challenge {
  id: string
  title: string
  desc: string
  emoji: string
  xp: number
  completed: boolean
}

interface ChallengesData {
  weekKey: string
  challenges: Challenge[]
}

export default function WeeklyChallenges() {
  const { updateUser } = useAuth()
  const [data,    setData]    = useState<ChallengesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => {
    api.get<ChallengesData>('/challenges/weekly')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function claimChallenge(id: string) {
    if (claiming) return
    setClaiming(id)
    try {
      const { data: result } = await api.post<{ xpEarned: number; totalXp: number }>(`/challenges/complete/${id}`)
      setData(prev => prev ? {
        ...prev,
        challenges: prev.challenges.map(c => c.id === id ? { ...c, completed: true } : c)
      } : prev)
      updateUser({ totalXp: result.totalXp })
    } catch {
    } finally {
      setClaiming(null)
    }
  }

  if (loading) return null
  if (!data) return null

  const completedCount = data.challenges.filter(c => c.completed).length
  const totalXp = data.challenges.reduce((s, c) => s + (c.completed ? 0 : c.xp), 0)

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Desafios da Semana</p>
            <p className="text-[11px] text-gray-400">{completedCount}/{data.challenges.length} concluídos</p>
          </div>
        </div>
        {totalXp > 0 && (
          <span className="text-xs font-bold text-primary bg-primary-muted px-2 py-1 rounded-full">
            até +{totalXp} XP
          </span>
        )}
        {completedCount === data.challenges.length && (
          <span className="text-xs font-bold text-success bg-success-muted px-2 py-1 rounded-full">
            🎉 Semana completa!
          </span>
        )}
      </div>

      {/* Barra de progresso da semana */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / data.challenges.length) * 100}%` }}
        />
      </div>

      {/* Lista de desafios */}
      <div className="space-y-2">
        {data.challenges.map(challenge => (
          <div
            key={challenge.id}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
              challenge.completed
                ? 'bg-success-muted border border-success/20'
                : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
            }`}
          >
            <span className="text-xl flex-shrink-0">{challenge.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${challenge.completed ? 'text-success line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                {challenge.title}
              </p>
              <p className="text-[11px] text-gray-400 truncate">{challenge.desc}</p>
            </div>
            {challenge.completed ? (
              <span className="text-success font-bold text-sm flex-shrink-0">✅</span>
            ) : (
              <button
                onClick={() => claimChallenge(challenge.id)}
                disabled={!!claiming}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {claiming === challenge.id ? '...' : `+${challenge.xp} XP`}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
