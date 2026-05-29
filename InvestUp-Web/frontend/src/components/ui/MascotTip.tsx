import { useState } from 'react'
import { X } from 'lucide-react'

interface MascotTipProps {
  tip: string
  dismissible?: boolean
}

export default function MascotTip({ tip, dismissible = true }: MascotTipProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="relative flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-muted p-4">
      {/* Mascote — emoji placeholder até ter a imagem oficial da UENP */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl shadow">
        🦁
      </div>

      {/* Balão de fala */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Dica do mascote</p>
        <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
      </div>

      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar dica"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
