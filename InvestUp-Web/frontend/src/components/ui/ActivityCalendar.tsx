import { useEffect, useState } from 'react'
import api from '../../api/client'

const WEEKS = 26
const DAYS  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function intensity(count: number): string {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
  if (count === 1) return 'bg-green-200 dark:bg-green-900'
  if (count === 2) return 'bg-green-400 dark:bg-green-700'
  if (count <= 4)  return 'bg-green-500 dark:bg-green-600'
  return 'bg-green-700 dark:bg-green-500'
}

export default function ActivityCalendar() {
  const [activity, setActivity] = useState<Record<string, number>>({})
  const [loaded,   setLoaded]   = useState(false)

  useEffect(() => {
    api.get<{ activity: Record<string, number> }>(`/user/activity?weeks=${WEEKS}`)
      .then(({ data }) => setActivity(data.activity))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  // Gera grid: últimas WEEKS semanas, começando no domingo
  const today  = new Date()
  const endDay = new Date(today)
  endDay.setDate(endDay.getDate() - endDay.getDay()) // último domingo

  const cells: { date: string; count: number; month: number }[] = []
  for (let w = WEEKS - 1; w >= 0; w--) {
    for (let d = 0; d <= 6; d++) {
      const day = new Date(endDay)
      day.setDate(day.getDate() - w * 7 + d)
      const key = day.toISOString().slice(0, 10)
      cells.push({ date: key, count: activity[key] ?? 0, month: day.getMonth() })
    }
  }

  // Identifica onde mostrar labels de mês
  const monthLabels: { col: number; label: string }[] = []
  let lastMonth = -1
  cells.forEach((c, i) => {
    const col = Math.floor(i / 7)
    if (c.month !== lastMonth && i % 7 === 0) {
      monthLabels.push({ col, label: MONTHS[c.month] })
      lastMonth = c.month
    }
  })

  const totalDays    = Object.keys(activity).length
  const totalActions = Object.values(activity).reduce((s, v) => s + v, 0)

  if (!loaded) return null

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Histórico de atividade</p>
        <p className="text-xs text-gray-400">{totalDays} dias ativos · {totalActions} ações</p>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${WEEKS * 14 + 30}px` }}>
          {/* Labels de mês */}
          <div className="flex mb-1 ml-7">
            {Array.from({ length: WEEKS }, (_, i) => {
              const ml = monthLabels.find(m => m.col === i)
              return (
                <div key={i} className="flex-shrink-0 text-[10px] text-gray-400" style={{ width: 14 }}>
                  {ml ? ml.label : ''}
                </div>
              )
            })}
          </div>

          <div className="flex gap-0.5">
            {/* Labels de dia da semana */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((d, i) => (
                <div key={d} className="text-[9px] text-gray-400 leading-none flex items-center" style={{ height: 12, visibility: i % 2 === 0 ? 'visible' : 'hidden' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grid de semanas */}
            {Array.from({ length: WEEKS }, (_, w) => (
              <div key={w} className="flex flex-col gap-0.5 flex-shrink-0">
                {cells.slice(w * 7, w * 7 + 7).map((cell, d) => (
                  <div
                    key={d}
                    className={`rounded-sm transition-colors cursor-default ${intensity(cell.count)}`}
                    style={{ width: 12, height: 12 }}
                    title={cell.count > 0 ? `${cell.date}: ${cell.count} ação${cell.count > 1 ? 'ões' : ''}` : cell.date}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-1 justify-end">
        <span className="text-[10px] text-gray-400 mr-1">Menos</span>
        {['bg-gray-100 dark:bg-gray-800', 'bg-green-200', 'bg-green-400', 'bg-green-500', 'bg-green-700'].map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span className="text-[10px] text-gray-400 ml-1">Mais</span>
      </div>
    </div>
  )
}
