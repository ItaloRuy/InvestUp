import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

// ─── Classes de ativos com taxa esperada
const ASSET_CLASSES = [
  { key: 'fixo',          label: 'Renda Fixa',     emoji: '🏦', rate: 10.5, color: 'bg-blue-400',   textColor: 'text-blue-700',   bg: 'bg-blue-50'   },
  { key: 'variavel',      label: 'Renda Variável', emoji: '📈', rate: 14.0, color: 'bg-green-500',  textColor: 'text-green-700',  bg: 'bg-green-50'  },
  { key: 'cripto',        label: 'Cripto',         emoji: '₿',  rate: 25.0, color: 'bg-orange-400', textColor: 'text-orange-700', bg: 'bg-orange-50' },
  { key: 'fiis',          label: 'FIIs',           emoji: '🏢', rate: 11.0, color: 'bg-purple-400', textColor: 'text-purple-700', bg: 'bg-purple-50' },
  { key: 'internacional', label: 'Internacional',  emoji: '🌍', rate: 12.0, color: 'bg-cyan-400',   textColor: 'text-cyan-700',   bg: 'bg-cyan-50'   },
]

type Allocation = Record<string, number>

const PORTFOLIO_MODELS = [
  {
    id: 'conservador', label: 'Conservador', emoji: '🛡️', desc: 'Segurança em primeiro lugar',
    allocation: { fixo: 80, variavel: 15, cripto: 0, fiis: 5, internacional: 0 },
  },
  {
    id: 'moderado', label: 'Moderado', emoji: '⚖️', desc: 'Equilíbrio risco/retorno',
    allocation: { fixo: 50, variavel: 35, cripto: 5, fiis: 10, internacional: 0 },
  },
  {
    id: 'arrojado', label: 'Arrojado', emoji: '🚀', desc: 'Máximo potencial',
    allocation: { fixo: 20, variavel: 55, cripto: 15, fiis: 10, internacional: 0 },
  },
  {
    id: 'personalizado', label: 'Personalizado', emoji: '✏️', desc: 'Monte sua carteira',
    allocation: { fixo: 40, variavel: 30, cripto: 10, fiis: 15, internacional: 5 },
  },
]

function calcWeightedRate(allocation: Allocation): number {
  return ASSET_CLASSES.reduce((sum, a) => sum + ((allocation[a.key] ?? 0) / 100) * a.rate, 0)
}

