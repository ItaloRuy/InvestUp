import { useState } from 'react'
import { AlertTriangle, TrendingUp, Star, ExternalLink } from 'lucide-react'

// ── Disclaimer ──────────────────────────────────────────────────────────────
// Todos os dados aqui são ILUSTRATIVOS e EDUCACIONAIS.
// Dividend Yields mostrados são faixas históricas publicadas em fontes abertas.
// Nada nesta página constitui recomendação de investimento.
// Consulte um analista CNPI antes de tomar decisões.
// ────────────────────────────────────────────────────────────────────────────

interface Acao {
  ticker: string
  empresa: string
  setor: string
  dy: string          // range histórico ilustrativo
  nota: string
  cor: string
  risco: 'baixo' | 'médio' | 'alto'
  destaque?: boolean
}

const SETORES: Record<string, { emoji: string; cor: string }> = {
  'Bancário':       { emoji: '🏦', cor: 'bg-blue-100 text-blue-800' },
  'Energia':        { emoji: '⚡', cor: 'bg-yellow-100 text-yellow-800' },
  'Mineração':      { emoji: '⛏️', cor: 'bg-stone-100 text-stone-800' },
  'Petróleo':       { emoji: '🛢️', cor: 'bg-orange-100 text-orange-800' },
  'Telecom':        { emoji: '📡', cor: 'bg-purple-100 text-purple-800' },
  'Industrial':     { emoji: '⚙️', cor: 'bg-gray-100 text-gray-700' },
  'Consumo':        { emoji: '🛒', cor: 'bg-green-100 text-green-800' },
  'Saneamento':     { emoji: '💧', cor: 'bg-cyan-100 text-cyan-800' },
  'Tecnologia':     { emoji: '💻', cor: 'bg-indigo-100 text-indigo-800' },
  'Locação':        { emoji: '🚗', cor: 'bg-pink-100 text-pink-800' },
}

