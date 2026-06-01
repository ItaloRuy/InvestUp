import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, Wallet, TrendingDown, Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'

// ── Tipos
interface Expense {
  id: number
  category: string
  description: string
  amount: number
  date: string
}

// ── Categorias
const CATS = [
  { id: 'moradia',      label: 'Moradia',      emoji: '🏠', bar: 'bg-blue-500',    text: 'text-blue-600',    bg: 'bg-blue-50',       ideal: 30 },
  { id: 'alimentacao',  label: 'Alimentação',  emoji: '🍔', bar: 'bg-orange-500',  text: 'text-orange-600',  bg: 'bg-orange-50',     ideal: 15 },
  { id: 'transporte',   label: 'Transporte',   emoji: '🚗', bar: 'bg-yellow-500',  text: 'text-yellow-600',  bg: 'bg-yellow-50',     ideal: 10 },
  { id: 'lazer',        label: 'Lazer',        emoji: '🎮', bar: 'bg-purple-500',  text: 'text-purple-600',  bg: 'bg-purple-50',     ideal: 10 },
  { id: 'saude',        label: 'Saúde',        emoji: '💊', bar: 'bg-red-400',     text: 'text-red-600',     bg: 'bg-red-50',        ideal: 10 },
  { id: 'educacao',     label: 'Educação',     emoji: '📚', bar: 'bg-green-500',   text: 'text-green-600',   bg: 'bg-green-50',      ideal: 5  },
  { id: 'investimento', label: 'Investimento', emoji: '💰', bar: 'bg-primary',     text: 'text-primary',     bg: 'bg-primary-muted', ideal: 20 },
  { id: 'outros',       label: 'Outros',       emoji: '📦', bar: 'bg-gray-400',    text: 'text-gray-600',    bg: 'bg-gray-50',       ideal: 0  },
]
const CAT_MAP = Object.fromEntries(CATS.map(c => [c.id, c]))

const PIE_COLORS: Record<string, string> = {
  moradia: '#3b82f6', alimentacao: '#f97316', transporte: '#eab308',
  lazer: '#a855f7', saude: '#f87171', educacao: '#22c55e',
  investimento: '#1E3A5F', outros: '#9ca3af',
}

