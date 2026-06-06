import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import type { LessonStatus } from '../../types'

const TRAILS = [
  {
    id: 1, name: 'Fundamentos', emoji: '🌱', color: 'bg-primary', borderColor: 'border-primary', textColor: 'text-primary', pathColor: '#1E3A5F',
    description: 'O ponto de partida. Entenda como o dinheiro funciona e o poder do tempo.',
    locked: false,
    lessons: [
      { id: '1.1', title: 'Dinheiro trabalhando por você', emoji: '💡', xp: 30, min: 5 },
      { id: '1.2', title: 'Risco x Retorno', emoji: '⚖️', xp: 30, min: 5 },
      { id: '1.3', title: 'O poder dos juros compostos', emoji: '📈', xp: 50, min: 6 },
      { id: '1.4', title: 'Inflação — o ladrão silencioso', emoji: '💸', xp: 40, min: 5 },
      { id: '1.5', title: 'Seu perfil de investidor', emoji: '🪞', xp: 30, min: 5 },
      { id: '1.6', title: 'O número mágico dos dividendos', emoji: '🔄', xp: 60, min: 7 },
      { id: '1.boss', title: 'Monte sua primeira carteira', emoji: '🏆', xp: 100, min: 8, isBoss: true },
    ]
  },
  {
    id: 2, name: 'Renda Fixa', emoji: '🏦', color: 'bg-blue-500', borderColor: 'border-blue-500', textColor: 'text-blue-600', pathColor: '#3B82F6',
    description: 'Tesouro Direto, CDB, LCI, LCA e tudo sobre investimentos seguros.',
    locked: true,
    lessons: [
      { id: '2.1', title: 'O que é Renda Fixa?',          emoji: '🤝', xp: 30,  min: 5 },
      { id: '2.2', title: 'Tesouro Direto',                emoji: '🇧🇷', xp: 40,  min: 6 },
      { id: '2.3', title: 'CDB — o banco te pagando',      emoji: '🏦', xp: 35,  min: 5 },
      { id: '2.4', title: 'LCI e LCA — sem pagar imposto', emoji: '🏠', xp: 35,  min: 5 },
      { id: '2.5', title: 'Como comparar e escolher',      emoji: '⚖️', xp: 40,  min: 6 },
      { id: '2.boss', title: 'Monte sua carteira de renda fixa', emoji: '🏆', xp: 100, min: 8, isBoss: true },
    ],
  },
  {
    id: 3, name: 'Renda Variável', emoji: '📈', color: 'bg-success', borderColor: 'border-green-500', textColor: 'text-green-600', pathColor: '#00A86B',
    description: 'Ações, FIIs, ETFs e como investir na bolsa de forma inteligente.',
    locked: true,
    lessons: [
      { id: '3.1', title: 'O que são ações?',              emoji: '🏢', xp: 30,  min: 5 },
      { id: '3.2', title: 'Como funciona a bolsa',          emoji: '🏛️', xp: 35,  min: 5 },
      { id: '3.3', title: 'FIIs — o tijolo que paga dividendo', emoji: '🏗️', xp: 40, min: 6 },
      { id: '3.4', title: 'ETFs — a cesta de ações',        emoji: '🧺', xp: 35,  min: 5 },
      { id: '3.5', title: 'Como analisar uma ação',         emoji: '🔍', xp: 50,  min: 7 },
      { id: '3.boss', title: 'Carteira diversificada',      emoji: '🏆', xp: 120, min: 10, isBoss: true },
    ],
  },
  {
    id: 4, name: 'Cripto', emoji: '₿', color: 'bg-orange-500', borderColor: 'border-orange-500', textColor: 'text-orange-600', pathColor: '#F97316',
    description: 'Bitcoin, Ethereum, blockchain e como investir em cripto com segurança.',
    locked: true,
    lessons: [
      { id: '4.1', title: 'O que é cripto?',                    emoji: '₿',  xp: 30,  min: 5 },
      { id: '4.2', title: 'Bitcoin e Ethereum',                  emoji: '🔶', xp: 35,  min: 5 },
      { id: '4.3', title: 'Como funciona o blockchain',          emoji: '⛓️', xp: 40,  min: 6 },
      { id: '4.4', title: 'Carteiras e exchanges',               emoji: '🔐', xp: 35,  min: 5 },
      { id: '4.5', title: 'Riscos e como investir com segurança', emoji: '⚠️', xp: 45, min: 6 },
      { id: '4.boss', title: 'Cripto na sua carteira',          emoji: '🏆', xp: 120, min: 8, isBoss: true },
    ],
  },
]

