import { useState, useMemo, useEffect } from 'react'
import { Search, BookOpen, Layers, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

const TERMS = [
  { term: 'CDI',           category: 'Renda Fixa',    def: 'Certificado de Depósito Interbancário. Taxa de referência do mercado financeiro brasileiro, próxima à Selic. Usada como benchmark para CDBs, LCIs e LCAs.' },
  { term: 'Selic',         category: 'Renda Fixa',    def: 'Taxa básica de juros da economia brasileira, definida pelo Banco Central a cada 45 dias. Influencia todos os outros investimentos do país.' },
  { term: 'Tesouro Direto',category: 'Renda Fixa',    def: 'Programa do governo federal para venda de títulos públicos a pessoas físicas. Inclui Tesouro Selic, IPCA+ e Prefixado.' },
  { term: 'Tesouro Selic', category: 'Renda Fixa',    def: 'Título público que rende a taxa Selic. Liquidez diária sem perda de rendimento. Ideal para reserva de emergência.' },
  { term: 'Tesouro IPCA+', category: 'Renda Fixa',    def: 'Título público que rende IPCA (inflação) + taxa real fixa. Garante poder de compra no longo prazo. Ideal para aposentadoria.' },
  { term: 'CDB',           category: 'Renda Fixa',    def: 'Certificado de Depósito Bancário. Você empresta dinheiro para um banco e recebe de volta com juros. Protegido pelo FGC até R$ 250 mil.' },
  { term: 'LCI',           category: 'Renda Fixa',    def: 'Letra de Crédito Imobiliário. Renda fixa emitida por bancos para financiar imóveis. Isenta de IR para pessoa física.' },
  { term: 'LCA',           category: 'Renda Fixa',    def: 'Letra de Crédito do Agronegócio. Similar à LCI, mas direcionada ao setor agrícola. Isenta de IR para pessoa física.' },
  { term: 'FGC',           category: 'Renda Fixa',    def: 'Fundo Garantidor de Créditos. Garante até R$ 250.000 por CPF por instituição em caso de falência do banco.' },
  { term: 'IPCA',          category: 'Economia',      def: 'Índice Nacional de Preços ao Consumidor Amplo. Principal indicador de inflação do Brasil, medido mensalmente pelo IBGE.' },
  { term: 'Inflação',      category: 'Economia',      def: 'Aumento generalizado e contínuo dos preços. Reduz o poder de compra do dinheiro ao longo do tempo.' },
  { term: 'Juros Compostos', category: 'Fundamentos', def: 'Juros calculados sobre o capital + juros anteriores. Crescimento exponencial. "A oitava maravilha do mundo."' },
  { term: 'Diversificação',category: 'Fundamentos',   def: 'Estratégia de distribuir investimentos entre diferentes ativos para reduzir risco. "Não coloque todos os ovos na mesma cesta."' },
  { term: 'Renda Fixa',    category: 'Fundamentos',   def: 'Classe de investimentos onde o retorno é previsível (definido no momento da aplicação). Oposto de renda variável.' },
  { term: 'Renda Variável',category: 'Fundamentos',   def: 'Classe de investimentos onde o retorno varia conforme o mercado. Inclui ações, FIIs, ETFs. Maior risco, maior potencial.' },
  { term: 'Ação',          category: 'Renda Variável',def: 'Fração do capital social de uma empresa. Comprar ações significa tornar-se sócio. Ganhos via valorização ou dividendos.' },
  { term: 'Dividendo',     category: 'Renda Variável',def: 'Parte do lucro de uma empresa distribuída aos acionistas. No Brasil, dividendos de ações e FIIs são isentos de IR para pessoa física.' },
  { term: 'FII',           category: 'Renda Variável',def: 'Fundo de Investimento Imobiliário. Permite investir em imóveis (shoppings, galpões) comprando cotas a partir de R$ 10. Paga dividendos mensais isentos de IR.' },
  { term: 'ETF',           category: 'Renda Variável',def: 'Exchange Traded Fund. Fundo que replica um índice (ex: Ibovespa) e é negociado na bolsa como uma ação. Diversificação automática com baixo custo.' },
  { term: 'BOVA11',        category: 'Renda Variável',def: 'ETF que replica o Ibovespa — as maiores empresas brasileiras. Uma cota = exposição às ~87 maiores empresas do Brasil.' },
  { term: 'IVVB11',        category: 'Renda Variável',def: 'ETF brasileiro que replica o S&P 500 (500 maiores empresas americanas). Permite investir nos EUA em reais, pela B3.' },
  { term: 'P/L',           category: 'Análise',       def: 'Preço dividido pelo Lucro por ação. Indica em quantos anos a empresa "pagaria" seu investimento com o lucro atual. Menor P/L = empresa mais barata em relação ao lucro.' },
  { term: 'P/VP',          category: 'Análise',       def: 'Preço dividido pelo Valor Patrimonial. P/VP < 1 significa que a empresa está valendo menos do que seus ativos "no papel".' },
  { term: 'DY',            category: 'Análise',       def: 'Dividend Yield. Dividendo anual dividido pelo preço atual do ativo. Ex: DY 8% = R$ 8 em dividendos por ano para cada R$ 100 investidos.' },
  { term: 'B3',            category: 'Mercado',       def: 'Bolsa de valores brasileira (Brasil, Bolsa, Balcão). Única do Brasil, sediada em São Paulo. Funciona das 10h às 17h em dias úteis.' },
  { term: 'Ticker',        category: 'Mercado',       def: 'Código de negociação de um ativo na bolsa. Ex: PETR4 (Petrobras), VALE3 (Vale), MXRF11 (FII). 4 letras + número.' },
  { term: 'Pregão',        category: 'Mercado',       def: 'Sessão de negociação da bolsa. Horário regular: 10h às 17h. Pré-abertura: 9h45. After-market: 17h25 às 18h.' },
  { term: 'Blockchain',    category: 'Cripto',        def: 'Registro distribuído e imutável de transações. Base tecnológica das criptomoedas. Cada bloco contém dados e referência criptográfica do bloco anterior.' },
  { term: 'Bitcoin (BTC)', category: 'Cripto',        def: 'Primeira e maior criptomoeda. Criada em 2009. Limite de 21 milhões de unidades. Funciona como reserva de valor digital descentralizada.' },
  { term: 'DCA',           category: 'Estratégia',    def: 'Dollar Cost Average. Estratégia de investir um valor fixo periodicamente, independente do preço. Reduz o risco de comprar no pico.' },
  { term: 'Rebalanceamento', category: 'Estratégia',  def: 'Ajuste periódico da carteira para manter as proporções originais. Ex: se ações subiram e agora representam 50% (meta era 30%), vende parte e compra outros ativos.' },
  { term: 'Número Mágico', category: 'Dividendos',    def: 'Quantidade de cotas necessária para que o dividendo mensal pague 1 nova cota. Fórmula: Preço da cota ÷ Dividendo mensal. Para DY 1%/mês = sempre 100 cotas.' },
]

const CATEGORIES = ['Todos', ...Array.from(new Set(TERMS.map(t => t.category)))]

const CAT_COLORS: Record<string, string> = {
  'Renda Fixa': 'bg-blue-100 text-blue-700',
  'Renda Variável': 'bg-green-100 text-green-700',
  'Fundamentos': 'bg-yellow-100 text-yellow-700',
  'Economia': 'bg-orange-100 text-orange-700',
  'Análise': 'bg-purple-100 text-purple-700',
  'Mercado': 'bg-cyan-100 text-cyan-700',
  'Cripto': 'bg-orange-100 text-orange-800',
  'Estratégia': 'bg-primary-muted text-primary',
  'Dividendos': 'bg-success-muted text-success',
}

const STORAGE_KEY = 'investup_flashcard_status'

type CardStatus = 'unseen' | 'know' | 'review'

function loadStatuses(): Record<string, CardStatus> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch { return {} }
}