// ── Carteiras modelo predefinidas
const CARTEIRAS = [
  {
    id: 'conservadora',
    nome: 'Carteira Conservadora',
    emoji: '🛡️',
    perfil: 'Conservador',
    desc: 'Segurança máxima. Ideal para quem tem objetivo de curto prazo ou não tolera oscilações.',
    cor: 'border-blue-200 bg-blue-50',
    corBadge: 'bg-blue-100 text-blue-700',
    retornoEstimado: '8–11% a.a.',
    risco: '⭐ Muito Baixo',
    ativos: [
      { nome: 'Tesouro Selic / CDB',  pct: 50, cor: 'bg-blue-400',   desc: 'Liquidez diária, rende CDI' },
      { nome: 'Tesouro IPCA+',        pct: 20, cor: 'bg-blue-600',   desc: 'Protege da inflação no longo prazo' },
      { nome: 'LCI / LCA',            pct: 20, cor: 'bg-sky-400',    desc: 'Isentos de IR para pessoa física' },
      { nome: 'FII (Renda)',          pct: 10, cor: 'bg-indigo-400', desc: 'Fundos imobiliários de tijolo/recebíveis' },
    ],
  },
  {
    id: 'moderada',
    nome: 'Carteira Moderada',
    emoji: '⚖️',
    perfil: 'Moderado',
    desc: 'Equilíbrio entre segurança e crescimento. Aceita oscilações no médio prazo.',
    cor: 'border-green-200 bg-green-50',
    corBadge: 'bg-green-100 text-green-700',
    retornoEstimado: '11–15% a.a.',
    risco: '⭐⭐ Baixo–Médio',
    ativos: [
      { nome: 'Renda Fixa (CDB/LCI)',  pct: 45, cor: 'bg-blue-400',   desc: 'Base da carteira, baixo risco' },
      { nome: 'FII (diversificado)',   pct: 20, cor: 'bg-indigo-400', desc: 'Renda mensal + valorização' },
      { nome: 'Ações (dividendos)',    pct: 25, cor: 'bg-green-500',  desc: 'Empresas sólidas pagadoras de dividendos' },
      { nome: 'ETF internacional',    pct: 10, cor: 'bg-teal-400',   desc: 'Diversificação global (ex: IVVB11)' },
    ],
  },
  {
    id: 'arrojada',
    nome: 'Carteira Arrojada',
    emoji: '🚀',
    perfil: 'Arrojado',
    desc: 'Foco em crescimento de longo prazo. Aceita oscilações fortes no curto prazo.',
    cor: 'border-orange-200 bg-orange-50',
    corBadge: 'bg-orange-100 text-orange-700',
    retornoEstimado: '15–22% a.a.',
    risco: '⭐⭐⭐ Alto',
    ativos: [
      { nome: 'Renda Fixa (reserva)', pct: 20, cor: 'bg-blue-400',   desc: 'Apenas reserva de emergência' },
      { nome: 'Ações BR (IBOV)',      pct: 40, cor: 'bg-green-500',  desc: 'Small caps + blue chips brasileiras' },
      { nome: 'ETF EUA (S&P 500)',    pct: 25, cor: 'bg-teal-400',   desc: 'Exposição às 500 maiores dos EUA' },
      { nome: 'FII / Cripto',         pct: 15, cor: 'bg-purple-400', desc: 'Alta volatilidade, alto potencial' },
    ],
  },
  {
    id: 'permanente',
    nome: 'Carteira Permanente',
    emoji: '🏛️',
    perfil: 'Harry Browne',
    desc: 'Projetada para sobreviver a qualquer cenário econômico: boom, recessão, deflação, inflação.',
    cor: 'border-yellow-200 bg-yellow-50',
    corBadge: 'bg-yellow-100 text-yellow-700',
    retornoEstimado: '8–12% a.a.',
    risco: '⭐⭐ Médio',
    ativos: [
      { nome: 'Ações (IBOV/ETF)',    pct: 25, cor: 'bg-green-500',  desc: 'Cresce bem em períodos de prosperidade' },
      { nome: 'Tesouro IPCA+ Longo', pct: 25, cor: 'bg-blue-500',   desc: 'Protege na deflação e prosperidade' },
      { nome: 'Ouro (GOLD11/ETF)',   pct: 25, cor: 'bg-yellow-500', desc: 'Proteção na inflação e crises' },
      { nome: 'Caixa (Selic/LFT)',   pct: 25, cor: 'bg-gray-400',   desc: 'Proteção na recessão, liquidez' },
    ],
  },
  {
    id: 'allweather',
    nome: 'All Weather',
    emoji: '🌦️',
    perfil: 'Ray Dalio',
    desc: 'Criada para ter bom desempenho em todos os ciclos econômicos, com volatilidade controlada.',
    cor: 'border-primary/30 bg-primary-muted',
    corBadge: 'bg-primary/10 text-primary',
    retornoEstimado: '10–14% a.a.',
    risco: '⭐⭐ Baixo–Médio',
    ativos: [
      { nome: 'Ações (ETF global)',    pct: 30, cor: 'bg-green-500',  desc: 'Motor de crescimento' },
      { nome: 'Títulos Longos (IPCA+)',pct: 40, cor: 'bg-blue-600',   desc: 'Maior peso — estabiliza a carteira' },
      { nome: 'Títulos Médios (CDB)',  pct: 15, cor: 'bg-blue-400',   desc: 'Complemento de renda fixa' },
      { nome: 'Ouro + Commodities',   pct: 15, cor: 'bg-yellow-500', desc: 'Hedge contra inflação' },
    ],
  },
]

