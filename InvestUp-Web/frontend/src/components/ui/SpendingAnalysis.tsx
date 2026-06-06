import { useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import api from '../../api/client'

interface Expense {
  id: number
  category: string
  description: string
  amount: number
  date: string
}

const CAT_LABELS: Record<string, string> = {
  moradia: 'Moradia', alimentacao: 'Alimentação', transporte: 'Transporte',
  lazer: 'Lazer', saude: 'Saúde', educacao: 'Educação',
  investimento: 'Investimento', outros: 'Outros',
}

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function prevMonthKey(year: number, month: number): string {
  if (month === 0) return `${year - 1}-12`
  return `${year}-${String(month).padStart(2, '0')}`
}

function prevMonthLabel(year: number, month: number): string {
  const d = new Date(year, month - 1)
  return d.toLocaleDateString('pt-BR', { month: 'long' })
}

function buildAnalysis(
  curExpenses: Expense[], curIncome: number,
  prevExpenses: Expense[], prevIncome: number,
  prevLabel: string
): { lines: { type: 'info' | 'good' | 'warn' | 'danger'; text: string }[]; hasPrev: boolean } {
  const curTotal  = curExpenses.reduce((s, e) => s + e.amount, 0)
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0)
  const lines: { type: 'info' | 'good' | 'warn' | 'danger'; text: string }[] = []
  const hasPrev = prevExpenses.length > 0 || prevIncome > 0

  if (!hasPrev) {
    lines.push({ type: 'info', text: 'Sem dados do mês anterior para comparar. Continue registrando seus gastos para ver análises comparativas.' })
    return { lines, hasPrev }
  }

  // Comparativo total
  if (prevTotal > 0) {
    const diff    = curTotal - prevTotal
    const diffPct = Math.abs((diff / prevTotal) * 100).toFixed(0)
    if (diff > 0) {
      lines.push({
        type: curIncome > 0 && curTotal > curIncome ? 'danger' : 'warn',
        text: `Você gastou ${fmtBRL(diff)} (${diffPct}%) a mais do que em ${prevLabel}.`,
      })
    } else if (diff < 0) {
      lines.push({ type: 'good', text: `Ótimo! Você gastou ${fmtBRL(Math.abs(diff))} (${diffPct}%) a menos do que em ${prevLabel}.` })
    } else {
      lines.push({ type: 'info', text: `Seus gastos ficaram estáveis em relação a ${prevLabel}.` })
    }
  }

  // Maior variação por categoria
  const cats = Object.keys(CAT_LABELS)
  const curByC:  Record<string, number> = {}
  const prevByC: Record<string, number> = {}
  cats.forEach(c => {
    curByC[c]  = curExpenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0)
    prevByC[c] = prevExpenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0)
  })

  const changes = cats
    .filter(c => curByC[c] > 0 || prevByC[c] > 0)
    .map(c => ({ cat: c, diff: curByC[c] - prevByC[c] }))
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

  const biggestIncrease = changes.find(c => c.diff > 50)
  const biggestDecrease = changes.find(c => c.diff < -50)

  if (biggestIncrease) {
    lines.push({
      type: biggestIncrease.diff > 300 ? 'warn' : 'info',
      text: `${CAT_LABELS[biggestIncrease.cat]} foi a categoria com maior aumento: +${fmtBRL(biggestIncrease.diff)} em relação a ${prevLabel}.`,
    })
  }
  if (biggestDecrease) {
    lines.push({
      type: 'good',
      text: `${CAT_LABELS[biggestDecrease.cat]} teve a maior redução: ${fmtBRL(biggestDecrease.diff)} comparado a ${prevLabel}.`,
    })
  }

  // Taxa de poupança
  if (curIncome > 0) {
    const savePct = Math.max(0, ((curIncome - curTotal) / curIncome) * 100)
    if (curTotal > curIncome) {
      lines.push({ type: 'danger', text: `Seus gastos (${fmtBRL(curTotal)}) superam sua renda (${fmtBRL(curIncome)}). Revise seus lançamentos.` })
    } else if (savePct >= 20) {
      lines.push({ type: 'good', text: `Taxa de poupança de ${savePct.toFixed(0)}% — acima da meta recomendada de 20%. Continue assim!` })
    } else if (savePct < 10) {
      lines.push({ type: 'warn', text: `Taxa de poupança de ${savePct.toFixed(0)}% — abaixo do ideal. Tente aumentar seus aportes.` })
    }
  }

  // Investimento
  if (curByC['investimento'] === 0 && curIncome > 0) {
    lines.push({ type: 'warn', text: 'Nenhum investimento registrado este mês. Lembre-se: pague-se primeiro antes de gastar.' })
  } else if (curByC['investimento'] > 0 && curIncome > 0) {
    const investPct = (curByC['investimento'] / curIncome) * 100
    if (investPct >= 20) {
      lines.push({ type: 'good', text: `Você investiu ${investPct.toFixed(0)}% da sua renda — excelente disciplina!` })
    }
  }

  return { lines, hasPrev }
}

interface Props {
  currentExpenses: Expense[]
  currentIncome: number
  year: number
  month: number
}

export default function SpendingAnalysis({ currentExpenses, currentIncome, year, month }: Props) {
  const [prevExpenses, setPrevExpenses] = useState<Expense[]>([])
  const [prevIncome,   setPrevIncome]   = useState(0)
  const [loaded,       setLoaded]       = useState(false)

  const pmk   = prevMonthKey(year, month)
  const pLabel = prevMonthLabel(year, month)

  useEffect(() => {
    setLoaded(false)
    Promise.all([
      api.get<Expense[]>(`/user/expenses?month=${pmk}`),
      api.get<{ amount: number }>(`/user/income?month=${pmk}`),
    ])
      .then(([expRes, incRes]) => {
        setPrevExpenses(expRes.data)
        setPrevIncome(incRes.data.amount)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [pmk])

  if (!loaded) return null
  if (currentExpenses.length === 0 && currentIncome === 0) return null

  const { lines } = buildAnalysis(currentExpenses, currentIncome, prevExpenses, prevIncome, pLabel)

  if (lines.length === 0) return null

  const typeStyle = {
    good:   'bg-success-muted border-success/20 text-green-800 dark:text-green-300',
    warn:   'bg-amber-50 dark:bg-amber-900/20 border-amber-200 text-amber-800 dark:text-amber-300',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 text-red-700 dark:text-red-300',
    info:   'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
  }
  const typeIcon = { good: '✅', warn: '⚠️', danger: '🚨', info: '💡' }

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb size={16} className="text-amber-500 flex-shrink-0" />
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Análise do mês</p>
        <span className="text-xs text-gray-400 ml-auto">vs. {pLabel}</span>
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <div key={i} className={`flex items-start gap-2 rounded-xl px-3 py-2.5 border text-xs leading-relaxed ${typeStyle[line.type]}`}>
            <span className="flex-shrink-0 mt-0.5">{typeIcon[line.type]}</span>
            <p>{line.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
