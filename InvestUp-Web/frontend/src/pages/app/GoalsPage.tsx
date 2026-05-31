import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface Goal {
  id: number
  title: string
  emoji: string
  targetAmount: number
  currentAmount: number
  deadline: string
  createdAt: string
}

const GOAL_EMOJIS = ['🏠', '🚗', '✈️', '📱', '🎓', '💍', '🏖️', '💰', '🐶', '🎯', '🏋️', '🎸']

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

function monthsUntil(deadline: string): number {
  const now  = new Date()
  const end  = new Date(deadline)
  return Math.max(0, Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.5)))
}

function monthlyNeeded(target: number, current: number, deadline: string): number {
  const months = monthsUntil(deadline)
  if (months <= 0) return 0
  const remaining = target - current
  return remaining <= 0 ? 0 : Math.ceil(remaining / months)
}

function GoalCard({ goal, onDelete, onUpdate }: {
  goal: Goal
  onDelete: (id: number) => void
  onUpdate: (id: number, current: number) => void
}) {
  const pct     = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
  const months  = monthsUntil(goal.deadline)
  const monthly = monthlyNeeded(goal.targetAmount, goal.currentAmount, goal.deadline)
  const done    = goal.currentAmount >= goal.targetAmount
  const [editing, setEditing] = useState(false)
  const [value,   setValue]   = useState(String(goal.currentAmount))

  const saveAporte = async () => {
    const v = parseFloat(value.replace(',', '.'))
    if (isNaN(v) || v < 0) return
    await onUpdate(goal.id, v)
    setEditing(false)
  }

  return (
    <div className={`card space-y-4 ${done ? 'border-2 border-success' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{goal.emoji}</span>
          <div>
            <p className="font-bold text-gray-900 dark:text-gray-100">{goal.title}</p>
            <p className="text-xs text-gray-400">
              Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              {months > 0 && ` · ${months} meses restantes`}
            </p>
          </div>
        </div>
        <button onClick={() => onDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-danger transition-colors">
          <Trash2 size={15} />
        </button>
      </div>

      {/* Barra de progresso */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatBRL(goal.currentAmount)}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatBRL(goal.targetAmount)}</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-success' : pct > 75 ? 'bg-primary' : pct > 40 ? 'bg-blue-400' : 'bg-gray-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{pct.toFixed(0)}% concluído</span>
          {done && <span className="text-xs text-success font-bold">✅ Meta atingida!</span>}
        </div>
      </div>

      {/* Cards informativos */}
      {!done && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary-muted rounded-xl p-3">
            <p className="text-xs text-gray-500 font-medium">Falta guardar</p>
            <p className="text-base font-bold text-primary">{formatBRL(Math.max(0, goal.targetAmount - goal.currentAmount))}</p>
          </div>
          <div className={`rounded-xl p-3 ${months <= 3 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <p className="text-xs text-gray-500 font-medium">Aporte/mês necessário</p>
            <p className={`text-base font-bold ${months <= 3 ? 'text-orange-600' : 'text-gray-900 dark:text-gray-100'}`}>
              {months > 0 ? formatBRL(monthly) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Atualizar aporte */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
        {editing ? (
          <>
            <span className="text-sm text-gray-500 font-medium">R$</span>
            <input type="number" value={value} onChange={e => setValue(e.target.value)}
              className="flex-1 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
              autoFocus onKeyDown={e => e.key === 'Enter' && saveAporte()} />
            <button onClick={saveAporte} className="p-1.5 rounded-lg bg-success text-white hover:bg-success-light transition-colors"><Check size={14} /></button>
            <button onClick={() => { setEditing(false); setValue(String(goal.currentAmount)) }} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors"><X size={14} /></button>
          </>
        ) : (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <Pencil size={12} /> Atualizar valor guardado
          </button>
        )}
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const [goals,   setGoals]   = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [formTitle,   setFormTitle]   = useState('')
  const [formEmoji,   setFormEmoji]   = useState('🎯')
  const [formTarget,  setFormTarget]  = useState('')
  const [formCurrent, setFormCurrent] = useState('')
  const [formDate,    setFormDate]    = useState('')
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    api.get<Goal[]>('/user/goals')
      .then(({ data }) => setGoals(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const addGoal = async () => {
    const target  = parseFloat(formTarget.replace(',', '.'))
    const current = parseFloat(formCurrent.replace(',', '.') || '0')
    if (!formTitle.trim() || isNaN(target) || target <= 0 || !formDate) {
      toast.error('Preencha nome, valor e prazo')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.post<Goal>('/user/goals', {
        title: formTitle.trim(), emoji: formEmoji,
        target_amount: target, current_amount: current, deadline: formDate,
      })
      setGoals(p => [...p, data])
      setShowForm(false)
      setFormTitle(''); setFormTarget(''); setFormCurrent(''); setFormDate(''); setFormEmoji('🎯')
      toast.success('Meta criada!')
    } catch { toast.error('Erro ao criar meta') }
    finally { setSaving(false) }
  }

  const deleteGoal = async (id: number) => {
    try {
      await api.delete(`/user/goals/${id}`)
      setGoals(p => p.filter(g => g.id !== id))
      toast.success('Meta removida')
    } catch { toast.error('Erro ao remover meta') }
  }

  const updateGoal = async (id: number, current: number) => {
    try {
      const { data } = await api.patch<Goal>(`/user/goals/${id}`, { current_amount: current })
      setGoals(p => p.map(g => g.id === id ? data : g))
      toast.success('Progresso atualizado!')
    } catch { toast.error('Erro ao atualizar') }
  }

  const totalGoals    = goals.length
  const doneGoals     = goals.filter(g => g.currentAmount >= g.targetAmount).length
  const totalTarget   = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalCurrent  = goals.reduce((s, g) => s + g.currentAmount, 0)

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🎯 Metas Financeiras</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Planeje e acompanhe seus objetivos</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
          <Plus size={16} /> Nova meta
        </button>
      </div>

      {/* Resumo */}
      {totalGoals > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center py-3">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalGoals}</p>
            <p className="text-xs text-gray-500">metas</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xl font-bold text-success">{doneGoals}</p>
            <p className="text-xs text-gray-500">concluídas</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-xl font-bold text-primary">{totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(0) : 0}%</p>
            <p className="text-xs text-gray-500">progresso geral</p>
          </div>
        </div>
      )}

      {/* Formulário de nova meta */}
      {showForm && (
        <div className="card border-2 border-primary/20 space-y-4">
          <p className="text-sm font-bold text-primary">Nova meta</p>

          {/* Escolha de emoji */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">Ícone</p>
            <div className="flex gap-2 flex-wrap">
              {GOAL_EMOJIS.map(e => (
                <button key={e} onClick={() => setFormEmoji(e)}
                  className={`w-9 h-9 text-xl rounded-xl transition-all ${formEmoji === e ? 'bg-primary-muted ring-2 ring-primary scale-110' : 'bg-gray-50 dark:bg-gray-800 hover:scale-105'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <input type="text" placeholder="Nome da meta (ex: Viagem para Europa)" value={formTitle}
            onChange={e => setFormTitle(e.target.value)} className="input" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor da meta (R$)</label>
              <input type="number" placeholder="0,00" value={formTarget}
                onChange={e => setFormTarget(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Já guardei (R$)</label>
              <input type="number" placeholder="0,00" value={formCurrent}
                onChange={e => setFormCurrent(e.target.value)} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Prazo</label>
            <input type="month" value={formDate} onChange={e => setFormDate(e.target.value + '-01')}
              className="input" min={new Date().toISOString().slice(0, 7)} />
          </div>

          {/* Preview do aporte necessário */}
          {formTarget && formDate && (
            <div className="bg-primary-muted rounded-xl p-3 flex justify-between items-center">
              <p className="text-sm text-gray-700 font-medium">Aporte mensal necessário</p>
              <p className="text-lg font-bold text-primary">
                {formatBRL(monthlyNeeded(
                  parseFloat(formTarget) || 0,
                  parseFloat(formCurrent) || 0,
                  formDate,
                ))}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={addGoal} disabled={saving} className="btn-primary flex-1 disabled:opacity-40">
              {saving ? 'Salvando...' : 'Criar meta'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de metas */}
      {loading ? (
        <div className="card text-center py-8 text-gray-400">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Carregando metas...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <span className="text-5xl">🎯</span>
          <p className="text-gray-500 font-medium">Nenhuma meta criada ainda</p>
          <p className="text-sm text-gray-400">Defina um objetivo financeiro e acompanhe seu progresso mês a mês.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
            Criar primeira meta
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(g => (
            <GoalCard key={g.id} goal={g} onDelete={deleteGoal} onUpdate={updateGoal} />
          ))}
        </div>
      )}
    </div>
  )
}
