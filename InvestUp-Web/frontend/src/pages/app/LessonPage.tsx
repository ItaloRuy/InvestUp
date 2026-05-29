import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { X, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'
import type { User } from '../../types'

// Conteúdo da lição 1.4 (mock — em produção viria da API)
const LESSON_CONTENT = {
  id: '1.4',
  title: 'Inflação — o ladrão silencioso',
  emoji: '💸',
  xpReward: 40,
  steps: [
    {
      type: 'content', emoji: '🍬',
      text: ['Imagina que hoje você pode comprar **10 balas** com R$ 1,00.',
             'Daqui a um ano, com o mesmo R$ 1,00 você consegue comprar só **9 balas**.',
             'Você não gastou nada. O dinheiro está lá. Mas ele compra menos. Isso é **inflação**.'],
    },
    {
      type: 'callout', variant: 'tip',
      text: '💡 Inflação = os preços sobem com o tempo e seu dinheiro perde força.',
    },
    {
      type: 'content', emoji: '📩',
      text: ['Carla juntou R$ 5.000 e deixou em casa por 1 ano.',
             'O envelope ainda tem R$ 5.000. Mas a inflação foi de 5%.',
             'Aquilo que custava R$ 5.000 agora custa **R$ 5.250**.',
             '**Carla perdeu R$ 250 sem gastar nada!**'],
    },
    {
      type: 'quiz',
      question: 'O que acontece com R$ 1.000 em casa por 1 ano com inflação de 6%?',
      options: [
        { id: 'a', text: 'O dinheiro some — alguém pode roubar', correct: false },
        { id: 'b', text: 'Fica do mesmo jeito — R$ 1.000 é R$ 1.000', correct: false },
        { id: 'c', text: 'Compra menos — vale só R$ 940 em poder de compra', correct: true },
        { id: 'd', text: 'Cresce — dinheiro parado não perde', correct: false },
      ],
      explanation: 'O número não muda, mas o que você compra com ele diminui. Com 6% de inflação, precisaria de R$ 1.060 para comprar o mesmo de antes. Perdeu R$ 60 de poder de compra sem gastar nada.',
    },
    {
      type: 'quiz',
      question: 'A poupança rendeu 4% e a inflação foi 5%. Você ficou:',
      options: [
        { id: 'a', text: 'Mais rico — ganhou 4%', correct: false },
        { id: 'b', text: 'Igual — pelo menos não perdeu', correct: false },
        { id: 'c', text: 'Mais pobre — rendimento real foi -1%', correct: true },
        { id: 'd', text: 'Muito rico — poupança sempre protege', correct: false },
      ],
      explanation: 'Rendimento real = 4% − 5% = -1%. Mesmo ganhando 4%, a inflação comeu tudo e mais um pouco. O número subiu, mas o que você compra caiu.',
    },
  ],
}

export default function LessonPage() {
  const { lessonId } = useParams()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showExpl, setShowExpl] = useState<Record<number, boolean>>({})
  const [finished, setFinished] = useState(false)
  const [completing, setCompleting] = useState(false)

  const current = LESSON_CONTENT.steps[step]
  const total   = LESSON_CONTENT.steps.length
  const isLast  = step === total - 1
  const isQuiz  = current.type === 'quiz'
  const canNext = !isQuiz || !!answers[step]

  const handleAnswer = (optId: string) => {
    if (answers[step]) return
    setAnswers(p => ({ ...p, [step]: optId }))
    setTimeout(() => setShowExpl(p => ({ ...p, [step]: true })), 400)
  }

  const handleNext = async () => {
    if (isLast) {
      if (completing) return
      setCompleting(true)
      try {
        const { data } = await api.post<User>(
          `/user/lessons/${lessonId ?? LESSON_CONTENT.id}/complete`,
          { xpReward: LESSON_CONTENT.xpReward, trailNumber: 1 }
        )
        updateUser(data)
      } catch {
        updateUser({
          totalXp: (user?.totalXp ?? 0) + LESSON_CONTENT.xpReward,
          lessonsCompleted: (user?.lessonsCompleted ?? 0) + 1,
        })
      }
      setFinished(true)
      return
    }
    setStep(s => s + 1)
  }

  if (finished) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <span className="text-7xl animate-bounce">🎉</span>
        <h1 className="text-3xl font-bold text-gray-900">Lição concluída!</h1>
        <p className="text-gray-500">{LESSON_CONTENT.title}</p>
        <div className="badge-xp text-base px-4 py-2">⚡ +{LESSON_CONTENT.xpReward} XP</div>
        <button onClick={() => { toast.success(`+${LESSON_CONTENT.xpReward} XP ganhos!`); navigate('/app/trilhas') }}
          className="btn-primary px-8">
          Continuar →
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/app/trilhas')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Fechar">
          <X size={20} className="text-gray-400" />
        </button>
        {/* Progress bar */}
        <div className="flex-1 flex gap-1.5">
          {LESSON_CONTENT.steps.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              i < step ? 'bg-success' : i === step ? 'bg-primary' : 'bg-gray-200'
            }`} />
          ))}
        </div>
        <span className="badge-xp">⚡ {LESSON_CONTENT.xpReward}</span>
      </div>

      {/* Conteúdo */}
      <div className="card space-y-4 min-h-[300px]">
        {current.type === 'content' && (
          <>
            {'emoji' in current && <div className="text-5xl text-center py-2">{current.emoji as string}</div>}
            <div className="space-y-3">
              {(current.text as string[]).map((line, i) => (
                <p key={i} className="text-base text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary">$1</strong>')
                  }} />
              ))}
            </div>
          </>
        )}

        {current.type === 'callout' && (
          <div className="bg-primary-muted border-l-4 border-primary rounded-xl p-4">
            <p className="text-sm font-medium text-gray-800">{current.text as string}</p>
          </div>
        )}

        {current.type === 'quiz' && (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">❓ Quiz</p>
            <p className="text-lg font-semibold text-gray-900">{current.question as string}</p>
            <div className="space-y-2">
              {(current.options as any[]).map((opt) => {
                const selected = answers[step]
                const isSelected = selected === opt.id
                const revealed  = !!selected

                let cls = 'border border-gray-200 bg-white hover:bg-gray-50'
                if (revealed) {
                  if (opt.correct) cls = 'border-2 border-success bg-success-muted'
                  else if (isSelected) cls = 'border-2 border-danger bg-danger-muted'
                  else cls = 'border border-gray-100 bg-gray-50 opacity-50'
                } else if (isSelected) {
                  cls = 'border-2 border-primary bg-primary-muted'
                }

                return (
                  <button key={opt.id} onClick={() => handleAnswer(opt.id)}
                    disabled={!!selected}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all ${cls}`}
                    aria-pressed={isSelected}
                  >
                    <span className="w-6 h-6 rounded-full border border-gray-300 bg-gray-100
                      flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {opt.id.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-800">{opt.text}</span>
                    {revealed && opt.correct && <span className="ml-auto">✅</span>}
                    {revealed && isSelected && !opt.correct && <span className="ml-auto">❌</span>}
                  </button>
                )
              })}
            </div>

            {showExpl[step] && (
              <div className={`p-4 rounded-xl border ${
                (current.options as any[]).find((o:any) => o.id === answers[step])?.correct
                  ? 'bg-success-muted border-success/30'
                  : 'bg-primary-muted border-primary/30'
              }`}>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {(current.options as any[]).find((o:any) => o.id === answers[step])?.correct
                    ? '🎉 Correto!' : '📚 Quase lá!'}
                </p>
                <p className="text-sm text-gray-700">{current.explanation as string}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botão */}
      <button onClick={handleNext} disabled={!canNext || completing}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40">
        {completing ? 'Salvando...' : isLast ? '🎉 Concluir lição' : 'Continuar'}
        {!isLast && !completing && <ChevronRight size={18} />}
      </button>
    </div>
  )
}
