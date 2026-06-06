import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'

interface Notification {
  id: string
  type: 'streak' | 'achievement' | 'challenge' | 'level' | 'quiz'
  title: string
  body: string
  emoji: string
  read: boolean
  link?: string
}

const STORAGE_KEY = 'investup_notifications'

function loadNotifs(): Notification[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveNotifs(n: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(n.slice(0, 30)))
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifs,  setNotifs]  = useState<Notification[]>(loadNotifs)
  const [open,    setOpen]    = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifs.filter(n => !n.read).length

  // Gera notificações com base no estado atual do usuário
  useEffect(() => {
    if (!user) return
    const existing = loadNotifs()
    const existingIds = new Set(existing.map(n => n.id))
    const newNotifs: Notification[] = []

    // Streak em risco (próxima meia-noite)
    const hour = new Date().getHours()
    const streakRiskId = `streak_risk_${new Date().toISOString().slice(0, 10)}`
    if (user.streakDays > 0 && hour >= 20 && !existingIds.has(streakRiskId)) {
      newNotifs.push({
        id: streakRiskId, type: 'streak', read: false, link: '/app/trilhas',
        emoji: '🔥', title: 'Streak em risco!',
        body: `Seu streak de ${user.streakDays} dias pode quebrar. Faça uma lição agora.`,
      })
    }

    // Quiz diário não respondido
    const quizId = `quiz_available_${new Date().toISOString().slice(0, 10)}`
    if (!existingIds.has(quizId)) {
      api.get<{ answered: boolean }>('/quiz/daily').then(({ data }) => {
        if (!data.answered) {
          const notif: Notification = {
            id: quizId, type: 'quiz', read: false, link: '/app',
            emoji: '🧠', title: 'Quiz do dia disponível!',
            body: 'Responda a pergunta de hoje e ganhe +25 XP bônus.',
          }
          setNotifs(prev => {
            const ids = new Set(prev.map(n => n.id))
            if (ids.has(quizId)) return prev
            const updated = [notif, ...prev]
            saveNotifs(updated)
            return updated
          })
        }
      }).catch(() => {})
    }

    // Desafios semanais disponíveis
    const challengesId = `challenges_week_${getWeekKey()}`
    if (!existingIds.has(challengesId)) {
      api.get<{ challenges: { completed: boolean }[] }>('/challenges/weekly').then(({ data }) => {
        const pending = data.challenges.filter(c => !c.completed).length
        if (pending > 0) {
          const notif: Notification = {
            id: challengesId, type: 'challenge', read: false, link: '/app',
            emoji: '⚡', title: `${pending} desafio${pending > 1 ? 's' : ''} da semana`,
            body: `Você tem ${pending} desafio${pending > 1 ? 's' : ''} pendente${pending > 1 ? 's' : ''}. Complete e ganhe XP bônus!`,
          }
          setNotifs(prev => {
            const ids = new Set(prev.map(n => n.id))
            if (ids.has(challengesId)) return prev
            const updated = [notif, ...prev]
            saveNotifs(updated)
            return updated
          })
        }
      }).catch(() => {})
    }

    if (newNotifs.length > 0) {
      setNotifs(prev => {
        const ids = new Set(prev.map(n => n.id))
        const filtered = newNotifs.filter(n => !ids.has(n.id))
        if (filtered.length === 0) return prev
        const updated = [...filtered, ...prev]
        saveNotifs(updated)
        return updated
      })
    }
  }, [user?.totalXp, user?.streakDays])

  // Fecha ao clicar fora
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function markAllRead() {
    setNotifs(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      saveNotifs(updated)
      return updated
    })
  }

  function markRead(id: string) {
    setNotifs(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      saveNotifs(updated)
      return updated
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(v => !v); if (!open && unread > 0) setTimeout(markAllRead, 2000) }}
        className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} className="text-gray-500 dark:text-gray-400" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Notificações</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">Marcar todas lidas</button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-2xl mb-1">🔔</p>
                <p className="text-sm text-gray-400">Nenhuma notificação</p>
              </div>
            )}
            {notifs.map(n => (
              <a
                key={n.id}
                href={n.link ?? '#'}
                onClick={() => { markRead(n.id); setOpen(false) }}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 ${!n.read ? 'bg-primary-muted/30' : ''}`}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{n.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${!n.read ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{n.body}</p>
                </div>
                {!n.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getWeekKey() {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}