function computeStatuses(
  lessons: { id: string }[],
  completedIds: Set<string>,
  trailLocked: boolean,
  progressLoaded: boolean
): LessonStatus[] {
  if (trailLocked) return lessons.map(() => 'locked')
  if (!progressLoaded) return lessons.map(() => 'available')
  return lessons.map((lesson, i) => {
    if (completedIds.has(lesson.id)) return 'completed'
    const prevDone = i === 0 || completedIds.has(lessons[i - 1].id)
    return prevDone ? 'available' : 'locked'
  })
}

// Nó individual do mapa
function LessonNode({
  lesson,
  status,
  trailId,
  pathColor,
  isLast,
  index,
}: {
  lesson: any
  status: LessonStatus
  trailId: number
  pathColor: string
  isLast: boolean
  index: number
}) {
  const side = index % 2 === 0 ? 'left' : 'right'
  const isCompleted  = status === 'completed'
  const isAvailable  = status === 'available'
  const isLocked     = status === 'locked'
  const isBoss       = lesson.isBoss

  // Aparência do nó
  const nodeBase = 'relative flex items-center justify-center rounded-full transition-all duration-200 select-none'
  const nodeSize = isBoss ? 'w-16 h-16 text-2xl' : 'w-14 h-14 text-xl'
  const nodeBg = isCompleted
    ? 'bg-success shadow-lg shadow-success/30'
    : isAvailable && isBoss
    ? 'bg-primary shadow-lg shadow-primary/40 ring-4 ring-primary/20 animate-pulse'
    : isAvailable
    ? 'bg-primary shadow-md shadow-primary/30 ring-2 ring-primary/20'
    : 'bg-gray-200 dark:bg-gray-700'

  const nodeEl = (
    <div className={`${nodeBase} ${nodeSize} ${nodeBg}`}>
      {isLocked
        ? <span className="text-lg">🔒</span>
        : isCompleted
        ? (
          <div className="relative">
            <span>{lesson.emoji}</span>
            <span className="absolute -top-1 -right-1 text-xs bg-white rounded-full w-4 h-4 flex items-center justify-center shadow">✅</span>
          </div>
        )
        : <span>{lesson.emoji}</span>}
      {isBoss && !isLocked && (
        <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center shadow text-[10px]">⚔️</span>
      )}
    </div>
  )

  // Card de info que aparece ao lado do nó
  const infoCard = (
    <div className={`card py-2.5 px-3 max-w-[180px] ${
      isBoss ? 'bg-primary border border-primary/20' : ''
    } ${isLocked ? 'opacity-50' : ''}`}>
      <p className={`text-xs font-semibold leading-tight ${isBoss ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
        {isBoss && <span className="mr-1">⚔️ BOSS:</span>}{lesson.title}
      </p>
      <div className="flex gap-2 mt-1">
        <span className={`text-[10px] ${isBoss ? 'text-blue-200' : 'text-gray-400'}`}>⚡ {lesson.xp} XP</span>
        <span className={`text-[10px] ${isBoss ? 'text-blue-200' : 'text-gray-400'}`}>⏱ {lesson.min}m</span>
      </div>
      {isAvailable && !isLocked && (
        <span className="mt-1 text-[10px] font-bold text-primary block">▶ Iniciar</span>
      )}
      {isCompleted && (
        <span className="mt-1 text-[10px] font-bold text-success block">✅ Concluída</span>
      )}
    </div>
  )

  const content = (
    <div className={`flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      {nodeEl}
      {infoCard}
    </div>
  )

  const nodeWithPath = (
    <div className="relative flex flex-col items-center">
      {/* Linha de conexão abaixo */}
      {!isLast && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-0.5 z-0"
          style={{
            top: isBoss ? '64px' : '56px',
            height: '40px',
            backgroundColor: isCompleted ? pathColor : '#D1D5DB',
          }}
        />
      )}
      {content}
    </div>
  )

  if (isLocked) return (
    <div key={lesson.id} className="flex justify-center py-2 z-10 relative">
      {nodeWithPath}
    </div>
  )

  return (
    <Link
      to={`/app/trilhas/${trailId}/licao/${lesson.id}`}
      key={lesson.id}
      className="flex justify-center py-2 z-10 relative hover:scale-105 transition-transform"
    >
      {nodeWithPath}
    </Link>
  )
}