// ── Helpers
function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}
function futureValue(monthly: number, months: number, rate = 0.01) {
  if (monthly <= 0) return 0
  return monthly * ((Math.pow(1 + rate, months) - 1) / rate)
}

// ── Dicas inteligentes
interface Tip { type: 'success' | 'warning' | 'danger' | 'info'; text: string }

function generateTips(expenses: Expense[], income: number): Tip[] {
  const tips: Tip[] = []
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  if (total === 0) {
    tips.push({ type: 'info', text: 'Adicione seus gastos para receber dicas personalizadas sobre onde economizar.' })
    return tips
  }
  const byC: Record<string, number> = {}
  CATS.forEach(c => { byC[c.id] = 0 })
  expenses.forEach(e => { byC[e.category] = (byC[e.category] ?? 0) + e.amount })

  const base = income > 0 ? income : total
  const inv        = byC['investimento'] ?? 0
  const lazer      = byC['lazer'] ?? 0
  const alimentacao= byC['alimentacao'] ?? 0
  const moradia    = byC['moradia'] ?? 0
  const invPct     = (inv / base) * 100
  const lazerPct   = (lazer / base) * 100
  const alimentPct = (alimentacao / base) * 100
  const moradiaPct = (moradia / base) * 100

  if (inv === 0) {
    tips.push({ type: 'danger', text: `Você não investiu nada este mês! Separe pelo menos ${fmtBRL(Math.round(base * 0.1))} (10%) antes de gastar. "Pague-se primeiro" — o segredo dos que enriquecem devagar e consistentemente.` })
  } else if (invPct < 10) {
    const falta = Math.round(base * 0.2 - inv)
    tips.push({ type: 'warning', text: `Você investiu ${invPct.toFixed(0)}% este mês. Aumentar mais ${fmtBRL(falta)}/mês chegaria à meta de 20% — em 10 anos isso vira ≈ ${fmtBRL(Math.round(futureValue(falta, 120)))} com juros compostos (1% a.m.).` })
  } else if (invPct >= 20) {
    tips.push({ type: 'success', text: `Você está investindo ${invPct.toFixed(0)}% — acima da meta de 20%! Mantendo ${fmtBRL(inv)}/mês, em 20 anos você terá ≈ ${fmtBRL(Math.round(futureValue(inv, 240)))} (1% a.m.).` })
  } else {
    tips.push({ type: 'info', text: `Você investe ${invPct.toFixed(0)}% da renda. A meta é 20% — tente aumentar gradualmente.` })
  }

  if (income > 0 && total > income) {
    tips.push({ type: 'danger', text: `Seus gastos (${fmtBRL(total)}) superam sua renda (${fmtBRL(income)}) em ${fmtBRL(total - income)}. Isso gera dívidas. Corte lazer e compras supérfluas primeiro.` })
  } else if (income > 0) {
    const sobra = income - total
    if (sobra > 0 && inv === 0) {
      tips.push({ type: 'warning', text: `Sobram ${fmtBRL(sobra)} mas você não está investindo nada. Mova esse valor para uma aplicação — mesmo a poupança bate a inflação no curto prazo.` })
    } else if (sobra > 0) {
      tips.push({ type: 'success', text: `Fechou o mês com ${fmtBRL(sobra)} de sobra! Considere adicionar ao investimento.` })
    }
  }
  if (lazerPct > 15) tips.push({ type: 'warning', text: `Lazer consome ${lazerPct.toFixed(0)}% dos gastos. Revise assinaturas (streaming, academia), deliveries e saídas — cortar R$ 150/mês = R$ 1.800/ano a mais investido.` })
  if (alimentPct > 25) tips.push({ type: 'info', text: `Alimentação está em ${alimentPct.toFixed(0)}%. Cozinhar em casa vs restaurante pode reduzir esse custo em até 60%.` })
  if (moradiaPct > 35) tips.push({ type: 'warning', text: `Moradia ocupa ${moradiaPct.toFixed(0)}% da renda (ideal: 30%). Considere dividir aluguel ou refinanciar.` })

  return tips
}