const ACOES: Acao[] = [
  // ── Bancário
  { ticker: 'BBAS3', empresa: 'Banco do Brasil',   setor: 'Bancário',  dy: '8–13%', risco: 'médio', destaque: true,
    nota: 'Maior banco público do Brasil. Historicamente um dos maiores pagadores de dividendos do Ibovespa. Risco político por ser estatal.',
    cor: 'border-blue-200' },
  { ticker: 'ITUB4', empresa: 'Itaú Unibanco',     setor: 'Bancário',  dy: '3–6%',  risco: 'baixo',
    nota: 'Maior banco privado da América Latina. Boa governança, dividendos consistentes e crescimento de lucro.',
    cor: 'border-blue-200' },
  { ticker: 'BBDC4', empresa: 'Bradesco',           setor: 'Bancário',  dy: '4–7%',  risco: 'baixo',
    nota: 'Segundo maior banco privado. Tradição de dividendos e presença nacional forte.',
    cor: 'border-blue-200' },
  { ticker: 'SANB11', empresa: 'Santander BR',     setor: 'Bancário',  dy: '5–9%',  risco: 'médio',
    nota: 'Braço brasileiro do Santander espanhol. Bom pagador de JCP (Juros sobre Capital Próprio).',
    cor: 'border-blue-200' },

  // ── Energia
  { ticker: 'TAEE11', empresa: 'Taesa',             setor: 'Energia',   dy: '10–14%', risco: 'baixo', destaque: true,
    nota: 'Transmissora de energia elétrica. Receita regulada pela ANEEL — previsível e resiliente a crises. Favorita para renda passiva.',
    cor: 'border-yellow-200' },
  { ticker: 'TRPL4',  empresa: 'CTEEP / ISA',       setor: 'Energia',   dy: '7–12%', risco: 'baixo', destaque: true,
    nota: 'Maior transmissora privada do Brasil. Contratos de longo prazo com o governo garantem receita estável.',
    cor: 'border-yellow-200' },
  { ticker: 'EGIE3',  empresa: 'Engie',              setor: 'Energia',   dy: '6–9%',  risco: 'baixo',
    nota: 'Maior geradora privada de energia renovável do Brasil. Consistência de dividendos e gestão sólida.',
    cor: 'border-yellow-200' },
  { ticker: 'CMIG4',  empresa: 'Cemig',              setor: 'Energia',   dy: '8–13%', risco: 'médio',
    nota: 'Distribuidora de MG, empresa estatal. Alto DY histórico mas sujeita a interferência política.',
    cor: 'border-yellow-200' },
  { ticker: 'CPLE6',  empresa: 'Copel',              setor: 'Energia',   dy: '5–10%', risco: 'médio',
    nota: 'Distribuidora do Paraná. Passou por privatização em 2023, potencial de melhora de eficiência.',
    cor: 'border-yellow-200' },

  // ── Mineração
  { ticker: 'VALE3',  empresa: 'Vale',               setor: 'Mineração', dy: '5–14%', risco: 'alto',
    nota: 'Maior mineradora de ferro do mundo. DY varia muito com o preço do minério. Alta exposição a China.',
    cor: 'border-stone-200' },

  // ── Petróleo
  { ticker: 'PETR4',  empresa: 'Petrobras PN',       setor: 'Petróleo',  dy: '8–20%', risco: 'alto', destaque: true,
    nota: 'Quando paga, é um dos maiores DYs do mundo. Risco: estatal, política de dividendos pode mudar com governo.',
    cor: 'border-orange-200' },

  // ── Telecom
  { ticker: 'VIVT3',  empresa: 'Vivo / Telefônica', setor: 'Telecom',   dy: '4–7%',  risco: 'baixo',
    nota: 'Maior operadora de telecom do Brasil. Dividendos estáveis e setor defensivo.',
    cor: 'border-purple-200' },

  // ── Industrial
  { ticker: 'WEGE3',  empresa: 'WEG',                setor: 'Industrial',dy: '1–2%',  risco: 'baixo',
    nota: 'Equipamentos elétricos e automação. DY baixo mas crescimento de lucro excepcional (compounding). Referência em qualidade.',
    cor: 'border-gray-200' },

  // ── Consumo
  { ticker: 'ABEV3',  empresa: 'Ambev',              setor: 'Consumo',   dy: '3–6%',  risco: 'baixo',
    nota: 'Maior cervejaria do hemisfério sul. Marca forte, dividendos consistentes, setor resiliente.',
    cor: 'border-green-200' },

  // ── Saneamento
  { ticker: 'SAPR4',  empresa: 'Sanepar',            setor: 'Saneamento',dy: '5–9%',  risco: 'baixo',
    nota: 'Saneamento do Paraná. Receita regulada, essencial — menor volatilidade que bancos ou commodities.',
    cor: 'border-cyan-200' },

  // ── Tecnologia
  { ticker: 'TOTS3',  empresa: 'Totvs',              setor: 'Tecnologia',dy: '1–3%',  risco: 'médio',
    nota: 'Líder em software de gestão para PMEs no Brasil. DY pequeno, mas crescimento relevante.',
    cor: 'border-indigo-200' },
]