export default function LessonsPage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [expandedTrail, setExpandedTrail] = useState<number | null>(1)

  useEffect(() => {
    api.get<{ lessonId: string; status: string }[]>('/user/progress')
      .then(({ data }) => {
        const done = new Set(
          data.filter(p => p.status === 'completed').map(p => p.lessonId)
        )
        setCompletedIds(done)
      })
      .catch(() => {})
      .finally(() => setProgressLoaded(true))
  }, [])

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Trilhas de Aprendizado</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Aprenda do básico ao avançado, no seu ritmo</p>
      </div>

      <div className="space-y-4">
        {TRAILS.map((trail) => {
          const trailLocked =
            (trail.id === 2 && !completedIds.has('1.boss')) ||
            (trail.id === 3 && !completedIds.has('2.boss')) ||
            (trail.id === 4 && !completedIds.has('3.boss')) ||
            (trail.id === 1 && (trail.locked ?? false))
          const statuses = computeStatuses(trail.lessons, completedIds, trailLocked, progressLoaded)
          const completedCount = statuses.filter(s => s === 'completed').length
          const isExpanded = expandedTrail === trail.id

          return (
            <div key={trail.id} className={`rounded-2xl border overflow-hidden transition-all ${trailLocked ? 'opacity-60' : ''} ${trail.borderColor} border-opacity-30 dark:border-opacity-20`}>
              {/* Cabeçalho da trilha — clicável para expandir */}
              <button
                onClick={() => setExpandedTrail(isExpanded ? null : trail.id)}
                className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                disabled={trailLocked}
              >
                <div className={`w-12 h-12 ${trail.color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                  {trailLocked ? '🔒' : trail.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100">Trilha {trail.id} — {trail.name}</h2>
                    {trailLocked && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">Bloqueada</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{trail.description}</p>
                  {/* Barra de progresso */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${trail.color}`}
                        style={{ width: `${(completedCount / trail.lessons.length) * 100}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-semibold ${trail.textColor}`}>
                      {completedCount}/{trail.lessons.length}
                    </span>
                  </div>
                </div>
                <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Mapa de lições */}
              {isExpanded && !trailLocked && (
                <div className="bg-gray-50 dark:bg-gray-950 px-4 py-6">
                  <div className="flex flex-col items-center space-y-2 max-w-sm mx-auto">
                    {trail.lessons.map((lesson: any, i) => (
                      <LessonNode
                        key={lesson.id}
                        lesson={lesson}
                        status={statuses[i]}
                        trailId={trail.id}
                        pathColor={trail.pathColor}
                        isLast={i === trail.lessons.length - 1}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Trilha bloqueada — mensagem */}
              {isExpanded && trailLocked && (
                <div className="bg-gray-50 dark:bg-gray-950 px-4 py-8 text-center">
                  <span className="text-4xl">🔒</span>
                  <p className="text-sm text-gray-500 mt-2">Complete a trilha anterior para desbloquear</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
