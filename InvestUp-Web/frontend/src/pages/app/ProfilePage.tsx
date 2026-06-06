import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LogOut, Zap, Flame, BookOpen, Trophy, KeyRound, ChevronDown, ChevronUp } from 'lucide-react'
import { getUserBadge, getAllBadges } from '../../utils/badges'
import { LEVELS } from '../../utils/levels'
import LevelBadge from '../../components/ui/LevelBadge'
import ActivityCalendar from '../../components/ui/ActivityCalendar'
import MascotTip from '../../components/ui/MascotTip'
import api from '../../api/client'
import toast from 'react-hot-toast'

const ACHIEVEMENT_DEFS = [
  { id: 'primeiro_passo',     emoji: '🌱', title: 'Primeiro Passo',      desc: 'Completou a primeira lição' },
  { id: 'comecando_habito',   emoji: '🔥', title: 'Começando o Hábito',  desc: '3 dias seguidos' },
  { id: 'pequeno_gestor',     emoji: '📊', title: 'Pequeno Gestor',       desc: 'Rodou a primeira simulação' },
  { id: 'diversificador',     emoji: '🥚', title: 'Diversificador',       desc: 'Carteira com 4+ ativos' },
  { id: 'trilha1_completa',   emoji: '🎓', title: 'Mestre dos Fundamentos', desc: 'Completou a Trilha 1' },
  { id: 'trilha2_completa',   emoji: '💳', title: 'Especialista em RF',   desc: 'Completou a Trilha 2' },
  { id: 'trilha3_completa',   emoji: '📈', title: 'Analista de Mercado',  desc: 'Completou a Trilha 3' },
  { id: 'streak_7',           emoji: '🔥', title: 'Semana Perfeita',      desc: '7 dias de streak' },
  { id: 'streak_30',          emoji: '📅', title: 'Mês de Ouro',          desc: '30 dias de streak' },
  { id: 'xp_1000',            emoji: '⚡', title: 'Mil XP',              desc: 'Atingiu 1.000 XP' },
]