// ─── Motor de cálculo
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
      carteira:  Math.round(fv),
      investido: Math.round(invested),
      poupanca:  Math.round(
        principal * Math.pow(1 + Math.pow(1.042, 1 / 12) - 1, m) +
        (0.042 > 0
          ? monthly * ((Math.pow(1 + Math.pow(1.042, 1 / 12) - 1, m) - 1) / (Math.pow(1.042, 1 / 12) - 1))
          : monthly * m)
      ),
    }
  }).filter(p => p.month % 12 === 0)
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export default function SimulatorPage() {
  const [principal,        setPrincipal]        = useState(1000)
  const [monthly,          setMonthly]          = useState(300)
  const [years,            setYears]            = useState(10)
  const [selectedModel,    setSelectedModel]    = useState('moderado')
  const [customAllocation, setCustomAllocation] = useState<Allocation>(
    { fixo: 40, variavel: 30, cripto: 10, fiis: 15, internacional: 5 }
  )

  const activeAllocation = selectedModel === 'personalizado'
    ? customAllocation
    : PORTFOLIO_MODELS.find(m => m.id === selectedModel)!.allocation

  const annualRate       = calcWeightedRate(activeAllocation)
  const allocationTotal  = Object.values(activeAllocation).reduce((a, b) => a + b, 0)
  const isValidAllocation = Math.abs(allocationTotal - 100) < 0.5

  const months = years * 12
  const data = useMemo(
    () => generatePoints(principal, monthly, annualRate / 100, months),
    [principal, monthly, annualRate, months]
  )

  const finalValue    = data[data.length - 1]?.carteira ?? 0
  const totalInvested = principal + monthly * months
  const earnings      = finalValue - totalInvested
  const poupancaFinal = data[data.length - 1]?.poupanca ?? 0

  function handleCustomSlider(key: string, value: number) {
    setCustomAllocation(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🧮 Simulador de Carteira</h1>
        <p className="text-gray-500 text-sm mt-0.5">Veja quanto seu dinheiro pode crescer com aportes mensais</p>
      </div>

      {/* ── Modelos de carteira */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Distribuição da carteira</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PORTFOLIO_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                selectedModel === model.id
                  ? 'border-primary bg-primary-muted'
                  : 'border-gray-100 bg-gray-50 hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">{model.emoji}</span>
              <span className={`text-xs font-bold ${selectedModel === model.id ? 'text-primary' : 'text-gray-700'}`}>
                {model.label}
              </span>
              <span className="text-[10px] text-gray-400">{model.desc}</span>
            </button>
          ))}
        </div>

        {/* ── Barras de alocação */}
        <div className="space-y-3 pt-1">
          {ASSET_CLASSES.map((asset) => {
            const pct = activeAllocation[asset.key] ?? 0
            return (
              <div key={asset.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{asset.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{asset.label}</span>
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${asset.bg} ${asset.textColor}`}>
                      {asset.rate}% a.a.
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{pct}%</span>
                </div>

                {selectedModel === 'personalizado' ? (
                  <input
                    type="range" min={0} max={100} step={5} value={pct}
                    onChange={(e) => handleCustomSlider(asset.key, Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
                    aria-label={asset.label}
                  />
                ) : (
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${asset.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}

          {/* Total */}
          <div className={`flex justify-between items-center pt-2 border-t text-sm font-semibold ${
            isValidAllocation ? 'text-success' : 'text-red-500'
          }`}>
            <span>Total da carteira</span>
            <span>{allocationTotal}% {isValidAllocation ? '✓' : '⚠ precisa somar 100%'}</span>
          </div>

          {/* Taxa resultante */}
          <div className="flex justify-between items-center bg-primary-muted rounded-xl px-4 py-3">
            <div>
              <p className="text-xs text-gray-500 font-medium">Taxa resultante (ponderada)</p>
              <p className="text-[11px] text-gray-400 mt-0.5">média das classes pelo peso da carteira</p>
            </div>
            <span className="text-xl font-bold text-primary">{annualRate.toFixed(2)}% a.a.</span>
          </div>
        </div>
      </div>

      {/* ── Controles */}
      <div className="card space-y-5">
        <h2 className="font-semibold text-gray-900">Configure sua simulação</h2>
        <SliderField
          label="Valor inicial" value={principal} min={0} max={50000} step={500}
          format={formatBRL} onChange={setPrincipal}
        />
        <SliderField
          label="Aporte mensal" value={monthly} min={50} max={5000} step={50}
          format={formatBRL} onChange={setMonthly}
        />
        <SliderField
          label="Período" value={years} min={1} max={40} step={1}
          format={(v) => `${v} ${v === 1 ? 'ano' : 'anos'}`} onChange={setYears}
        />
      </div>

      {/* ── Resultados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResultCard label="Valor final"     value={formatBRL(finalValue)}                    color="text-primary" highlight />
        <ResultCard label="Total investido" value={formatBRL(totalInvested)}                 color="text-gray-700" />
        <ResultCard label="Juros gerados"   value={formatBRL(earnings)}                      color="text-success" />
        <ResultCard label="vs. Poupança"    value={`+${formatBRL(finalValue - poupancaFinal)}`} color="text-success" />
      </div>

      {/* ── Gráfico */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Crescimento ao longo do tempo</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tickFormatter={(v) => `${v}a`} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number, name: string) => [formatBRL(value), name]}
              labelFormatter={(l) => `Ano ${l}`}
            />
            <Legend />
            <Line type="monotone" dataKey="carteira"  name="Sua carteira"   stroke="#1E3A5F" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="investido" name="Total investido" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="poupanca"  name="Poupança"       stroke="#FF7B00" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Insight pedagógico */}
      <div className="card bg-success-muted border border-success/20">
        <p className="text-sm text-gray-700">
          💡 <span className="font-semibold">O que isso significa:</span>{' '}
          Você vai investir <strong>{formatBRL(totalInvested)}</strong> do seu bolso ao longo de {years} anos.
          Os juros vão gerar outros <strong>{formatBRL(earnings)}</strong> —{' '}
          <strong>{((earnings / totalInvested) * 100).toFixed(0)}%</strong> a mais do que você colocou.
          {finalValue > poupancaFinal && (
            <> Isso é <strong>{formatBRL(finalValue - poupancaFinal)}</strong> a mais do que você teria na poupança.</>
          )}
        </p>
      </div>
    </div>
  )
}

function SliderField({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-primary">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
        aria-label={label}
        aria-valuenow={value} aria-valuemin={min} aria-valuemax={max}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

function ResultCard({ label, value, color, highlight }: {
  label: string; value: string; color: string; highlight?: boolean
}) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? 'bg-primary-muted border border-primary/20' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
    </div>
  )
}
