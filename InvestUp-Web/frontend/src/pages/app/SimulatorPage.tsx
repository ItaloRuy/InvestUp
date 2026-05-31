import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts'

// ─── Tipos e constantes compartilhados
type Tab = 'crescimento' | 'comparar' | 'meta' | 'dividendos'

const ASSET_CLASSES = [
  { key: 'fixo',          label: 'Renda Fixa',     emoji: '🏦', rate: 10.5, color: 'bg-blue-400',   textColor: 'text-blue-700',   bg: 'bg-blue-50'   },
  { key: 'variavel',      label: 'Renda Variável', emoji: '📈', rate: 14.0, color: 'bg-green-500',  textColor: 'text-green-700',  bg: 'bg-green-50'  },
  { key: 'cripto',        label: 'Cripto',         emoji: '₿',  rate: 25.0, color: 'bg-orange-400', textColor: 'text-orange-700', bg: 'bg-orange-50' },
  { key: 'fiis',          label: 'FIIs',           emoji: '🏢', rate: 11.0, color: 'bg-purple-400', textColor: 'text-purple-700', bg: 'bg-purple-50' },
  { key: 'internacional', label: 'Internacional',  emoji: '🌍', rate: 12.0, color: 'bg-cyan-400',   textColor: 'text-cyan-700',   bg: 'bg-cyan-50'   },
]

type Allocation = Record<string, number>

const PORTFOLIO_MODELS = [
  { id: 'conservador',  label: 'Conservador', emoji: '🛡️', desc: 'Segurança em primeiro lugar', allocation: { fixo: 80, variavel: 15, cripto: 0, fiis: 5, internacional: 0 } },
  { id: 'moderado',     label: 'Moderado',    emoji: '⚖️', desc: 'Equilíbrio risco/retorno',     allocation: { fixo: 50, variavel: 35, cripto: 5, fiis: 10, internacional: 0 } },
  { id: 'arrojado',     label: 'Arrojado',    emoji: '🚀', desc: 'Máximo potencial',             allocation: { fixo: 20, variavel: 55, cripto: 15, fiis: 10, internacional: 0 } },
  { id: 'personalizado',label: 'Personalizado',emoji: '✏️', desc: 'Monte sua carteira',          allocation: { fixo: 40, variavel: 30, cripto: 10, fiis: 15, internacional: 5 } },
]

function calcWeightedRate(allocation: Allocation): number {
  return ASSET_CLASSES.reduce((sum, a) => sum + ((allocation[a.key] ?? 0) / 100) * a.rate, 0)
}

function generatePoints(principal: number, monthly: number, annualRate: number, totalMonths: number) {
  const r = Math.pow(1 + annualRate, 1 / 12) - 1
  return Array.from({ length: totalMonths + 1 }, (_, m) => {
    const fv = m === 0
      ? principal
      : principal * Math.pow(1 + r, m) + (r > 0 ? monthly * ((Math.pow(1 + r, m) - 1) / r) : monthly * m)
    const invested = principal + monthly * m
    return {
      month: m,
      year: (m / 12).toFixed(1),
      carteira: Math.round(fv),
      investido: Math.round(invested),
      poupanca: Math.round(
        principal * Math.pow(1 + Math.pow(1.042, 1 / 12) - 1, m) +
        (0.042 > 0 ? monthly * ((Math.pow(1 + Math.pow(1.042, 1 / 12) - 1, m) - 1) / (Math.pow(1.042, 1 / 12) - 1)) : monthly * m)
      ),
    }
  }).filter(p => p.month % 12 === 0)
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

// ─── Sub-componentes reutilizáveis
function SliderField({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm font-bold text-primary">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
        aria-label={label} aria-valuenow={value} aria-valuemin={min} aria-valuemax={max}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  )
}

function ResultCard({ label, value, color, highlight }: {
  label: string; value: string; color: string; highlight?: boolean
}) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? 'bg-primary-muted border border-primary/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
    </div>
  )
}

