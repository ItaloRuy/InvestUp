import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'

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

export default function GlossaryPage() {
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
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📖 Glossário Financeiro</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{TERMS.length} termos do mercado financeiro explicados de forma simples</p>
      </div>

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