type Tab = 'resumo' | 'gastos' | 'carteiras'

export default function FinancePage() {
  const { user } = useAuth()
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [tab, setTab]     = useState<Tab>('resumo')

  const mk = monthKey(year, month)

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome]     = useState(0)
  const [loading, setLoading]   = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [budgets, setBudgets]   = useState<Record<string, number>>({})

  const [formCat,    setFormCat]    = useState('alimentacao')
  const [formDesc,   setFormDesc]   = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formDate,   setFormDate]   = useState(now.toISOString().slice(0, 10))

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [expRes, incRes, budRes] = await Promise.all([
        api.get<Expense[]>(`/user/expenses?month=${mk}`),
        api.get<{ amount: number }>(`/user/income?month=${mk}`),
        api.get<{ category: string; monthlyLimit: number }[]>(`/user/budget?month=${mk}`),
      ])
      setExpenses(expRes.data)
      setIncome(incRes.data.amount)
      const bmap: Record<string, number> = {}
      budRes.data.forEach(b => { bmap[b.category] = b.monthlyLimit })
      setBudgets(bmap)
    } catch { /* offline: keep current */ }
    finally { setLoading(false) }
  }, [mk])

  const saveBudget = async (category: string, limit: number) => {
    setBudgets(p => ({ ...p, [category]: limit }))
    try { await api.put('/user/budget', { category, monthly_limit: limit, month: mk }) } catch {}
  }

  useEffect(() => { loadData() }, [loadData])

  async function addExpense() {
    const amt = parseFloat(formAmount.replace(',', '.'))
    if (!formDesc.trim() || isNaN(amt) || amt <= 0) return
    try {
      const { data } = await api.post<Expense>('/user/expenses', {
        category: formCat, description: formDesc.trim(), amount: amt, date: formDate,
      })
      setExpenses(prev => [data, ...prev])
      setFormDesc(''); setFormAmount(''); setShowForm(false)
    } catch { /* silently ignore */ }
  }

  async function deleteExpense(id: number) {
    try {
      await api.delete(`/user/expenses/${id}`)
      setExpenses(prev => prev.filter(e => e.id !== id))
    } catch { /* silently ignore */ }
  }

  async function saveIncome(v: number) {
    setIncome(v)
    try { await api.put('/user/income', { month: mk, amount: v }) } catch { /* silently ignore */ }
  }

  const total   = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])
  const byC     = useMemo(() => {
    const m: Record<string, number> = {}
    CATS.forEach(c => { m[c.id] = 0 })
    expenses.forEach(e => { m[e.category] = (m[e.category] ?? 0) + e.amount })
    return m
  }, [expenses])
  const tips    = useMemo(() => generateTips(expenses, income), [expenses, income])
  const base    = income > 0 ? income : total

  function prevMonth() { if (month === 0) { setYear(y => y-1); setMonth(11) } else setMonth(m => m-1) }
  function nextMonth() { if (month === 11) { setYear(y => y+1); setMonth(0) } else setMonth(m => m+1) }
  const isNow = year === now.getFullYear() && month === now.getMonth()
  const monthLabel = new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Controle Financeiro</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gerencie seus gastos e descubra onde investir melhor</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {([
          { id: 'resumo',    label: '📊 Resumo'         },
          { id: 'gastos',    label: '💸 Lançamentos'    },
          { id: 'carteiras', label: '🏦 Carteiras Modelo'},
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.id ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════ TAB RESUMO ══════ */}
      {tab === 'resumo' && (
        <>
          {/* Seletor de mês */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{monthLabel}</span>
            <button onClick={nextMonth} disabled={isNow} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
              <ChevronRight size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card bg-primary-muted border border-primary/20">
              <p className="text-xs text-gray-500 font-medium">💼 Renda</p>
              <p className="text-xl font-bold text-primary mt-1">{income > 0 ? fmtBRL(income) : '—'}</p>
            </div>
            <div className={`card ${total > income && income > 0 ? 'bg-danger-muted border border-danger/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <p className="text-xs text-gray-500 font-medium">💸 Gastos</p>
              <p className={`text-xl font-bold mt-1 ${total > income && income > 0 ? 'text-danger' : 'text-gray-900 dark:text-gray-100'}`}>{fmtBRL(total)}</p>
            </div>
            <div className={`card ${income > 0 && total < income ? 'bg-success-muted border border-success/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <p className="text-xs text-gray-500 font-medium">💰 Economizado</p>
              <p className={`text-xl font-bold mt-1 ${income > 0 && total < income ? 'text-success' : 'text-gray-400'}`}>
                {income > 0 ? fmtBRL(Math.max(0, income - total)) : '—'}
              </p>
            </div>
            <div className="card bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-500 font-medium">📊 Taxa poupança</p>
              <p className={`text-xl font-bold mt-1 ${income > 0 && total < income ? 'text-success' : 'text-gray-400'}`}>
                {income > 0 ? `${Math.max(0, ((income - total) / income) * 100).toFixed(0)}%` : '—'}
              </p>
            </div>
          </div>

          {total === 0 && (
            <div className="card text-center py-10 space-y-2">
              <span className="text-4xl">📊</span>
              <p className="text-gray-500 font-medium">Nenhum gasto registrado</p>
              <p className="text-sm text-gray-400">Adicione seus gastos na aba <strong>Lançamentos</strong> para ver o resumo.</p>
            </div>
          )}

          {total > 0 && (
            <>
              {/* Gráfico de pizza em destaque */}
              <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Onde foi seu dinheiro</h2>
                <p className="text-xs text-gray-400 mb-3">{CATS.filter(c => byC[c.id] > 0).length} categorias · {fmtBRL(total)} total</p>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={CATS.filter(c => byC[c.id] > 0).map(c => ({
                        name: `${c.emoji} ${c.label}`,
                        value: byC[c.id],
                        pct: ((byC[c.id] / total) * 100).toFixed(1),
                      }))}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={2} dataKey="value"
                    >
                      {CATS.filter(c => byC[c.id] > 0).map((cat, i) => (
                        <Cell key={i} fill={PIE_COLORS[cat.id] ?? '#9CA3AF'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, _: string, entry: any) => [`${fmtBRL(v)} (${entry.payload.pct}%)`, entry.name]} />
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top gastos por categoria */}
              <div className="card space-y-3">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Por categoria</h2>
                {CATS.filter(c => byC[c.id] > 0)
                  .sort((a, b) => byC[b.id] - byC[a.id])
                  .map((cat, i) => {
                    const amt = byC[cat.id]
                    const pct = (amt / total) * 100
                    const budget = budgets[cat.id] ?? 0
                    const overBudget = budget > 0 && amt > budget
                    return (
                      <div key={cat.id} className="flex items-center gap-3">
                        <span className="text-lg w-6 text-center">{cat.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{cat.label}</span>
                            <div className="flex items-center gap-1.5">
                              {overBudget && <span className="text-[10px] text-danger font-bold bg-danger-muted px-1.5 py-0.5 rounded-full">⚠ meta</span>}
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{fmtBRL(amt)}</span>
                              <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${overBudget ? 'bg-danger' : cat.bar}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {budget > 0 && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Meta: {fmtBRL(budget)} · {overBudget ? `excedeu ${fmtBRL(amt - budget)}` : `sobram ${fmtBRL(budget - amt)}`}
                            </p>
                          )}
                        </div>
                        {i === 0 && <span className="text-xs bg-warning/20 text-warning font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">maior</span>}
                      </div>
                    )
                  })}
              </div>

              {/* Top 3 maiores despesas individuais */}
              <div className="card space-y-3">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Maiores despesas do mês</h2>
                {[...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5).map((e, i) => {
                  const cat = CAT_MAP[e.category]
                  return (
                    <div key={e.id} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">{i + 1}</span>
                      <span className="text-base">{cat?.emoji ?? '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{e.description}</p>
                        <p className="text-xs text-gray-400">{cat?.label ?? e.category} · {new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">{fmtBRL(e.amount)}</span>
                    </div>
                  )
                })}
              </div>

              {/* Regra 50/30/20 compacta */}
              {income > 0 && (
                <div className="card space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">📐 Regra 50 · 30 · 20</h2>
                    <span className="text-xs text-gray-400">vs. sua renda</span>
                  </div>
                  {[
                    { label: 'Necessidades', cats: ['moradia','alimentacao','transporte','saude'], meta: 50, color: 'bg-blue-400', emoji: '🏠' },
                    { label: 'Desejos',      cats: ['lazer','outros','educacao'],                  meta: 30, color: 'bg-purple-400', emoji: '🎮' },
                    { label: 'Investimentos',cats: ['investimento'],                               meta: 20, color: 'bg-primary', emoji: '💰' },
                  ].map(g => {
                    const gasto = g.cats.reduce((s, id) => s + (byC[id] ?? 0), 0)
                    const real  = income > 0 ? (gasto / income) * 100 : 0
                    const over  = real > g.meta
                    return (
                      <div key={g.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{g.emoji} {g.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${over ? 'text-danger' : 'text-gray-600 dark:text-gray-400'}`}>{real.toFixed(0)}%</span>
                            <span className="text-xs text-gray-400">/ {g.meta}%</span>
                            {over && <span className="text-[10px] text-danger">▲</span>}
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${over ? 'bg-danger' : g.color}`}
                            style={{ width: `${Math.min((real / g.meta) * 100, 100)}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{fmtBRL(gasto)} de {fmtBRL(income * g.meta / 100)} ideal</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ══════ TAB GASTOS ══════ */}
      {tab === 'gastos' && (
        <>
          {/* Seletor de mês */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <span className="font-semibold text-gray-800 capitalize">{monthLabel}</span>
            <button onClick={nextMonth} disabled={isNow} className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30">
              <ChevronRight size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Renda + total */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 font-medium mb-1">💼 Renda mensal</p>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">R$</span>
                <input type="number" value={income || ''} onChange={e => saveIncome(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full text-lg font-bold text-gray-900 bg-transparent outline-none" />
              </div>
              {income > 0 && total > 0 && (
                <p className="text-xs text-gray-400 mt-1">{((total/income)*100).toFixed(0)}% comprometido</p>
              )}
            </div>
            <div className={`card ${total > income && income > 0 ? 'bg-danger-muted border border-danger/20' : 'bg-primary-muted'}`}>
              <p className="text-xs text-gray-500 font-medium mb-1">
                <TrendingDown size={12} className="inline mr-1" />Total gasto
              </p>
              <p className={`text-lg font-bold ${total > income && income > 0 ? 'text-danger' : 'text-gray-900'}`}>
                {fmtBRL(total)}
              </p>
              {income > 0 && <p className="text-xs text-gray-400 mt-1">sobra {fmtBRL(Math.max(0, income-total))}</p>}
            </div>
          </div>

          {/* Dicas */}
          {tips.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb size={18} className="text-yellow-500" /> Dicas inteligentes
              </h2>
              {tips.map((tip, i) => {
                const icons = { success: <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />, warning: <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />, danger: <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />, info: <Info size={16} className="text-primary flex-shrink-0 mt-0.5" /> }
                const cls  = { success: 'bg-success-muted border-success/30', warning: 'bg-warning/10 border-warning/30', danger: 'bg-danger-muted border-danger/20', info: 'bg-primary-muted border-primary/20' }
                return (
                  <div key={i} className={`flex gap-3 p-3 rounded-xl border ${cls[tip.type]}`}>
                    {icons[tip.type]}
                    <p className="text-sm text-gray-800 leading-relaxed">{tip.text}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Breakdown por categoria */}
          {total > 0 && (
            <div className="space-y-2">
              <h2 className="font-bold text-gray-900">Por categoria</h2>

              {/* Gráfico de pizza */}
              <div className="card">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={CATS.filter(c => byC[c.id] > 0).map(c => ({ name: `${c.emoji} ${c.label}`, value: byC[c.id], color: c.bar }))}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={2} dataKey="value"
                    >
                      {CATS.filter(c => byC[c.id] > 0).map((cat, i) => (
                        <Cell key={i} className={cat.bar} fill={PIE_COLORS[cat.id] ?? '#9CA3AF'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtBRL(v)} />
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card space-y-3">
                {CATS.filter(c => byC[c.id] > 0).map(cat => {
                  const amt = byC[cat.id]
                  const pct = base > 0 ? (amt/base)*100 : 0
                  const budget = budgets[cat.id] ?? 0
                  const overBudget = budget > 0 && amt > budget
                  const over = cat.ideal > 0 && pct > cat.ideal
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{cat.emoji} {cat.label}</span>
                        <div className="flex items-center gap-2">
                          {overBudget && <span className="text-xs text-danger font-semibold">⚠ meta</span>}
                          {over && !overBudget && <span className="text-xs text-warning font-semibold">+{(pct-cat.ideal).toFixed(0)}%</span>}
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmtBRL(amt)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${overBudget ? 'bg-danger' : over ? 'bg-warning' : cat.bar}`}
                          style={{ width: `${budget > 0 ? Math.min((amt/budget)*100, 100) : Math.min(pct*2, 100)}%` }} />
                      </div>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className="text-xs text-gray-400">
                          {budget > 0 ? `${fmtBRL(amt)} / meta ${fmtBRL(budget)}` : `${pct.toFixed(0)}% do total`}
                        </span>
                        <input
                          type="number" min={0} step={50}
                          placeholder="meta R$"
                          value={budget || ''}
                          onChange={e => saveBudget(cat.id, Number(e.target.value))}
                          className="w-20 text-xs text-right text-gray-500 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Regra 50/30/20 */}
          {income > 0 && total > 0 && (
            <div className="card space-y-3">
              <p className="font-bold text-gray-900 text-sm">📐 Regra 50 · 30 · 20</p>
              {[
                { label: 'Necessidades',  cats: ['moradia','alimentacao','transporte','saude'], meta: 50, cor: 'bg-blue-400' },
                { label: 'Desejos',       cats: ['lazer','outros','educacao'],                  meta: 30, cor: 'bg-purple-400' },
                { label: 'Investimentos', cats: ['investimento'],                               meta: 20, cor: 'bg-primary' },
              ].map(g => {
                const gasto = g.cats.reduce((s, id) => s+(byC[id]??0), 0)
                const real  = (gasto/income)*100
                const over  = real > g.meta
                return (
                  <div key={g.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">{g.label}</span>
                      <span className={`text-xs font-bold ${over ? 'text-danger' : 'text-gray-600'}`}>
                        {real.toFixed(0)}% <span className="font-normal text-gray-400">/ meta {g.meta}%</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${over ? 'bg-danger' : g.cor}`}
                        style={{ width: `${Math.min((real/g.meta)*100, 100)}%` }} />
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-gray-400">50% necessidades · 30% desejos · 20% investimentos</p>
            </div>
          )}

          {/* Lista de gastos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Lançamentos {loading && <span className="text-xs text-gray-400 font-normal ml-1">carregando...</span>}</h2>
              <button onClick={() => setShowForm(v => !v)} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
                <Plus size={16} /> Adicionar
              </button>
            </div>

            {showForm && (
              <div className="card border-2 border-primary/20 space-y-3">
                <p className="text-sm font-bold text-primary">Novo lançamento</p>
                <div className="grid grid-cols-2 gap-2">
                  <select value={formCat} onChange={e => setFormCat(e.target.value)}
                    className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-primary">
                    {CATS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                  <input type="text" value={formDesc} onChange={e => setFormDesc(e.target.value)}
                    placeholder="Descrição (ex: Supermercado)"
                    className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-primary" />
                  <input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)}
                    placeholder="Valor (R$)"
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-primary" />
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-primary" />
                </div>
                <div className="flex gap-2">
                  <button onClick={addExpense} className="btn-primary flex-1 py-2 text-sm">Salvar</button>
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cancelar</button>
                </div>
              </div>
            )}

            {expenses.length === 0 && !showForm && !loading && (
              <div className="card text-center py-10 text-gray-400 space-y-2">
                <Wallet size={32} className="mx-auto opacity-40" />
                <p className="text-sm">Nenhum gasto registrado neste mês.</p>
              </div>
            )}

            {[...expenses].map(e => {
              const cat = CAT_MAP[e.category]
              return (
                <div key={e.id} className="card flex items-center gap-3 py-3">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${cat?.bg ?? 'bg-gray-50'}`}>
                    {cat?.emoji ?? '📦'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.description}</p>
                    <p className="text-xs text-gray-400">
                      {cat?.label} · {new Date(e.date+'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 flex-shrink-0">{fmtBRL(e.amount)}</p>
                  <button onClick={() => deleteExpense(e.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-danger hover:bg-danger-muted transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ══════ TAB CARTEIRAS MODELO ══════ */}
      {tab === 'carteiras' && (
        <div className="space-y-5">
          <div className="card bg-primary-muted border border-primary/20">
            <p className="text-sm font-semibold text-primary mb-1">📚 O que são Carteiras Modelo?</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              São alocações predefinidas que distribuem seu dinheiro entre diferentes tipos de ativos.
              Cada carteira equilibra <strong>risco × retorno</strong> de forma diferente — não existe a "melhor",
              mas sim a mais adequada para o seu <strong>perfil de investidor</strong> e <strong>prazo</strong>.
            </p>
          </div>

          {CARTEIRAS.map(c => (
            <div key={c.id} className={`card border-2 ${c.cor} space-y-4`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.emoji}</span>
                    <h3 className="font-bold text-gray-900">{c.nome}</h3>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${c.corBadge}`}>
                    {c.perfil}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">Retorno estimado</p>
                  <p className="text-sm font-bold text-gray-900">{c.retornoEstimado}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.risco}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">{c.desc}</p>

              {/* Alocação visual */}
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Alocação</p>
                {/* Barra proporcional */}
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
                  {c.ativos.map(a => (
                    <div key={a.nome} className={`${a.cor} transition-all`} style={{ width: `${a.pct}%` }} title={`${a.nome}: ${a.pct}%`} />
                  ))}
                </div>
                <div className="space-y-1.5">
                  {c.ativos.map(a => (
                    <div key={a.nome} className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${a.cor}`} />
                      <span className="text-sm font-semibold text-gray-900 w-8 flex-shrink-0">{a.pct}%</span>
                      <span className="text-sm text-gray-800 font-medium">{a.nome}</span>
                      <span className="text-xs text-gray-400 ml-auto text-right hidden sm:block">{a.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exemplo de R$ 1.000 */}
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-700 mb-1.5">💡 Com R$ 1.000/mês você alocaria:</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.ativos.map(a => (
                    <span key={a.nome} className={`text-xs px-2 py-1 rounded-lg font-medium text-white ${a.cor}`}>
                      {a.nome.split('(')[0].trim()}: {fmtBRL(a.pct * 10)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="card bg-gray-50 text-center space-y-1 py-6">
            <PieChart size={28} className="mx-auto text-gray-300" />
            <p className="text-sm font-medium text-gray-600">Quer simular quanto cada carteira rende?</p>
            <p className="text-xs text-gray-400">Acesse o <strong>Simulador</strong> no menu lateral</p>
          </div>
        </div>
      )}
    </div>
  )
}