function ModelSelector({ selected, onSelect, customAllocation, onCustomChange }: {
  selected: string; onSelect: (id: string) => void
  customAllocation: Allocation; onCustomChange: (key: string, v: number) => void
}) {
  const activeAllocation = selected === 'personalizado'
    ? customAllocation
    : PORTFOLIO_MODELS.find(m => m.id === selected)!.allocation
  const annualRate = calcWeightedRate(activeAllocation)
  const total = Object.values(activeAllocation).reduce((a, b) => a + b, 0)
  const valid = Math.abs(total - 100) < 0.5

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100">Distribuição da carteira</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {PORTFOLIO_MODELS.map(m => (
          <button key={m.id} onClick={() => onSelect(m.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
              selected === m.id ? 'border-primary bg-primary-muted' : 'border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-200'
            }`}>
            <span className="text-2xl">{m.emoji}</span>
            <span className={`text-xs font-bold ${selected === m.id ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</span>
            <span className="text-[10px] text-gray-400">{m.desc}</span>
          </button>
        ))}
      </div>
      <div className="space-y-3 pt-1">
        {ASSET_CLASSES.map(asset => {
          const pct = activeAllocation[asset.key] ?? 0
          return (
            <div key={asset.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{asset.emoji}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{asset.label}</span>
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${asset.bg} ${asset.textColor}`}>{asset.rate}% a.a.</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{pct}%</span>
              </div>
              {selected === 'personalizado' ? (
                <input type="range" min={0} max={100} step={5} value={pct}
                  onChange={e => onCustomChange(asset.key, Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
                  aria-label={asset.label} />
              ) : (
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${asset.color}`} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          )
        })}
        <div className={`flex justify-between items-center pt-1 border-t text-sm font-semibold ${valid ? 'text-success' : 'text-red-500'}`}>
          <span>Total da carteira</span>
          <span>{total}% {valid ? '✓' : '⚠ deve ser 100%'}</span>
        </div>
        <div className="flex justify-between items-center bg-primary-muted rounded-xl px-4 py-2.5">
          <div>
            <p className="text-sm font-medium text-gray-700">Taxa resultante (ponderada)</p>
            <p className="text-[11px] text-gray-400 mt-0.5">média das classes pelo peso</p>
          </div>
          <span className="text-xl font-bold text-primary">{annualRate.toFixed(2)}% a.a.</span>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// ABA 1 — Crescimento
