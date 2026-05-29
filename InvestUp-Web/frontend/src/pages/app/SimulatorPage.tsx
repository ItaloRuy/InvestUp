import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

// ─── Motor de cálculo (frontend — espelha o backend Java)
function futureValue(principal: number, monthly: number, annualRate: number, months: number): number {
  const r = Math.pow(1 + annualRate, 1/12) - 1
  if (r === 0) return principal + monthly * months
  return principal * Math.pow(1+r, months) + monthly * ((Math.pow(1+r,months)-1)/r)
}

function generatePoints(principal: number, monthly: number, annualRate: number, totalMonths: number) {
  const r = Math.pow(1 + annualRate, 1/12) - 1
  return Array.from({ length: totalMonths + 1 }, (_, m) => {
    const fv = m === 0
      ? principal
      : principal * Math.pow(1+r, m) + (r > 0 ? monthly * ((Math.pow(1+r,m)-1)/r) : monthly * m)
    const invested = principal + monthly * m
    return {
      month: m,
      year: (m/12).toFixed(1),
      carteira: Math.round(fv),
      investido: Math.round(invested),
      poupanca: Math.round(principal * Math.pow(1+Math.pow(1.042,1/12)-1,m) +
        (0.042>0 ? monthly*((Math.pow(1+Math.pow(1.042,1/12)-1,m)-1)/(Math.pow(1.042,1/12)-1)) : monthly*m)),
    }
  }).filter(p => p.month % 12 === 0)
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export default function SimulatorPage() {
  const [principal,  setPrincipal]  = useState(1000)
  const [monthly,    setMonthly]    = useState(300)
  const [annualRate, setAnnualRate] = useState(10.5)
  const [years,      setYears]      = useState(10)

  const months = years * 12
  const data = useMemo(
    () => generatePoints(principal, monthly, annualRate/100, months),
    [principal, monthly, annualRate, months]
  )

  const finalValue   = data[data.length - 1]?.carteira ?? 0
  const totalInvested = principal + monthly * months
  const earnings     = finalValue - totalInvested
  const poupancaFinal = data[data.length - 1]?.poupanca ?? 0

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🧮 Simulador de Carteira</h1>
        <p className="text-gray-500 text-sm mt-0.5">Veja quanto seu dinheiro pode crescer com aportes mensais</p>
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
          label="Rentabilidade anual" value={annualRate} min={4} max={20} step={0.5}
          format={(v) => `${v.toFixed(1)}% a.a.`} onChange={setAnnualRate}
        />
        <SliderField
          label="Período" value={years} min={1} max={40} step={1}
          format={(v) => `${v} ${v === 1 ? 'ano' : 'anos'}`} onChange={setYears}
        />
      </div>

      {/* ── Resultado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResultCard label="Valor final" value={formatBRL(finalValue)} color="text-primary" highlight />
        <ResultCard label="Total investido" value={formatBRL(totalInvested)} color="text-gray-700" />
        <ResultCard label="Juros gerados" value={formatBRL(earnings)} color="text-success" />
        <ResultCard label="vs. Poupança" value={`+${formatBRL(finalValue - poupancaFinal)}`} color="text-success" />
      </div>

      {/* ── Gráfico */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Crescimento ao longo do tempo</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tickFormatter={(v) => `${v}a`} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number, name: string) => [formatBRL(value), name]}
              labelFormatter={(l) => `Ano ${l}`}
            />
            <Legend />
            <Line type="monotone" dataKey="carteira"  name="Sua carteira" stroke="#1E3A5F" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="investido" name="Total investido" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="poupanca"  name="Poupança" stroke="#FF7B00" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Insight pedagógico */}
      <div className="card bg-success-muted border border-success/20">
        <p className="text-sm text-gray-700">
          💡 <span className="font-semibold">O que isso significa:</span>{' '}
          Você vai investir <strong>{formatBRL(totalInvested)}</strong> do seu bolso ao longo de {years} anos.
          Os juros vão gerar outros <strong>{formatBRL(earnings)}</strong> — {' '}
          <strong>{((earnings / totalInvested) * 100).toFixed(0)}%</strong> a mais do que você colocou.
          {earnings > poupancaFinal - totalInvested && (
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
