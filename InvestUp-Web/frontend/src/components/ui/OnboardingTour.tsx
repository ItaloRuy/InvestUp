import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const STORAGE_KEY = 'investup_onboarding_done'

const STEPS = [
  {
    emoji: '👋',
    title: 'Bem-vindo ao InvestUp!',
    body: 'Aqui você aprende a investir de forma gamificada. Cada lição completa te dá XP e mantém o seu streak.',
    highlight: null,
    action: null,
  },
  {
    emoji: '📚',
    title: 'Comece pelas Trilhas',
    body: 'A Trilha 1 — Fundamentos — está desbloqueada. Complete as lições em ordem para avançar pelas trilhas seguintes.',
    highlight: 'trilhas',
    action: { label: 'Ver trilhas', to: '/app/trilhas' },
  },
  {
    emoji: '🧮',
    title: 'Use o Simulador',
    body: 'Simule quanto seu dinheiro pode crescer, compare carteiras, calcule quanto precisa para a independência financeira e mais.',
    highlight: 'simulador',
    action: { label: 'Abrir simulador', to: '/app/simulador' },
  },
  {
    emoji: '💰',
    title: 'Controle seu dinheiro',
    body: 'No Controle Financeiro você registra gastos, define metas de orçamento e exporta relatórios mensais em PDF.',
    highlight: 'financas',
    action: { label: 'Ir para finanças', to: '/app/financas' },
  },
  {
    emoji: '⚡',
    title: 'Como ganhar XP',
    body: 'Complete lições (+30–100 XP), responda o quiz diário (+25 XP), complete desafios semanais (+20–80 XP) e mantenha seu streak para bônus extras.',
    highlight: null,
    action: null,
  },
  {
    emoji: '🚀',
    title: 'Tudo pronto!',
    body: 'Sua jornada de investimentos começa agora. Lembre-se: consistência é mais importante que intensidade. Bons estudos!',
    highlight: null,
    action: { label: 'Começar!', to: '/app/trilhas' },
  },
]

export default function OnboardingTour() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [step,    setStep]    = useState(0)

  useEffect(() => {
    if (!user) return
    const done = localStorage.getItem(STORAGE_KEY)
    // Mostra somente para usuários com pouco XP (novos ou quase novos) que ainda não viram
    if (!done && (user.totalXp ?? 0) < 200) {
      setVisible(true)
    }
  }, [user])

  function finish() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={finish}
      />

      {/* Modal central */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm pointer-events-auto overflow-hidden">
          {/* Barra de progresso */}
          <div className="h-1 bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Conteúdo */}
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <span className="text-4xl">{current.emoji}</span>
              <button onClick={finish} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400">
                <X size={18} />
              </button>
            </div>

            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{current.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{current.body}</p>
            </div>

            {/* Dots de passo */}
            <div className="flex justify-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-gray-200 dark:bg-gray-700'}`}
                />
              ))}
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-1">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
              )}
              <div className="flex-1" />
              {isLast ? (
                current.action ? (
                  <Link
                    to={current.action.to}
                    onClick={finish}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    {current.action.label} 🚀
                  </Link>
                ) : (
                  <button
                    onClick={finish}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Começar 🚀
                  </button>
                )
              ) : (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Próximo <ChevronRight size={16} />
                </button>
              )}
            </div>

            <p className="text-xs text-center text-gray-400">{step + 1} de {STEPS.length}</p>
          </div>
        </div>
      </div>
    </>
  )
}
