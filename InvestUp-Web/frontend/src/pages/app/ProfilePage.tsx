import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, Zap, Flame, BookOpen, Trophy } from 'lucide-react'

const ACHIEVEMENTS = [
  { id: 1, emoji: '🌱', title: 'Primeiro Passo', desc: 'Completou a primeira lição', done: true },
  { id: 2, emoji: '🔥', title: 'Começando o Hábito', desc: '3 dias seguidos', done: true },
  { id: 3, emoji: '📊', title: 'Pequeno Gestor', desc: 'Rodou a primeira simulação', done: false },
  { id: 4, emoji: '🥚', title: 'Diversificador', desc: 'Carteira com 4+ ativos', done: false },
]

function getLevel(xp: number) {
  if (xp >= 10000) return { title: 'Lenda', emoji: '👑', next: null, nextXp: 10000 }
  if (xp >= 5000)  return { title: 'Mestre', emoji: '🏆', next: 'Lenda', nextXp: 10000 }
  if (xp >= 2500)  return { title: 'Trader', emoji: '📈', next: 'Mestre', nextXp: 5000 }
  if (xp >= 1000)  return { title: 'Investidor', emoji: '💼', next: 'Trader', nextXp: 2500 }
  if (xp >= 500)   return { title: 'Aprendiz', emoji: '📚', next: 'Investidor', nextXp: 1000 }
  if (xp >= 200)   return { title: 'Curioso', emoji: '🔍', next: 'Aprendiz', nextXp: 500 }
  return { title: 'Poupador', emoji: '🌱', next: 'Curioso', nextXp: 200 }
}

const profileLabels: Record<string, { label: string; emoji: string; color: string }> = {
  NAO_DEFINIDO: { label: 'Não definido', emoji: '❓', color: 'bg-gray-100 text-gray-500' },
  CONSERVADOR:  { label: 'Conservador',  emoji: '🛡️', color: 'bg-blue-50 text-blue-700' },
  MODERADO:     { label: 'Moderado',     emoji: '⚖️', color: 'bg-green-50 text-green-700' },
  ARROJADO:     { label: 'Arrojado',     emoji: '🚀', color: 'bg-orange-50 text-orange-700' },
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const level = getLevel(user?.totalXp ?? 0)
  const profile = profileLabels[user?.investorProfile ?? 'NAO_DEFINIDO']
  const levelProgress = user?.totalXp && level.nextXp
    ? Math.min(100, (user.totalXp / level.nextXp) * 100)
    : 100

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>

      {/* ── Avatar e info */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 bg-primary-muted rounded-2xl flex items-center justify-center text-3xl">
          {level.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">{user?.name}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${profile.color}`}>
            {profile.emoji} {profile.label}
          </span>
        </div>
      </div>

      {/* ── Nível e XP */}
      <div className="card space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nível atual</p>
            <p className="text-xl font-bold text-primary">{level.emoji} {level.title}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">XP Total</p>
            <p className="text-2xl font-bold text-gray-900">{user?.totalXp ?? 0}</p>
          </div>
        </div>
        {level.next && (
          <>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${levelProgress}%` }} />
            </div>
            <p className="text-xs text-gray-400">
              {user?.totalXp} / {level.nextXp} XP para {level.next}
            </p>
          </>
        )}
      </div>

      {/* ── Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: <Flame size={20} className="text-streak" />, label: 'Streak atual', value: `${user?.streakDays ?? 0} dias`, bg: 'bg-orange-50' },
          { icon: <BookOpen size={20} className="text-primary" />, label: 'Lições feitas', value: `${user?.lessonsCompleted ?? 0}`, bg: 'bg-primary-muted' },
          { icon: <Zap size={20} className="text-yellow-500" />, label: 'XP ganhos', value: `${user?.totalXp ?? 0}`, bg: 'bg-yellow-50' },
          { icon: <Trophy size={20} className="text-success" />, label: 'Conquistas', value: '2 / 21', bg: 'bg-success-muted' },
        ].map(({ icon, label, value, bg }) => (
          <div key={label} className={`rounded-2xl p-4 ${bg}`}>
            <div className="mb-2">{icon}</div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Conquistas */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Conquistas</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id}
              className={`card flex items-center gap-3 ${a.done ? '' : 'opacity-40 grayscale'}`}>
              <span className="text-2xl">{a.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                <p className="text-xs text-gray-500 truncate">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Logout */}
      <button
        onClick={() => { logout(); navigate('/login') }}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl
          border-2 border-danger/30 text-danger font-medium hover:bg-danger-muted transition-colors"
      >
        <LogOut size={18} />
        Sair da conta
      </button>
    </div>
  )
}
