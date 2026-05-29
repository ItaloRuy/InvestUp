import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { X, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'
import type { User } from '../../types'

// ─── Banco de lições
const LESSONS: Record<string, any> = {
  '1.4': {
    id: '1.4',
    title: 'Inflação — o ladrão silencioso',
    emoji: '💸',
    xpReward: 40,
    steps: [
      {
        type: 'content', emoji: '🍬',
        text: [
          'Imagina que hoje você pode comprar **10 balas** com R$ 1,00.',
          'Daqui a um ano, com o mesmo R$ 1,00 você consegue comprar só **9 balas**.',
          'Você não gastou nada. O dinheiro está lá. Mas ele compra menos. Isso é **inflação**.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '💡 Inflação = os preços sobem com o tempo e seu dinheiro perde força.',
      },
      {
        type: 'content', emoji: '📩',
        text: [
          'Carla juntou R$ 5.000 e deixou em casa por 1 ano.',
          'O envelope ainda tem R$ 5.000. Mas a inflação foi de 5%.',
          'Aquilo que custava R$ 5.000 agora custa **R$ 5.250**.',
          '**Carla perdeu R$ 250 sem gastar nada!**',
        ],
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
  },

  '1.6': {
    id: '1.6',
    title: 'O número mágico dos dividendos',
    emoji: '🔄',
    xpReward: 60,
    steps: [
      {
        type: 'content', emoji: '🏢',
        text: [
          'Imagine que você compra uma pequena fatia de uma empresa. Essa fatia se chama **ação** (ou **cota**, no caso de fundos).',
          'Quando a empresa lucra, ela divide parte desse lucro com os donos. Esse dinheiro que cai na sua conta se chama **dividendo**.',
          'É como ser sócio de uma pizzaria e receber parte do lucro todo mês — sem precisar trabalhar lá.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '💡 Dividendo = parte do lucro da empresa que vai direto para o seu bolso, só por ser dono de ações ou cotas.',
      },
      {
        type: 'content', emoji: '🔢',
        text: [
          'Aqui começa o jogo interessante. Imagine o **MXRF11**, um fundo imobiliário que custa R$ 10 por cota e paga R$ 0,10 de dividendo por cota todo mês.',
          'Se você tem **100 cotas**, recebe: 100 × R$ 0,10 = **R$ 10,00** de dividendo.',
          'Esse R$ 10,00 é exatamente o preço de **1 nova cota**.',
          'Ou seja: com 100 cotas, o dividendo mensal já paga **1 cota nova por mês** — sem você colocar mais dinheiro!',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '🔢 Número mágico = Preço da cota ÷ Dividendo mensal por cota. Se custa R$ 10 e paga R$ 0,10 → número mágico = 100.',
      },
      {
        type: 'content', emoji: '📊',
        text: [
          '**HGLG11** — cota R$ 160, dividendo R$ 1,60/mês → número mágico = **100 cotas** → dividendo compra 1 cota/mês.',
          '**TAEE11** — cota R$ 40, dividendo R$ 0,40/mês → número mágico = **100 cotas** → dividendo compra 1 cota/mês.',
          '**BBAS3** — ação R$ 25, dividendo R$ 0,25/trimestre → número mágico = **100 ações** → dividendo compra 1 ação por trimestre.',
          'Percebeu? Quando o dividend yield é **1% ao mês**, o número mágico é sempre 100 — não importa o preço.',
        ],
      },
      {
        type: 'content', emoji: '❄️',
        text: [
          'Agora imagine o que acontece quando você **reinveste** esses dividendos em vez de gastar.',
          '**Mês 1:** 100 cotas → R$ 10 de dividendo → compra 1 cota → agora tem **101 cotas**.',
          '**Mês 2:** 101 cotas → R$ 10,10 de dividendo → compra 1 cota → agora tem **102 cotas**.',
          'Com o tempo, os dividendos pagam **mais de 1 cota por mês automaticamente**. Isso é o **efeito bola de neve**.',
        ],
      },
      {
        type: 'callout', variant: 'tip',
        text: '⚡ Dividendo reinvestido → mais cotas → mais dividendo → mais cotas. O tempo faz o trabalho pesado por você.',
      },
      {
        type: 'quiz',
        question: 'Uma cota custa R$ 20 e paga R$ 0,20 de dividendo por mês. Quantas cotas você precisa para o dividendo comprar 1 cota nova todo mês?',
        options: [
          { id: 'a', text: '20 cotas', correct: false },
          { id: 'b', text: '50 cotas', correct: false },
          { id: 'c', text: '100 cotas', correct: true },
          { id: 'd', text: '200 cotas', correct: false },
        ],
        explanation: 'Número mágico = R$ 20 ÷ R$ 0,20 = 100. Com 100 cotas você recebe 100 × R$ 0,20 = R$ 20 de dividendo — exatamente o preço de 1 nova cota.',
      },
      {
        type: 'quiz',
        question: 'Pedro tem 100 cotas do MXRF11 (R$ 10 cada, dividendo R$ 0,10/mês) e reinveste tudo. Após 2 meses, quantas cotas ele tem?',
        options: [
          { id: 'a', text: '100 cotas — dividendo não compra cota', correct: false },
          { id: 'b', text: '101 cotas — só ganhou no primeiro mês', correct: false },
          { id: 'c', text: '102 cotas', correct: true },
          { id: 'd', text: '110 cotas', correct: false },
        ],
        explanation: 'Mês 1: 100 cotas → R$ 10 de dividendo → compra 1 cota → 101 cotas. Mês 2: 101 cotas → R$ 10,10 de dividendo → compra 1 cota → 102 cotas. A bola de neve começa devagar, mas acelera com o tempo.',
      },
      {
        type: 'quiz',
        question: 'TAEE11 custa R$ 40 e paga R$ 0,40/mês. Qual é o número mágico e o que ele significa?',
        options: [
          { id: 'a', text: '40 cotas — com 40 cotas você recebe R$ 40 de dividendo', correct: false },
          { id: 'b', text: '100 cotas — com 100 cotas o dividendo paga 1 cota nova por mês', correct: true },
          { id: 'c', text: '400 cotas — precisa de muito mais para fazer diferença', correct: false },
          { id: 'd', text: '10 cotas — basta pouco para reinvestir', correct: false },
        ],
        explanation: 'Número mágico = R$ 40 ÷ R$ 0,40 = 100. Com 100 cotas → dividendo de R$ 40/mês → compra exatamente 1 nova cota. O padrão é sempre 100 quando o yield é 1% ao mês.',
      },
      {
        type: 'quiz',
        question: 'O que significa "reinvestir dividendos"?',
        options: [
          { id: 'a', text: 'Guardar o dinheiro do dividendo na poupança', correct: false },
          { id: 'b', text: 'Pagar imposto sobre o dividendo recebido', correct: false },
          { id: 'c', text: 'Usar o dividendo para comprar mais cotas do mesmo ativo', correct: true },
          { id: 'd', text: 'Esperar 1 ano para receber o dividendo acumulado', correct: false },
        ],
        explanation: 'Reinvestir = usar o dividendo recebido para comprar mais cotas. Mais cotas geram mais dividendo no próximo mês. Com o tempo, o efeito bola de neve acelera o crescimento da sua carteira sem você precisar aportar mais.',
      },
    ],
  },
}

const FALLBACK_ID = '1.4'

export default function LessonPage() {
  const { lessonId } = useParams()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const lesson = LESSONS[lessonId ?? ''] ?? LESSONS[FALLBACK_ID]

  const [step,       setStep]       = useState(0)
  const [answers,    setAnswers]    = useState<Record<number, string>>({})
  const [showExpl,   setShowExpl]   = useState<Record<number, boolean>>({})
  const [finished,   setFinished]   = useState(false)
  const [completing, setCompleting] = useState(false)

  const current = lesson.steps[step]
  const total   = lesson.steps.length
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
          `/user/lessons/${lessonId ?? lesson.id}/complete`,
          { xpReward: lesson.xpReward, trailNumber: 1 }
        )
        updateUser(data)
      } catch {
        updateUser({
          totalXp: (user?.totalXp ?? 0) + lesson.xpReward,
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
        <p className="text-gray-500">{lesson.title}</p>
        <div className="badge-xp text-base px-4 py-2">⚡ +{lesson.xpReward} XP</div>
        <button
          onClick={() => { toast.success(`+${lesson.xpReward} XP ganhos!`); navigate('/app/trilhas') }}
          className="btn-primary px-8"
        >
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
        <div className="flex-1 flex gap-1.5">
          {lesson.steps.map((_: any, i: number) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              i < step ? 'bg-success' : i === step ? 'bg-primary' : 'bg-gray-200'
            }`} />
          ))}
        </div>
        <span className="badge-xp">⚡ {lesson.xpReward}</span>
      </div>

      {/* Conteúdo */}
      <div className="card space-y-4 min-h-[300px]">
        {current.type === 'content' && (
          <>
            {'emoji' in current && (
              <div className="text-5xl text-center py-2">{current.emoji as string}</div>
            )}
            <div className="space-y-3">
              {(current.text as string[]).map((line: string, i: number) => (
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
                const selected   = answers[step]
                const isSelected = selected === opt.id
                const revealed   = !!selected

                let cls = 'border border-gray-200 bg-white hover:bg-gray-50'
                if (revealed) {
                  if (opt.correct)       cls = 'border-2 border-success bg-success-muted'
                  else if (isSelected)   cls = 'border-2 border-danger bg-danger-muted'
                  else                   cls = 'border border-gray-100 bg-gray-50 opacity-50'
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
                    {revealed && opt.correct  && <span className="ml-auto">✅</span>}
                    {revealed && isSelected && !opt.correct && <span className="ml-auto">❌</span>}
                  </button>
                )
              })}
            </div>

            {showExpl[step] && (
              <div className={`p-4 rounded-xl border ${
                (current.options as any[]).find((o: any) => o.id === answers[step])?.correct
                  ? 'bg-success-muted border-success/30'
                  : 'bg-primary-muted border-primary/30'
              }`}>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {(current.options as any[]).find((o: any) => o.id === answers[step])?.correct
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