// ══════════════════════════════════════════════
function TabCrescimento() {
  const [principal,        setPrincipal]        = useState(1000)
  const [monthly,          setMonthly]          = useState(300)
  const [years,            setYears]            = useState(10)
  const [selectedModel,    setSelectedModel]    = useState('moderado')
  const [customAllocation, setCustomAllocation] = useState<Allocation>({ fixo: 40, variavel: 30, cripto: 10, fiis: 15, internacional: 5 })

  const activeAllocation = selectedModel === 'personalizado' ? customAllocation : PORTFOLIO_MODELS.find(m => m.id === selectedModel)!.allocation
  const annualRate = calcWeightedRate(activeAllocation)
  const months = years * 12
  const data = useMemo(() => generatePoints(principal, monthly, annualRate / 100, months), [principal, monthly, annualRate, months])

  const finalValue    = data[data.length - 1]?.carteira ?? 0
  const totalInvested = principal + monthly * months
  const earnings      = finalValue - totalInvested
  const poupancaFinal = data[data.length - 1]?.poupanca ?? 0

  return (
    <div className="space-y-6">
      <ModelSelector selected={selectedModel} onSelect={setSelectedModel}
        customAllocation={customAllocation} onCustomChange={(k, v) => setCustomAllocation(p => ({ ...p, [k]: v }))} />
      <div className="card space-y-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Configure sua simulação</h2>
        <SliderField label="Valor inicial" value={principal} min={0} max={50000} step={500} format={formatBRL} onChange={setPrincipal} />
        <SliderField label="Aporte mensal" value={monthly} min={50} max={5000} step={50} format={formatBRL} onChange={setMonthly} />
        <SliderField label="Período" value={years} min={1} max={40} step={1} format={v => `${v} ${v === 1 ? 'ano' : 'anos'}`} onChange={setYears} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResultCard label="Valor final"     value={formatBRL(finalValue)}                       color="text-primary" highlight />
        <ResultCard label="Total investido" value={formatBRL(totalInvested)}                    color="text-gray-700 dark:text-gray-300" />
        <ResultCard label="Juros gerados"   value={formatBRL(earnings)}                         color="text-success" />
        <ResultCard label="vs. Poupança"    value={`+${formatBRL(finalValue - poupancaFinal)}`} color="text-success" />
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Crescimento ao longo do tempo</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tickFormatter={v => `${v}a`} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number, name: string) => [formatBRL(value), name]} labelFormatter={l => `Ano ${l}`} />
            <Legend />
            <Line type="monotone" dataKey="carteira"  name="Sua carteira"   stroke="#1E3A5F" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="investido" name="Total investido" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="poupanca"  name="Poupança"       stroke="#FF7B00" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card bg-success-muted border border-success/20">
        <p className="text-sm text-gray-700">
          💡 <span className="font-semibold">O que isso significa:</span>{' '}
          Você vai investir <strong>{formatBRL(totalInvested)}</strong> do seu bolso ao longo de {years} anos.
          Os juros vão gerar outros <strong>{formatBRL(earnings)}</strong> —{' '}
          <strong>{((earnings / totalInvested) * 100).toFixed(0)}%</strong> a mais do que você colocou.
          {finalValue > poupancaFinal && <> Isso é <strong>{formatBRL(finalValue - poupancaFinal)}</strong> a mais do que na poupança.</>}
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// ABA 2 — Comparar Cenários
// ══════════════════════════════════════════════
function TabComparar() {
  const [monthly1, setMonthly1] = useState(300)
  const [years1,   setYears1]   = useState(10)
  const [model1,   setModel1]   = useState('moderado')
  const [monthly2, setMonthly2] = useState(500)
  const [years2,   setYears2]   = useState(10)
  const [model2,   setModel2]   = useState('arrojado')

  const rate1 = calcWeightedRate(PORTFOLIO_MODELS.find(m => m.id === model1)!.allocation) / 100
  const rate2 = calcWeightedRate(PORTFOLIO_MODELS.find(m => m.id === model2)!.allocation) / 100

  const data = useMemo(() => {
    const maxYears = Math.max(years1, years2)
    return Array.from({ length: maxYears + 1 }, (_, y) => {
      const m1 = y * 12
      const m2 = y * 12
      const r1 = Math.pow(1 + rate1, 1 / 12) - 1
      const r2 = Math.pow(1 + rate2, 1 / 12) - 1
      const fv1 = y <= years1 ? (r1 > 0 ? monthly1 * ((Math.pow(1 + r1, m1) - 1) / r1) : monthly1 * m1) : null
      const fv2 = y <= years2 ? (r2 > 0 ? monthly2 * ((Math.pow(1 + r2, m2) - 1) / r2) : monthly2 * m2) : null
      return { year: y, cenario1: fv1 !== null ? Math.round(fv1) : undefined, cenario2: fv2 !== null ? Math.round(fv2) : undefined }
    })
  }, [monthly1, years1, rate1, monthly2, years2, rate2])

  const model1data = PORTFOLIO_MODELS.find(m => m.id === model1)!
  const model2data = PORTFOLIO_MODELS.find(m => m.id === model2)!
  const final1 = data[years1]?.cenario1 ?? 0
  const final2 = data[years2]?.cenario2 ?? 0
  const invested1 = monthly1 * years1 * 12
  const invested2 = monthly2 * years2 * 12

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cenário 1 */}
        <div className="card border-2 border-primary/30 space-y-4">
          <p className="text-sm font-bold text-primary">Cenário A</p>
          <div className="flex gap-2">
            {PORTFOLIO_MODELS.slice(0, 3).map(m => (
              <button key={m.id} onClick={() => setModel1(m.id)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${model1 === m.id ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
          <SliderField label="Aporte mensal" value={monthly1} min={50} max={5000} step={50} format={formatBRL} onChange={setMonthly1} />
          <SliderField label="Período" value={years1} min={1} max={40} step={1} format={v => `${v}a`} onChange={setYears1} />
          <div className="bg-primary-muted rounded-xl p-3 space-y-1">
            <p className="text-xs text-gray-500">Taxa: <strong>{(rate1 * 100).toFixed(2)}% a.a.</strong> ({model1data.label})</p>
            <p className="text-lg font-bold text-primary">{formatBRL(final1)}</p>
            <p className="text-xs text-gray-400">Juros: {formatBRL(final1 - invested1)}</p>
          </div>
        </div>
        {/* Cenário 2 */}
        <div className="card border-2 border-orange-300 space-y-4">
          <p className="text-sm font-bold text-orange-600">Cenário B</p>
          <div className="flex gap-2">
            {PORTFOLIO_MODELS.slice(0, 3).map(m => (
              <button key={m.id} onClick={() => setModel2(m.id)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${model2 === m.id ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
          <SliderField label="Aporte mensal" value={monthly2} min={50} max={5000} step={50} format={formatBRL} onChange={setMonthly2} />
          <SliderField label="Período" value={years2} min={1} max={40} step={1} format={v => `${v}a`} onChange={setYears2} />
          <div className="bg-orange-50 rounded-xl p-3 space-y-1">
            <p className="text-xs text-gray-500">Taxa: <strong>{(rate2 * 100).toFixed(2)}% a.a.</strong> ({model2data.label})</p>
            <p className="text-lg font-bold text-orange-600">{formatBRL(final2)}</p>
            <p className="text-xs text-gray-400">Juros: {formatBRL(final2 - invested2)}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Comparação de crescimento</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tickFormatter={v => `${v}a`} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number, name: string) => [formatBRL(value), name]} labelFormatter={l => `Ano ${l}`} />
            <Legend />
            <Line type="monotone" dataKey="cenario1" name={`Cenário A (${model1data.label})`} stroke="#1E3A5F" strokeWidth={2.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="cenario2" name={`Cenário B (${model2data.label})`} stroke="#f97316" strokeWidth={2.5} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {final1 > 0 && final2 > 0 && (
        <div className={`card border ${final2 > final1 ? 'bg-orange-50 border-orange-200' : 'bg-primary-muted border-primary/20'}`}>
          <p className="text-sm text-gray-700">
            {final2 > final1
              ? <>📊 Cenário B supera o A em <strong>{formatBRL(final2 - final1)}</strong> ao final do período.</>
              : <>📊 Cenário A supera o B em <strong>{formatBRL(final1 - final2)}</strong> ao final do período.</>}
          </p>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════
// ABA 3 — Meta de Valor
// ══════════════════════════════════════════════
function TabMeta() {
  const [targetValue, setTargetValue] = useState(500000)
  const [years,       setYears]       = useState(20)
  const [model,       setModel]       = useState('moderado')
  const [principal,   setPrincipal]   = useState(0)

  const annualRate = calcWeightedRate(PORTFOLIO_MODELS.find(m => m.id === model)!.allocation) / 100
  const r = Math.pow(1 + annualRate, 1 / 12) - 1
  const n = years * 12

  // PMT = (FV - PV*(1+r)^n) * r / ((1+r)^n - 1)
  const pvFuture = principal * Math.pow(1 + r, n)
  const remaining = targetValue - pvFuture
  const pmt = r > 0 && remaining > 0 ? remaining * r / (Math.pow(1 + r, n) - 1) : (remaining > 0 ? remaining / n : 0)
  const pmtRounded = Math.max(0, Math.ceil(pmt))

  const data = useMemo(() => generatePoints(principal, pmtRounded, annualRate, n), [principal, pmtRounded, annualRate, n])
  const finalValue = data[data.length - 1]?.carteira ?? 0

  return (
    <div className="space-y-6">
      <div className="card space-y-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Quanto preciso aportar?</h2>
        <p className="text-sm text-gray-500">Informe sua meta e o prazo — calculamos o aporte mensal necessário.</p>

        <SliderField label="Meta de patrimônio" value={targetValue} min={10000} max={5000000} step={10000} format={formatBRL} onChange={setTargetValue} />
        <SliderField label="Prazo" value={years} min={1} max={40} step={1} format={v => `${v} ${v === 1 ? 'ano' : 'anos'}`} onChange={setYears} />
        <SliderField label="Capital inicial (opcional)" value={principal} min={0} max={100000} step={1000} format={formatBRL} onChange={setPrincipal} />

        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">Perfil de carteira</p>
          <div className="flex gap-2 flex-wrap">
            {PORTFOLIO_MODELS.slice(0, 3).map(m => (
              <button key={m.id} onClick={() => setModel(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${model === m.id ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {m.emoji} {m.label} ({calcWeightedRate(m.allocation).toFixed(1)}% a.a.)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className="card bg-primary-muted border-2 border-primary/20 text-center space-y-2">
        <p className="text-sm text-gray-600 font-medium">Aporte mensal necessário</p>
        <p className="text-4xl font-bold text-primary">{formatBRL(pmtRounded)}</p>
        <p className="text-xs text-gray-500">por mês durante {years} anos a {(annualRate * 100).toFixed(2)}% a.a.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ResultCard label="Meta"           value={formatBRL(targetValue)}                      color="text-primary" />
        <ResultCard label="Total investido" value={formatBRL(pmtRounded * n + principal)}       color="text-gray-700 dark:text-gray-300" />
        <ResultCard label="Juros gerados"  value={formatBRL(Math.max(0, finalValue - (pmtRounded * n + principal)))} color="text-success" />
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Projeção até a meta</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tickFormatter={v => `${v}a`} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number, name: string) => [formatBRL(value), name]} labelFormatter={l => `Ano ${l}`} />
            <Legend />
            <Line type="monotone" dataKey="carteira"  name="Patrimônio"     stroke="#1E3A5F" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="investido" name="Total investido" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// ABA 4 — Renda Passiva (Dividendos)
// ══════════════════════════════════════════════
function TabDividendos() {
  const [cotas,       setCotas]       = useState(100)
  const [precoCotas,  setPrecoCotas]  = useState(100)
  const [dyMensal,    setDyMensal]    = useState(1.0)
  const [years,       setYears]       = useState(10)
  const [reinvestir,  setReinvestir]  = useState(true)

  const dividendoMensal   = cotas * precoCotas * (dyMensal / 100)
  const numMagico         = dyMensal > 0 ? Math.ceil(precoCotas / (precoCotas * dyMensal / 100)) : 0

  const data = useMemo(() => {
    const months = years * 12
    let cotasAtual = cotas
    return Array.from({ length: months + 1 }, (_, m) => {
      const divMes = cotasAtual * precoCotas * (dyMensal / 100)
      if (reinvestir && m > 0 && precoCotas > 0) {
        cotasAtual += divMes / precoCotas
      }
      return {
        month: m,
        year: (m / 12).toFixed(1),
        cotas: Math.round(cotasAtual),
        dividendo: Math.round(divMes),
      }
    }).filter(p => p.month % 12 === 0)
  }, [cotas, precoCotas, dyMensal, years, reinvestir])

  const finalCotas   = data[data.length - 1]?.cotas ?? cotas
  const finalDivMes  = data[data.length - 1]?.dividendo ?? 0

  return (
    <div className="space-y-6">
      <div className="card space-y-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Simulação de Renda Passiva</h2>
        <SliderField label="Cotas atuais" value={cotas} min={10} max={10000} step={10} format={v => `${v} cotas`} onChange={setCotas} />
        <SliderField label="Preço da cota" value={precoCotas} min={5} max={500} step={5} format={formatBRL} onChange={setPrecoCotas} />
        <SliderField label="Dividend Yield mensal" value={dyMensal} min={0.3} max={3} step={0.1} format={v => `${v.toFixed(1)}% a.m.`} onChange={setDyMensal} />
        <SliderField label="Período" value={years} min={1} max={30} step={1} format={v => `${v} ${v === 1 ? 'ano' : 'anos'}`} onChange={setYears} />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reinvestir dividendos</span>
          <button onClick={() => setReinvestir(v => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${reinvestir ? 'bg-primary' : 'bg-gray-200'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${reinvestir ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Número mágico */}
      <div className="card border border-primary/20 bg-primary-muted space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">🔢 Número mágico</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{numMagico} cotas</p>
        <p className="text-xs text-gray-500">
          Com {numMagico} cotas a {dyMensal.toFixed(1)}% a.m., o dividendo paga <strong>1 nova cota por mês</strong> automaticamente.
        </p>
        <p className="text-xs text-gray-400">
          Você tem {cotas} cotas → {cotas >= numMagico ? `✅ já superou o número mágico!` : `faltam ${numMagico - cotas} cotas`}
        </p>
      </div>

      {/* Cards de resultado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResultCard label="Dividendo atual/mês" value={formatBRL(dividendoMensal)} color="text-success" highlight />
        <ResultCard label="Cotas após período"  value={`${finalCotas.toLocaleString('pt-BR')}`} color="text-primary" />
        <ResultCard label="Renda passiva final" value={formatBRL(finalDivMes)} color="text-success" />
        <ResultCard label="Crescimento renda"  value={`+${(((finalDivMes / dividendoMensal) - 1) * 100).toFixed(0)}%`} color="text-primary" />
      </div>

      {/* Gráfico */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Renda passiva mensal ao longo do tempo {reinvestir ? '(com reinvestimento)' : '(sem reinvestimento)'}
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tickFormatter={v => `${v}a`} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => [formatBRL(value), 'Dividendo/mês']} labelFormatter={l => `Ano ${l}`} />
            <Bar dataKey="dividendo" name="Dividendo/mês" fill="#00A86B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card bg-success-muted border border-success/20">
        <p className="text-sm text-gray-700">
          💡 {reinvestir
            ? <>Reinvestindo os dividendos, sua renda passiva passa de <strong>{formatBRL(dividendoMensal)}</strong> para <strong>{formatBRL(finalDivMes)}</strong>/mês em {years} anos — um crescimento de <strong>{(((finalDivMes / dividendoMensal) - 1) * 100).toFixed(0)}%</strong>.</>
            : <>Sem reinvestimento, sua renda de <strong>{formatBRL(dividendoMensal)}</strong>/mês permanece estável. Ative o reinvestimento para ver a diferença do efeito bola de neve.</>}
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════
export default function SimulatorPage() {
  const [tab, setTab] = useState<Tab>('crescimento')

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'crescimento', label: 'Crescimento',    emoji: '📈' },
    { id: 'comparar',    label: 'Comparar',        emoji: '⚖️' },
    { id: 'meta',        label: 'Meta',            emoji: '🎯' },
    { id: 'dividendos',  label: 'Renda Passiva',   emoji: '💰' },
  ]

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🧮 Simulador de Carteira</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Veja quanto seu dinheiro pode crescer com aportes mensais</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t.id ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}>
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'crescimento' && <TabCrescimento />}
      {tab === 'comparar'    && <TabComparar />}
      {tab === 'meta'        && <TabMeta />}
      {tab === 'dividendos'  && <TabDividendos />}
    </div>
  )
}