// ── Carteiras exemplo (8 ativos, educacionais)
const CARTEIRAS_ACOES = [
  {
    id: 'renda',
    nome: 'Renda Passiva Pura',
    emoji: '💸',
    desc: 'Foco em maximizar dividendos recebidos mensalmente/trimestralmente. Perfil conservador-moderado.',
    horizonte: '5+ anos',
    cor: 'border-green-300 bg-green-50',
    badge: 'bg-green-100 text-green-800',
    ativos: [
      { ticker: 'TAEE11', peso: 18, motivo: 'Transmissão — renda estável regulada' },
      { ticker: 'TRPL4',  peso: 15, motivo: 'Transmissão — contratos longos' },
      { ticker: 'BBAS3',  peso: 15, motivo: 'Banco público — DY historicamente alto' },
      { ticker: 'EGIE3',  peso: 12, motivo: 'Energia renovável previsível' },
      { ticker: 'CMIG4',  peso: 10, motivo: 'Distribuidora de energia — alto DY' },
      { ticker: 'ITUB4',  peso: 12, motivo: 'Banco privado sólido' },
      { ticker: 'VIVT3',  peso: 10, motivo: 'Telecom — dividendos estáveis' },
      { ticker: 'ABEV3',  peso: 8,  motivo: 'Consumo defensivo' },
    ],
  },
  {
    id: 'crescimento',
    nome: 'Crescimento + Dividendos',
    emoji: '📈',
    desc: 'Mistura empresas que crescem com boas pagadoras de dividendos. Perfil moderado-arrojado.',
    horizonte: '10+ anos',
    cor: 'border-blue-300 bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    ativos: [
      { ticker: 'WEGE3',  peso: 20, motivo: 'Crescimento de lucro excepcional' },
      { ticker: 'ITUB4',  peso: 15, motivo: 'Banco líder privado' },
      { ticker: 'VALE3',  peso: 12, motivo: 'Commodities — exposição global' },
      { ticker: 'TAEE11', peso: 12, motivo: 'Renda estável como âncora' },
      { ticker: 'TOTS3',  peso: 10, motivo: 'Tech nacional crescendo' },
      { ticker: 'BBAS3',  peso: 12, motivo: 'Dividendos complementares' },
      { ticker: 'EGIE3',  peso: 10, motivo: 'Energia renovável' },
      { ticker: 'ABEV3',  peso: 9,  motivo: 'Consumo resiliente' },
    ],
  },
  {
    id: 'defensiva',
    nome: 'Carteira Defensiva',
    emoji: '🛡️',
    desc: 'Baixa volatilidade, setores essenciais (energia, água, banco). Dorme bem à noite.',
    horizonte: '3+ anos',
    cor: 'border-yellow-300 bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-800',
    ativos: [
      { ticker: 'TAEE11', peso: 20, motivo: 'Transmissão — menor volatilidade do setor' },
      { ticker: 'TRPL4',  peso: 18, motivo: 'Transmissão — receita garantida' },
      { ticker: 'EGIE3',  peso: 15, motivo: 'Geração renovável — previsível' },
      { ticker: 'SAPR4',  peso: 12, motivo: 'Saneamento — serviço essencial' },
      { ticker: 'VIVT3',  peso: 12, motivo: 'Telecom — setor defensivo' },
      { ticker: 'ITUB4',  peso: 13, motivo: 'Banco maior do setor privado' },
      { ticker: 'ABEV3',  peso: 7,  motivo: 'Bebidas — consumo básico' },
      { ticker: 'BBDC4',  peso: 3,  motivo: 'Banco complementar' },
    ],
  },
  {
    id: 'dividendos_plus',
    nome: '"Dogs of the Bovespa"',
    emoji: '🐕',
    desc: 'Estratégia clássica: investe nas ações do Ibovespa com maior Dividend Yield do ano anterior. Rebalanceia anualmente.',
    horizonte: '5+ anos',
    cor: 'border-purple-300 bg-purple-50',
    badge: 'bg-purple-100 text-purple-800',
    ativos: [
      { ticker: 'PETR4',  peso: 14, motivo: 'Maior DY quando em ciclo de paga' },
      { ticker: 'BBAS3',  peso: 14, motivo: 'Constante no top DY do IBOV' },
      { ticker: 'VALE3',  peso: 12, motivo: 'Alterna no top conforme minério' },
      { ticker: 'CMIG4',  peso: 12, motivo: 'Energia estatal alto DY' },
      { ticker: 'TAEE11', peso: 12, motivo: 'Transmissão constante' },
      { ticker: 'TRPL4',  peso: 12, motivo: 'Transmissão constante' },
      { ticker: 'BBDC4',  peso: 12, motivo: 'Banco alto JCP' },
      { ticker: 'SANB11', peso: 12, motivo: 'Banco alto JCP' },
    ],
  },
]

const RISCO_BADGE: Record<string, string> = {
  baixo: 'bg-green-100 text-green-700',
  médio: 'bg-yellow-100 text-yellow-700',
  alto:  'bg-red-100 text-red-700',
}

type Tab = 'acoes' | 'carteiras'

