import { useEffect, useState } from 'react'
import { Trophy, Zap, Flame } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'

interface RankUser {
  id: number
  name: string
  totalXp: number
  streakDays: number
  lessonsCompleted: number
  avatarUrl?: string
}

function getLevel(xp: number): string {
  if (xp >= 10000) return 'Lenda 👑'
  if (xp >= 5000)  return 'Mestre 🏆'
  if (xp >= 2500)  return 'Trader 📈'
  if (xp >= 1000)  return 'Investidor 💼'
  if (xp >= 500)   return 'Aprendiz 📚'
  if (xp >= 200)   return 'Curioso 🔍'
  return 'Poupador 🌱'
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function RankingPage() {
  const { user } = useAuth()
  const [ranking, setRanking] = useState<RankUser[]>([])
  const [myRank,  setMyRank]  = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ ranking: RankUser[]; myRank: number }>('/ranking')
      .then(({ data }) => { setRanking(data.ranking); setMyRank(data.myRank) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🏆 Ranking Semanal</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Top 10 investidores com mais XP</p>
      </div>

      {/* Minha posição */}
      {myRank > 0 && (
        <div className="card bg-primary-muted border border-primary/20 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
            #{myRank}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Sua posição</p>
            <p className="text-xs text-gray-500">{user?.name} · {user?.totalXp ?? 0} XP · {getLevel(user?.totalXp ?? 0)}</p>
          </div>
          <div className="flex gap-2">
            <span className="badge-xp">⚡ {user?.totalXp ?? 0}</span>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="card text-center py-8 text-gray-400">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Carregando ranking...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((u, i) => {
            const isMe = u.id === user?.id
            return (
              <div key={u.id} className={`card flex items-center gap-4 transition-all ${isMe ? 'border-2 border-primary' : ''}`}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' :
                  i === 1 ? 'bg-gray-100 text-gray-600' :
                  i === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 dark:bg-gray-800 text-gray-400'
                }`}>
                  {i < 3 ? MEDALS[i] : `#${i + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isMe ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>
                    {u.name} {isMe && '(você)'}
                  </p>
                  <p className="text-xs text-gray-400">{getLevel(u.totalXp)} · {u.lessonsCompleted} lições</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="badge-xp text-xs">⚡ {u.totalXp}</span>
                  {u.streakDays > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-orange-500 font-semibold">
                      <Flame size={10} /> {u.streakDays}d
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          {ranking.length === 0 && (
            <div className="card text-center py-8 text-gray-400">
              <Trophy size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
