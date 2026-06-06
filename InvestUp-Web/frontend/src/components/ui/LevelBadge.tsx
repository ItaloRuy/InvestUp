import { getLevelProgress } from '../../utils/levels'

interface Props {
  xp: number
  compact?: boolean
}

export default function LevelBadge({ xp, compact = false }: Props) {
  const { current, next, pct, xpInLevel, xpNeeded } = getLevelProgress(xp)

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${current.bg} ${current.color} ${current.border}`}>
        {current.emoji} Nv.{current.level} {current.title}
      </span>
    )
  }

  return (
    <div className={`rounded-2xl border-2 ${current.border} ${current.bg} p-4 space-y-3`}>
      {/* Título do nível */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{current.emoji}</span>
          <div>
            <p className="text-xs text-gray-500 font-medium">Nível {current.level}</p>
            <p className={`text-lg font-bold ${current.color}`}>{current.title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">XP total</p>
          <p className={`text-sm font-bold ${current.color}`}>⚡ {xp.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Barra de progresso para o próximo nível */}
      {next && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{xpInLevel.toLocaleString('pt-BR')} / {xpNeeded.toLocaleString('pt-BR')} XP</span>
            <span className="flex items-center gap-1">
              Próximo: {next.emoji} <span className={next.color + ' font-semibold'}>{next.title}</span>
            </span>
          </div>
          <div className="h-2.5 bg-white/60 rounded-full overflow-hidden border border-white/80">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                current.level <= 2 ? 'bg-blue-400' :
                current.level <= 4 ? 'bg-green-400' :
                current.level <= 6 ? 'bg-purple-400' : 'bg-yellow-400'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Faltam {(xpNeeded - xpInLevel).toLocaleString('pt-BR')} XP para {next.title}
          </p>
        </div>
      )}

      {!next && (
        <div className="text-center py-1">
          <p className="text-xs font-bold text-yellow-600">🎉 Nível máximo atingido!</p>
        </div>
      )}
    </div>
  )
}