function saveStatuses(s: Record<string, CardStatus>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

// ── Modo Flashcards
function FlashcardsMode() {
  const [statuses, setStatuses]   = useState<Record<string, CardStatus>>(loadStatuses)
  const [filter,   setFilter]     = useState<'all' | 'review'>('all')
  const [index,    setIndex]      = useState(0)
  const [flipped,  setFlipped]    = useState(false)

  const deck = useMemo(() => {
    if (filter === 'review') return TERMS.filter(t => statuses[t.term] === 'review' || statuses[t.term] === 'unseen' || !statuses[t.term])
    return TERMS
  }, [filter, statuses])

  const card = deck[index] ?? deck[0]
  const knowCount   = TERMS.filter(t => statuses[t.term] === 'know').length
  const reviewCount = TERMS.filter(t => statuses[t.term] === 'review').length
  const progress    = Math.round((knowCount / TERMS.length) * 100)

  function mark(status: CardStatus) {
    const updated = { ...statuses, [card.term]: status }
    setStatuses(updated)
    saveStatuses(updated)
    setFlipped(false)
    // avança ou vai para o início se terminou o deck
    setIndex(i => {
      const next = i + 1
      return next < deck.length ? next : 0
    })
  }

  function resetAll() {
    setStatuses({})
    saveStatuses({})
    setIndex(0)
    setFlipped(false)
  }

  function goTo(n: number) {
    setIndex(((n % deck.length) + deck.length) % deck.length)
    setFlipped(false)
  }

  if (deck.length === 0) return (
    <div className="card text-center py-12 space-y-4">
      <p className="text-4xl">🎉</p>
      <p className="font-bold text-gray-800 dark:text-gray-200">Todos os termos revisados!</p>
      <button onClick={() => setFilter('all')} className="btn-primary px-6 py-2 rounded-xl text-sm">Ver todos de novo</button>
    </div>
  )

  const currentStatus = statuses[card?.term]

  return (
    <div className="space-y-5">
      {/* Progresso geral */}
      <div className="card space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Progresso do baralho</span>
          <span className="font-bold text-primary">{knowCount}/{TERMS.length} termos</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-success rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="text-success font-medium">✅ Sei: {knowCount}</span>
          <span className="text-orange-500 font-medium">🔄 Rever: {reviewCount}</span>
          <span className="text-gray-400">⬜ Não visto: {TERMS.length - knowCount - reviewCount}</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {[
          { id: 'all',    label: `Todos (${TERMS.length})` },
          { id: 'review', label: `Para rever (${reviewCount + (TERMS.length - knowCount - reviewCount)})` },
        ].map(f => (
          <button key={f.id} onClick={() => { setFilter(f.id as 'all' | 'review'); setIndex(0); setFlipped(false) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === f.id ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 dark:text-gray-400 dark:border-gray-600'}`}>
            {f.label}
          </button>
        ))}
        <button onClick={resetAll} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <RotateCcw size={13} /> Resetar
        </button>
      </div>

      {/* Contador */}
      <p className="text-xs text-center text-gray-400">{index + 1} de {deck.length} {filter === 'review' ? '(modo revisão)' : ''}</p>

      {/* Card com flip */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: '1000px', height: '220px' }}
        onClick={() => setFlipped(f => !f)}
        role="button"
        aria-label="Clique para revelar a definição"
      >
        <div
          className="absolute inset-0 transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Frente — termo */}
          <div
            className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 shadow-lg border-2 ${
              currentStatus === 'know' ? 'bg-success-muted border-success/30' :
              currentStatus === 'review' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300' :
              'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className={`text-[11px] font-bold px-2 py-1 rounded-full mb-3 ${CAT_COLORS[card?.category] ?? 'bg-gray-100 text-gray-600'}`}>
              {card?.category}
            </span>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">{card?.term}</p>
            <p className="text-xs text-gray-400 mt-4">Toque para ver a definição 👆</p>
            {currentStatus === 'know'   && <span className="absolute top-3 right-3 text-lg">✅</span>}
            {currentStatus === 'review' && <span className="absolute top-3 right-3 text-lg">🔄</span>}
          </div>

          {/* Verso — definição */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 shadow-lg bg-primary border-2 border-primary/20"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-sm text-white leading-relaxed text-center">{card?.def}</p>
            <p className="text-xs text-blue-200 mt-4">Toque novamente para voltar</p>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-3">
        <button
          onClick={e => { e.stopPropagation(); mark('review') }}
          className="flex-1 py-3 rounded-xl border-2 border-orange-300 bg-orange-50 dark:bg-orange-900/20 text-orange-600 font-semibold text-sm hover:bg-orange-100 transition-colors"
        >
          🔄 Rever depois
        </button>
        <button
          onClick={e => { e.stopPropagation(); mark('know') }}
          className="flex-1 py-3 rounded-xl border-2 border-success bg-success-muted text-success font-semibold text-sm hover:bg-green-100 transition-colors"
        >
          ✅ Eu sei!
        </button>
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-center gap-6">
        <button onClick={() => goTo(index - 1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
          {deck.slice(0, 10).map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-primary scale-125' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-400'}`} />
          ))}
          {deck.length > 10 && <span className="text-xs text-gray-400">+{deck.length - 10}</span>}
        </div>
        <button onClick={() => goTo(index + 1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

// ── Modo Lista (original)
function ListView() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('Todos')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return TERMS.filter(t =>
      (category === 'Todos' || t.category === category) &&
      (t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q))
    )
  }, [search, category])

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar termo ou definição..."
          className="input pl-10"
        />
      </div>

      {/* Filtro por categoria */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              category === cat
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 text-gray-600 dark:text-gray-400 dark:border-gray-700 hover:border-gray-300'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">Nenhum termo encontrado para "{search}"</p>
          </div>
        )}
        {filtered.map(t => (
          <div key={t.term} className="card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{t.term}</h3>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${CAT_COLORS[t.category] ?? 'bg-gray-100 text-gray-600'}`}>
                {t.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.def}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-gray-400 pb-2">
        {filtered.length} de {TERMS.length} termos
      </p>
    </div>
  )
}

// ── Página principal
export default function GlossaryPage() {
  const [mode, setMode] = useState<'list' | 'flashcards'>('list')

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📖 Glossário Financeiro</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{TERMS.length} termos do mercado financeiro</p>
        </div>

        {/* Toggle Lista / Flashcards */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0">
          <button
            onClick={() => setMode('list')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <BookOpen size={14} /> Lista
          </button>
          <button
            onClick={() => setMode('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === 'flashcards' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Layers size={14} /> Flashcards
          </button>
        </div>
      </div>

      {mode === 'list'       && <ListView />}
      {mode === 'flashcards' && <FlashcardsMode />}
    </div>
  )
}