const AVATARS = [
  '🐢', '🦁', '🐻', '🐺', '🦊', '🐸',
  '🤖', '👨‍💻', '🧑‍🚀', '👩‍💼', '🧙', '🥷',
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

const allBadges = getAllBadges()

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const level = getLevel(user?.totalXp ?? 0)
  const profile = profileLabels[user?.investorProfile ?? 'NAO_DEFINIDO']

  const badge = getUserBadge({
    xp: user?.totalXp ?? 0,
    streak: user?.streakDays ?? 0,
    lessonsCompleted: user?.lessonsCompleted ?? 0,
    investorProfile: user?.investorProfile ?? 'NAO_DEFINIDO',
  })

  // Avatar
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const handleAvatar = async (avatar: string) => {
    try {
      await api.patch('/user/avatar', { avatarUrl: avatar })
      updateUser({ avatarUrl: avatar } as any)
      setShowAvatarModal(false)
      toast.success('Avatar atualizado!')
    } catch { toast.error('Erro ao atualizar avatar') }
  }

  // Alterar senha
  const [showPwdForm,  setShowPwdForm]  = useState(false)
  const [currentPwd,   setCurrentPwd]   = useState('')
  const [newPwd,       setNewPwd]       = useState('')
  const [confirmPwd,   setConfirmPwd]   = useState('')
  const [pwdLoading,   setPwdLoading]   = useState(false)
  const handlePassword = async () => {
    if (newPwd !== confirmPwd) return toast.error('As senhas não coincidem')
    if (newPwd.length < 6) return toast.error('Mínimo 6 caracteres')
    setPwdLoading(true)
    try {
      await api.patch('/user/password', { currentPassword: currentPwd, newPassword: newPwd })
      toast.success('Senha alterada com sucesso!')
      setShowPwdForm(false); setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Erro ao alterar senha')
    } finally { setPwdLoading(false) }
  }

  // Conquistas
  const [unlockedAchievements, setUnlockedAchievements] = useState<{ achievement: string; unlockedAt: string }[]>([])
  useEffect(() => {
    api.get<{ achievement: string; unlockedAt: string }[]>('/user/achievements')
      .then(({ data }) => setUnlockedAchievements(data))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Meu Perfil</h1>

      {/* ── Mascote com dica cômica */}
      <MascotTip tip={badge.tip} />

      {/* ── Avatar e info */}
      <div className="card flex items-center gap-5">
        <button onClick={() => setShowAvatarModal(true)}
          className="w-16 h-16 bg-primary-muted rounded-2xl flex items-center justify-center text-3xl hover:scale-105 transition-transform relative group">
          {(user as any)?.avatarUrl ?? level.emoji}
          <span className="absolute inset-0 bg-black/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">Editar</span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${profile.color}`}>
            {profile.emoji} {profile.label}
          </span>
        </div>
      </div>

      {/* ── Modal de avatar */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAvatarModal(false)}>
          <div className="card max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <p className="font-bold text-gray-900 dark:text-gray-100">Escolha seu avatar</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map(av => (
                <button key={av} onClick={() => handleAvatar(av)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110 ${
                    (user as any)?.avatarUrl === av ? 'bg-primary-muted ring-2 ring-primary' : 'bg-gray-50 dark:bg-gray-800'
                  }`}>
                  {av}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAvatarModal(false)} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">Cancelar</button>
          </div>
        </div>
      )}

      {/* ── Selo atual */}
      <div className={`card border flex items-center gap-4 ${badge.bg}`}>
        <span className="text-4xl">{badge.emoji}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-0.5">Seu selo atual</p>
          <p className={`text-base font-bold ${badge.color}`}>{badge.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{badge.desc}</p>
        </div>
      </div>

      {/* ── Histórico de atividade */}
      <ActivityCalendar />

      {/* ── Nível e XP */}
      <div className="space-y-4">
        <LevelBadge xp={user?.totalXp ?? 0} />

        {/* Mapa de todos os níveis */}
        <div className="card space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Jornada de níveis</p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map(lvl => {
              const reached = (user?.totalXp ?? 0) >= lvl.minXp
              return (
                <div key={lvl.level} className={`rounded-xl px-3 py-2 border transition-all ${reached ? `${lvl.bg} ${lvl.border}` : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-50'}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-base ${reached ? '' : 'grayscale'}`}>{lvl.emoji}</span>
                    <div>
                      <p className={`text-[11px] font-bold ${reached ? lvl.color : 'text-gray-400'}`}>Nv.{lvl.level} {lvl.title}</p>
                      <p className="text-[9px] text-gray-400">{lvl.minXp.toLocaleString('pt-BR')} XP</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {level.next && (
          <p className="text-xs text-gray-400 text-center">
            {user?.totalXp} / {level.nextXp} XP para {level.next} {level.emoji}
          </p>
        )}
        {!level.next && (
          <p className="text-xs text-success font-semibold text-center">👑 Nível máximo atingido!</p>
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

      {/* ── Todos os selos */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Galeria de Selos</h2>
        <div className="grid grid-cols-2 gap-3">
          {allBadges.map((b) => {
            const unlocked = b.id === badge.id
            return (
              <div
                key={b.id}
                className={`card border flex items-center gap-3 transition-opacity ${
                  unlocked ? b.bg : 'opacity-40 grayscale border-gray-100'
                }`}
              >
                <span className="text-2xl">{b.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{b.title}</p>
                  <p className="text-xs text-gray-500 truncate">{b.character}</p>
                  {unlocked && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary-muted px-1.5 py-0.5 rounded-full">
                      Você!
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Conquistas com data + compartilhar */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Conquistas</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENT_DEFS.map(a => {
            const unlocked = unlockedAchievements.find(u => u.achievement === a.id)
            function shareAchievement() {
              const text = `🏆 Acabei de desbloquear a conquista "${a.title}" no InvestUp!\n${a.emoji} ${a.desc}\n\nEstou aprendendo a investir! 📈`
              if (navigator.share) {
                navigator.share({ title: 'Conquista InvestUp', text }).catch(() => {})
              } else {
                navigator.clipboard.writeText(text).then(() => {
                  import('react-hot-toast').then(({ default: toast }) => toast.success('Texto copiado!'))
                }).catch(() => {})
              }
            }
            return (
              <div key={a.id} className={`card flex items-start gap-3 transition-all ${unlocked ? '' : 'opacity-40 grayscale'}`}>
                <span className="text-2xl flex-shrink-0">{a.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{a.title}</p>
                  <p className="text-xs text-gray-500 truncate">{a.desc}</p>
                  {unlocked && (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-success font-semibold">
                        ✅ {new Date(unlocked.unlockedAt).toLocaleDateString('pt-BR')}
                      </p>
                      <button
                        onClick={shareAchievement}
                        title="Compartilhar conquista"
                        className="text-[10px] text-primary hover:text-primary/70 font-semibold transition-colors"
                      >
                        Compartilhar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Alterar senha */}
      <div className="card space-y-3">
        <button onClick={() => setShowPwdForm(v => !v)}
          className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Alterar senha</span>
          </div>
          {showPwdForm ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {showPwdForm && (
          <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-700">
            <input type="password" placeholder="Senha atual" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="input" />
            <input type="password" placeholder="Nova senha (mín. 6 caracteres)" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="input" />
            <input type="password" placeholder="Confirmar nova senha" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="input" />
            <button onClick={handlePassword} disabled={pwdLoading || !currentPwd || !newPwd || !confirmPwd}
              className="btn-primary w-full disabled:opacity-40">
              {pwdLoading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </div>
        )}
      </div>

      {/* ── Logout */}
      <button
        onClick={() => { logout(); navigate('/login') }}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl
          border-2 border-danger/30 text-danger font-medium hover:bg-danger-muted dark:hover:bg-red-900/20 transition-colors"
      >
        <LogOut size={18} />
        Sair da conta
      </button>
    </div>
  )
}