const ACOES_BY_SETOR = ACOES.reduce<Record<string, Acao[]>>((acc, a) => {
  if (!acc[a.setor]) acc[a.setor] = []
  acc[a.setor].push(a)
  return acc
}, {})

export default function AcoesPage() {
  const [tab, setTab] = useState<Tab>('acoes')
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ações na B3</h1>
        <p className="text-gray-500 text-sm mt-0.5">Estudo educacional de dividendos e carteiras exemplo</p>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
        <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-yellow-800">Conteúdo 100% educacional</p>
          <p className="text-xs text-yellow-700 mt-0.5 leading-relaxed">
            Nenhuma informação aqui é recomendação de investimento. Dados de Dividend Yield são faixas históricas ilustrativas — os valores reais mudam todo dia.
            Sempre consulte um <strong>analista CNPI certificado</strong> antes de investir. Rentabilidade passada não garante rentabilidade futura.
          </p>
          <a href="https://www.b3.com.br" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-yellow-700 underline mt-1 hover:text-yellow-900">
            Ver dados reais na B3.com.br <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {(['acoes', 'carteiras'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'acoes' ? '📋 Ações Dividendos' : '🗂️ Carteiras Exemplo'}
          </button>
        ))}
      </div>

      {/* ══════ TAB AÇÕES ══════ */}
      {tab === 'acoes' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
            <Star size={13} className="text-yellow-500" />
            <span>Ações marcadas com estrela são as mais estudadas por investidores de dividendos iniciantes.</span>
          </div>

          {Object.entries(ACOES_BY_SETOR).map(([setor, lista]) => {
            const s = SETORES[setor]
            return (
              <div key={setor}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{s?.emoji}</span>
                  <h2 className="font-bold text-gray-900">{setor}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s?.cor}`}>{lista.length} ações</span>
                </div>
                <div className="space-y-2">
                  {lista.map(acao => (
                    <div key={acao.ticker}
                      className={`card border-l-4 ${acao.cor} cursor-pointer hover:-translate-y-0.5 transition-all`}
                      onClick={() => setExpanded(expanded === acao.ticker ? null : acao.ticker)}>
                      <div className="flex items-center gap-3">
                        {/* Ticker */}
                        <div className="flex-shrink-0 w-16">
                          <div className="flex items-center gap-1">
                            {acao.destaque && <Star size={11} className="text-yellow-500 fill-yellow-500" />}
                            <span className="font-bold text-sm text-gray-900">{acao.ticker}</span>
                          </div>
                          <p className="text-xs text-gray-400 truncate">{acao.empresa.split(' ')[0]}</p>
                        </div>

                        {/* Nome */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{acao.empresa}</p>
                        </div>

                        {/* DY */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-primary">{acao.dy}</p>
                          <p className="text-xs text-gray-400">DY histórico</p>
                        </div>

                        {/* Risco */}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${RISCO_BADGE[acao.risco]}`}>
                          {acao.risco}
                        </span>
                      </div>

                      {/* Expansão */}
                      {expanded === acao.ticker && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-700 leading-relaxed">{acao.nota}</p>
                          <div className="flex gap-2 mt-2">
                            <a href={`https://statusinvest.com.br/acoes/${acao.ticker.toLowerCase()}`}
                              target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                              onClick={e => e.stopPropagation()}>
                              Ver no Status Invest <ExternalLink size={11} />
                            </a>
                            <a href={`https://www.fundamentus.com.br/detalhes.php?papel=${acao.ticker}`}
                              target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                              onClick={e => e.stopPropagation()}>
                              Fundamentus <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ══════ TAB CARTEIRAS EXEMPLO ══════ */}
      {tab === 'carteiras' && (
        <div className="space-y-5">
          <div className="card bg-primary-muted border border-primary/20">
            <p className="text-sm font-semibold text-primary mb-1">📚 Como ler estas carteiras</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Estas são <strong>carteiras estudadas e discutidas publicamente</strong> por educadores financeiros.
              Os pesos são sugestivos — você pode ajustar conforme seu perfil.
              Cada carteira tem até 8 ativos para facilitar o acompanhamento.
            </p>
          </div>

          {CARTEIRAS_ACOES.map(c => {
            const dyMedia = (() => {
              const dyValues = c.ativos.map(a => {
                const acao = ACOES.find(x => x.ticker === a.ticker)
                if (!acao) return 0
                const [min, max] = acao.dy.replace('%','').split('–').map(Number)
                return (min + max) / 2
              })
              const pesado = c.ativos.reduce((s, a, i) => s + dyValues[i] * a.peso, 0) / 100
              return pesado.toFixed(1)
            })()

            return (
              <div key={c.id} className={`card border-2 ${c.cor} space-y-4`}>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{c.emoji}</span>
                      <h3 className="font-bold text-gray-900">{c.nome}</h3>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${c.badge}`}>
                      Horizonte: {c.horizonte}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">DY médio est.</p>
                    <p className="text-lg font-bold text-primary">~{dyMedia}%</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">{c.desc}</p>

                {/* Barra colorida */}
                <div>
                  <div className="flex h-3 rounded-full overflow-hidden gap-px mb-3">
                    {c.ativos.map((a, i) => {
                      const colors = ['bg-blue-500','bg-yellow-500','bg-green-500','bg-purple-500','bg-orange-500','bg-teal-500','bg-pink-500','bg-indigo-500']
                      return (
                        <div key={a.ticker} className={colors[i % colors.length]}
                          style={{ width: `${a.peso}%` }} title={`${a.ticker}: ${a.peso}%`} />
                      )
                    })}
                  </div>

                  {/* Lista de ativos */}
                  <div className="space-y-1.5">
                    {c.ativos.map((a, i) => {
                      const colors = ['bg-blue-500','bg-yellow-500','bg-green-500','bg-purple-500','bg-orange-500','bg-teal-500','bg-pink-500','bg-indigo-500']
                      const acao = ACOES.find(x => x.ticker === a.ticker)
                      return (
                        <div key={a.ticker} className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[i % colors.length]}`} />
                          <span className="text-sm font-bold text-gray-900 w-16 flex-shrink-0">{a.ticker}</span>
                          <span className="text-xs font-semibold text-primary w-8 flex-shrink-0">{a.peso}%</span>
                          <span className="text-xs text-gray-500 flex-1">{a.motivo}</span>
                          {acao && (
                            <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">{acao.dy} DY</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Simulação R$ 1.000 */}
                <div className="bg-white/70 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    💡 Com R$ 1.000 investidos você alocaria:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.ativos.map((a, i) => {
                      const colors = ['bg-blue-500','bg-yellow-500','bg-green-500','bg-purple-500','bg-orange-500','bg-teal-500','bg-pink-500','bg-indigo-500']
                      return (
                        <span key={a.ticker}
                          className={`text-xs px-2 py-1 rounded-lg font-bold text-white ${colors[i % colors.length]}`}>
                          {a.ticker} R${a.peso * 10}
                        </span>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    DY médio estimado desta carteira: ~{dyMedia}% a.a. ilustrativos
                  </p>
                </div>

                {/* Link externo */}
                <a href="https://statusinvest.com.br" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Verificar cotações e DY reais no Status Invest <ExternalLink size={11} />
                </a>
              </div>
            )
          })}

          {/* Dica final */}
          <div className="card border border-primary/20 bg-primary-muted space-y-2">
            <p className="font-bold text-primary flex items-center gap-2">
              <TrendingUp size={16} /> Dica de ouro para iniciantes
            </p>
            <ul className="text-sm text-gray-700 space-y-1.5 list-none">
              <li>✅ Comece com <strong>4–6 ações</strong> de setores diferentes, não 20</li>
              <li>✅ Aportes mensais regulares valem mais que acertar o "melhor momento"</li>
              <li>✅ Reinvista os dividendos — juros compostos fazem o trabalho</li>
              <li>✅ Não venda no susto — carteiras de dividendo precisam de tempo</li>
              <li>⚠️ Diversifique também fora de ações: Tesouro IPCA+, FII, ETF</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
