import jsPDF from 'jspdf'

interface Expense {
  id: number
  category: string
  description: string
  amount: number
  date: string
}

interface CatInfo {
  id: string
  label: string
  emoji: string
  ideal: number
}

const CATS: CatInfo[] = [
  { id: 'moradia',      label: 'Moradia',      emoji: '🏠', ideal: 30 },
  { id: 'alimentacao',  label: 'Alimentação',  emoji: '🍔', ideal: 15 },
  { id: 'transporte',   label: 'Transporte',   emoji: '🚗', ideal: 10 },
  { id: 'lazer',        label: 'Lazer',        emoji: '🎮', ideal: 10 },
  { id: 'saude',        label: 'Saúde',        emoji: '💊', ideal: 10 },
  { id: 'educacao',     label: 'Educação',     emoji: '📚', ideal: 5  },
  { id: 'investimento', label: 'Investimento', emoji: '💰', ideal: 20 },
  { id: 'outros',       label: 'Outros',       emoji: '📦', ideal: 0  },
]

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function exportFinancePDF(params: {
  monthLabel: string
  income: number
  expenses: Expense[]
  budgets: Record<string, number>
  userName: string
}) {
  const { monthLabel, income, expenses, budgets, userName } = params

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 16
  let y = 0

  // ── helpers de layout
  function ln(n = 5) { y += n }
  function text(str: string, x: number, fontSize = 10, bold = false, color: [number, number, number] = [30, 30, 30]) {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    doc.text(str, x, y)
  }
  function fillRect(x: number, ry: number, w: number, h: number, r: [number, number, number]) {
    doc.setFillColor(...r)
    doc.rect(x, ry, w, h, 'F')
  }
  function line(x1: number, x2: number, color: [number, number, number] = [220, 220, 220]) {
    doc.setDrawColor(...color)
    doc.setLineWidth(0.3)
    doc.line(x1, y, x2, y)
  }

  // ── Cabeçalho azul
  fillRect(0, 0, W, 28, [30, 58, 95])
  y = 11
  text('InvestUp', margin, 18, true, [255, 255, 255])
  doc.setFontSize(10)
  doc.setTextColor(180, 200, 230)
  doc.text('Relatório Financeiro Mensal', margin, y + 7)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.text(monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), W - margin, y + 3, { align: 'right' })
  doc.setFontSize(9)
  doc.setTextColor(180, 200, 230)
  doc.text(userName, W - margin, y + 8, { align: 'right' })

  y = 34

  // ── Resumo financeiro
  const total  = expenses.reduce((s, e) => s + e.amount, 0)
  const saved  = Math.max(0, income - total)
  const savePct = income > 0 ? ((saved / income) * 100).toFixed(0) + '%' : '—'

  text('Resumo do mês', margin, 13, true, [30, 58, 95])
  ln(7)

  const cards = [
    { label: 'Renda',         value: income > 0 ? fmtBRL(income) : '—',  color: [235, 241, 255] as [number, number, number] },
    { label: 'Total de Gastos', value: fmtBRL(total),                      color: total > income && income > 0 ? [255, 235, 235] as [number, number, number] : [245, 245, 245] as [number, number, number] },
    { label: 'Economizado',   value: income > 0 ? fmtBRL(saved) : '—',    color: [235, 250, 240] as [number, number, number] },
    { label: 'Taxa poupança', value: savePct,                              color: [245, 245, 245] as [number, number, number] },
  ]
  const cw = (W - margin * 2 - 6) / 4
  cards.forEach((c, i) => {
    const cx = margin + i * (cw + 2)
    fillRect(cx, y - 4, cw, 18, c.color)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(c.label, cx + 3, y + 1)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(c.value, cx + 3, y + 8)
  })
  ln(22)

  // ── Gastos por categoria
  const byC: Record<string, number> = {}
  CATS.forEach(c => { byC[c.id] = expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0) })
  const activeCats = CATS.filter(c => byC[c.id] > 0).sort((a, b) => byC[b.id] - byC[a.id])

  if (activeCats.length > 0) {
    text('Gastos por categoria', margin, 12, true, [30, 58, 95])
    ln(6)

    // Cabeçalho da tabela
    fillRect(margin, y - 3.5, W - margin * 2, 7, [240, 244, 250])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text('Categoria',  margin + 2, y + 0)
    doc.text('Gasto',      margin + 65, y + 0)
    doc.text('Orçamento',  margin + 95, y + 0)
    doc.text('% da Renda', margin + 130, y + 0)
    doc.text('Status',     margin + 158, y + 0)
    ln(7)

    activeCats.forEach((cat, i) => {
      if (i % 2 === 1) fillRect(margin, y - 3.5, W - margin * 2, 7, [250, 250, 252])
      const amt    = byC[cat.id]
      const budget = budgets[cat.id] ?? 0
      const pct    = income > 0 ? ((amt / income) * 100).toFixed(1) : '—'
      const over   = budget > 0 && amt > budget
      const status = budget > 0 ? (over ? 'Acima' : 'OK') : '—'

      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 30, 30)
      doc.text(`${cat.emoji} ${cat.label}`, margin + 2, y + 0)
      doc.text(fmtBRL(amt),                  margin + 65, y + 0)
      doc.text(budget > 0 ? fmtBRL(budget) : '—', margin + 95, y + 0)
      doc.text(typeof pct === 'string' && pct !== '—' ? `${pct}%` : pct, margin + 130, y + 0)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(over ? 200 : 0, over ? 50 : 130, over ? 50 : 70)
      doc.text(status, margin + 158, y + 0)
      doc.setTextColor(30, 30, 30)
      ln(7)
    })

    // Total
    ln(1)
    line(margin, W - margin)
    ln(4)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 58, 95)
    doc.text('Total geral', margin + 2, y)
    doc.text(fmtBRL(total), margin + 65, y)
    ln(8)
  }

  // ── Últimos lançamentos (até 10)
  if (expenses.length > 0) {
    text('Últimos lançamentos', margin, 12, true, [30, 58, 95])
    ln(6)

    fillRect(margin, y - 3.5, W - margin * 2, 7, [240, 244, 250])
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text('Data',        margin + 2, y)
    doc.text('Descrição',   margin + 22, y)
    doc.text('Categoria',   margin + 100, y)
    doc.text('Valor',       margin + 153, y)
    ln(7)

    const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
    recent.forEach((e, i) => {
      if (i % 2 === 1) fillRect(margin, y - 3.5, W - margin * 2, 7, [250, 250, 252])
      const cat = CATS.find(c => c.id === e.category)
      const dt  = new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 30, 30)
      doc.text(dt, margin + 2, y)
      const desc = e.description.length > 30 ? e.description.substring(0, 28) + '…' : e.description
      doc.text(desc, margin + 22, y)
      doc.text(cat ? `${cat.emoji} ${cat.label}` : e.category, margin + 100, y)
      doc.text(fmtBRL(e.amount), margin + 153, y, { align: 'left' })
      ln(7)
    })

    if (expenses.length > 10) {
      doc.setFontSize(7.5)
      doc.setTextColor(130, 130, 130)
      doc.text(`… e mais ${expenses.length - 10} lançamentos`, margin + 2, y)
      ln(6)
    }
  }

  // ── Rodapé
  const pageH = 297
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(160, 160, 160)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} · InvestUp`, W / 2, pageH - 8, { align: 'center' })
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, pageH - 12, W - margin, pageH - 12)

  const filename = `InvestUp_${monthLabel.replace(/\s/g, '_')}.pdf`
  doc.save(filename)
}
