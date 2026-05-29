import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import type { LessonStatus } from '../../types'

const TRAILS = [
  {
    id: 1, name: 'Fundamentos', emoji: '🌱', color: 'bg-primary',
    description: 'O ponto de partida. Entenda como o dinheiro funciona e o poder do tempo.',
    locked: false,
    lessons: [
      { id: '1.1', title: 'Dinheiro trabalhando por você', emoji: '💡', xp: 30, min: 5 },
      { id: '1.2', title: 'Risco x Retorno', emoji: '⚖️', xp: 30, min: 5 },
      { id: '1.3', title: 'O poder dos juros compostos', emoji: '📈', xp: 50, min: 6 },
      { id: '1.4', title: 'Inflação — o ladrão silencioso', emoji: '💸', xp: 40, min: 5 },
      { id: '1.5', title: 'Seu perfil de investidor', emoji: '🪞', xp: 30, min: 5 },
      { id: '1.boss', title: '⚔️ BOSS: Monte sua primeira carteira', emoji: '🏆', xp: 100, min: 8, isBoss: true },
    ]
  },
  {
    id: 2, name: 'Renda Fixa', emoji: '🏦', color: 'bg-blue-500',
    description: 'Tesouro Direto, CDB, LCI, LCA e tudo sobre investimentos seguros.',
    locked: true,
    lessons: [],
  },
  {
    id: 3, name: 'Renda Variável', emoji: '📈', color: 'bg-success',
    description: 'Ações, FIIs, ETFs e como investir na bolsa de forma inteligente.',
    locked: true,
    lessons: [],
  },
]

const statusConfig = {
  completed:   { badge: '✅ Concluída', cls: 'bg-success-muted text-success' },
  in_progress: { badge: '📖 Em andamento', cls: 'bg-warning/20 text-warning' },
  locked:      { badge: '🔒 Bloqueada', cls: 'bg-gray-100 text-gray-400' },
  available:   { badge: '▶️ Iniciar', cls: 'bg-primary-muted text-primary' },
}

function computeStatuses(
  lessons: { id: string }[],
  completedIds: Set<string>,
  trailLocked: boolean,
  progressLoaded: boolean
): LessonStatus[] {
  if (trailLocked) return lessons.map(() => 'locked')
  // Antes de saber o progresso do backend, mostra tudo disponível para não bloquear o usuário
  if (!progressLoaded) return lessons.map(() => 'available')
  return lessons.map((lesson, i) => {
    if (completedIds.has(lesson.id)) return 'completed'
    const prevDone = i === 0 || completedIds.has(lessons[i - 1].id)
    return prevDone ? 'available' : 'locked'
  })
}

export default function LessonsPage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [progressLoaded, setProgressLoaded] = useState(false)

  useEffect(() => {
    api.get<{ lessonId: string; status: string }[]>('/user/progress')
      .then(({ data }) => {
        const done = new Set(
          data.filter(p => p.status === 'completed').map(p => p.lessonId)
        )
        setCompletedIds(done)
      })
      .catch(() => {/* backend offline — mostra todas as lições da trilha 1 disponíveis */})
      .finally(() => setProgressLoaded(true))
  }, [])

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trilhas de Aprendizado</h1>
        <p className="text-gray-500 text-sm mt-0.5">Aprenda do básico ao avançado, no seu ritmo</p>
      </div>

      {TRAILS.map((trail) => {
        const statuses = computeStatuses(trail.lessons, completedIds, trail.locked ?? false, progressLoaded)

        return (
          <div key={trail.id} className={trail.locked ? 'opacity-60' : ''}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${trail.color} rounded-xl flex items-center justify-center text-xl`}>
                {trail.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-900">Trilha {trail.id} — {trail.name}</h2>
                  {trail.locked && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Em breve</span>}
                </div>
                <p className="text-xs text-gray-500">{trail.description}</p>
              </div>
            </div>

            {trail.lessons.length > 0 ? (
              <div className="space-y-2 ml-2 border-l-2 border-gray-100 pl-6">
                {trail.lessons.map((lesson: any, i) => {
                  const status = statuses[i]
                  const cfg = statusConfig[status] ?? statusConfig.locked
                  const isDisabled = status === 'locked'
                  const cardCls = `card flex items-center gap-4 transition-all ${
                    lesson.isBoss ? 'bg-primary border-primary/20 border' : 'hover:shadow-card-lg'
                  } ${isDisabled ? 'cursor-not-allowed' : 'hover:-translate-y-0.5'}`
                  const inner = (
                    <>
                      <span className="text-2xl flex-shrink-0">{lesson.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${lesson.isBoss ? 'text-white' : 'text-gray-900'}`}>
                          {lesson.title}
                        </p>
                        <div className="flex gap-3 mt-1">
                          <span className={`text-xs ${lesson.isBoss ? 'text-blue-200' : 'text-gray-400'}`}>
                            ⚡ {lesson.xp} XP
                          </span>
                          <span className={`text-xs ${lesson.isBoss ? 'text-blue-200' : 'text-gray-400'}`}>
                            ⏱ {lesson.min} min
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                        lesson.isBoss ? 'bg-white/20 text-white' : cfg.cls
                      }`}>
                        {cfg.badge}
                      </span>
                    </>
                  )

                  return isDisabled
                    ? <div key={lesson.id} className={cardCls}>{inner}</div>
                    : <Link key={lesson.id} to={`/app/trilhas/${trail.id}/licao/${lesson.id}`} className={cardCls}>{inner}</Link>
                })}
              </div>
            ) : (
              <div className="ml-2 border-l-2 border-gray-100 pl-6">
                <div className="card text-center text-gray-400 py-8">
                  <span className="text-3xl">🔒</span>
                  <p className="text-sm mt-2">Complete a trilha anterior para desbloquear</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
