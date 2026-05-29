import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { BookOpen, TrendingUp, Zap, Flame, Trophy } from 'lucide-react'

const TRAIL_PROGRESS = [
  { id: 1, name: 'Fundamentos', emoji: '🌱', progress: 60, total: 5, done: 3, color: 'bg-primary' },
  { id: 2, name: 'Renda Fixa',  emoji: '🏦', progress: 0,  total: 6, done: 0, color: 'bg-blue-400', locked: true },
  { id: 3, name: 'Renda Variável', emoji: '📈', progress: 0, total: 6, done: 0, color: 'bg-success', locked: true },
]

const RECENT_LESSONS = [
  { id: '1.4', title: 'Inflação — o ladrão silencioso', emoji: '💸', status: 'in_progress' as const },
  { id: '1.3', title: 'O poder dos juros compostos',   emoji: '📈', status: 'completed' as const },
  { id: '1.2', title: 'Risco x Retorno',               emoji: '⚖️', status: 'completed' as const },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* ── Saudação */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Oi, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {user?.streakDays
            ? `🔥 ${user.streakDays} dias seguidos. Continue assim!`
            : 'Comece sua jornada de investimentos hoje!'}
        </p>
      </div>

      {/* ── Cards de stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Zap size={20} className="text-yellow-600" />}
          label="XP Total" value={`${user?.totalXp ?? 0}`} bg="bg-yellow-50" />
        <StatCard icon={<Flame size={20} className="text-orange-500" />}
          label="Streak" value={`${user?.streakDays ?? 0} dias`} bg="bg-orange-50" />
        <StatCard icon={<BookOpen size={20} className="text-primary" />}
          label="Lições" value={`${user?.lessonsCompleted ?? 0}`} bg="bg-primary-muted" />
        <StatCard icon={<Trophy size={20} className="text-success" />}
          label="Nível" value={getLevel(user?.totalXp ?? 0)} bg="bg-success-muted" />
      </div>

      {/* ── Missão do dia */}
      <div className="card border border-primary/20 bg-primary-muted">
        <div className="flex items-center gap-4">
          <span className="text-3xl">🎯</span>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Missão do dia</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">Complete 1 lição hoje</p>
          </div>
          <span className="badge-xp">+20 XP</span>
        </div>
      </div>

      {/* ── Trilhas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Trilhas de aprendizado</h2>
          <Link to="/app/trilhas" className="text-sm text-primary font-medium hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="space-y-3">
          {TRAIL_PROGRESS.map((trail) => (
            <Link
              key={trail.id}
              to={trail.locked ? '#' : `/app/trilhas`}
              className={`card flex items-center gap-4 transition-all ${
                trail.locked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-card-lg hover:-translate-y-0.5'
              }`}
            >
              <span className="text-3xl">{trail.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="font-semibold text-gray-900 text-sm">{trail.name}</p>
                  <span className="text-xs text-gray-400">{trail.done}/{trail.total}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${trail.color}`}
                    style={{ width: `${trail.progress}%` }}
                  />
                </div>
              </div>
              {trail.locked && <span className="text-lg">🔒</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Lições recentes */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Continue de onde parou</h2>
        <div className="space-y-2">
          {RECENT_LESSONS.map((lesson) => (
            <Link
              key={lesson.id}
              to={`/app/trilhas/1/licao/${lesson.id}`}
              className="card flex items-center gap-4 hover:shadow-card-lg hover:-translate-y-0.5 transition-all"
            >
              <span className="text-2xl">{lesson.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                lesson.status === 'completed'
                  ? 'bg-success-muted text-success'
                  : 'bg-warning/20 text-warning'
              }`}>
                {lesson.status === 'completed' ? '✅ Feito' : '📖 Em andamento'}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CTA Simulador */}
      <Link
        to="/app/simulador"
        className="card flex items-center gap-4 bg-primary text-white hover:bg-primary-light transition-colors"
      >
        <TrendingUp size={28} />
        <div>
          <p className="font-bold">Simule sua carteira</p>
          <p className="text-sm text-blue-200">Veja quanto R$ 300/mês pode virar em 20 anos</p>
        </div>
        <span className="ml-auto text-2xl">→</span>
      </Link>
    </div>
  )
}

function StatCard({ icon, label, value, bg }: {
  icon: React.ReactNode; label: string; value: string; bg: string
}) {
  return (
    <div className={`rounded-2xl p-4 ${bg}`}>
      <div className="mb-2">{icon}</div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  )
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
