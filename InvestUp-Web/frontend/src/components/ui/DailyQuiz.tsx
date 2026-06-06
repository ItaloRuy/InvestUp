import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'

type QuizState = {
  date: string
  question: string
  options: string[]
  answered: boolean
  correct: boolean | null
  answer: number | null
  explain: string | null
  xpReward: number
}

export default function DailyQuiz() {
  const { updateUser } = useAuth()
  const [quiz,     setQuiz]     = useState<QuizState | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const [result,   setResult]   = useState<{ correct: boolean; explain: string; xpEarned: number } | null>(null)
  const [sending,  setSending]  = useState(false)

  useEffect(() => {
    api.get<QuizState>('/quiz/daily')
      .then(({ data }) => setQuiz(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleAnswer() {
    if (selected === null || !quiz || sending) return
    setSending(true)
    try {
      const { data } = await api.post<{ correct: boolean; explain: string; xpEarned: number; totalXp: number }>('/quiz/answer', { answer: selected })
      setResult(data)
      setQuiz(q => q ? { ...q, answered: true, correct: data.correct, answer: data.correct ? selected : quiz.answer ?? selected } : q)
      if (data.xpEarned > 0) updateUser({ totalXp: data.totalXp })
    } catch {
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="card animate-pulse h-32 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!quiz) return null

  const alreadyAnswered = quiz.answered && !result
  const showResult = quiz.answered && !!(result || quiz.explain)
  const wasCorrect = result ? result.correct : quiz.correct
  const explanation = result?.explain ?? quiz.explain

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Quiz do Dia</p>
            <p className="text-[11px] text-gray-400">Responda 1 pergunta por dia e ganhe XP</p>
          </div>
        </div>
        <span className="text-xs font-bold text-primary bg-primary-muted px-2 py-1 rounded-full">+{quiz.xpReward} XP</span>
      </div>

      {/* Pergunta */}
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">{quiz.question}</p>

      {/* Opções */}
      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          const isSelected    = selected === i
          const isCorrectOpt  = showResult && quiz.answer === i
          const isWrongPicked = showResult && selected === i && !wasCorrect

          let cls = 'w-full text-left px-3 py-2.5 rounded-xl text-sm border-2 transition-all '
          if (isCorrectOpt)  cls += 'bg-success-muted border-success text-success font-semibold'
          else if (isWrongPicked) cls += 'bg-red-50 border-red-400 text-red-600'
          else if (isSelected && !showResult) cls += 'bg-primary-muted border-primary text-primary font-semibold'
          else if (showResult) cls += 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500'
          else cls += 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary/40 hover:bg-primary-muted/30'

          return (
            <button
              key={i}
              className={cls}
              disabled={showResult || alreadyAnswered}
              onClick={() => setSelected(i)}
            >
              <span className="mr-2 text-xs font-bold opacity-50">{String.fromCharCode(65 + i)}.</span>
              {opt}
              {isCorrectOpt  && <span className="ml-2">✅</span>}
              {isWrongPicked && <span className="ml-2">❌</span>}
            </button>
          )
        })}
      </div>

      {/* Resultado */}
      {showResult && (
        <div className={`rounded-xl p-3 ${wasCorrect ? 'bg-success-muted' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <p className="text-sm font-bold mb-1">
            {wasCorrect ? '🎉 Correto! +25 XP ganhos!' : '😅 Quase! Veja a explicação:'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{explanation}</p>
        </div>
      )}

      {/* Já respondido hoje (veio do backend) */}
      {alreadyAnswered && (
        <div className={`rounded-xl p-3 ${quiz.correct ? 'bg-success-muted' : 'bg-gray-100 dark:bg-gray-800'}`}>
          <p className="text-sm font-semibold">
            {quiz.correct ? '✅ Você acertou o quiz de hoje!' : '❌ Você errou o quiz de hoje.'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Volte amanhã para uma nova pergunta.</p>
        </div>
      )}

      {/* Botão confirmar */}
      {!showResult && !alreadyAnswered && (
        <button
          onClick={handleAnswer}
          disabled={selected === null || sending}
          className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          {sending ? 'Enviando...' : 'Confirmar resposta'}
        </button>
      )}
    </div>
  )
}
