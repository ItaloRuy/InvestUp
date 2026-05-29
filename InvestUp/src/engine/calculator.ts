/**
 * Simulator Agent — Motor de Cálculo Financeiro
 * Fórmulas de juros compostos, DCA e simulação de carteira.
 * Sem dependências externas — puro TypeScript.
 */

import type {
  Asset,
  Portfolio,
  SimulationResult,
  SimulationDataPoint,
  BenchmarkRates,
} from './types';

// ─────────────────────────────────────────────────────────
// TAXAS BASE (atualizadas manualmente ou via API do BCB)
// Fonte: Banco Central do Brasil — mai/2026
// ─────────────────────────────────────────────────────────
export const DEFAULT_RATES: BenchmarkRates = {
  selicAnual: 0.105,      // 10.5% ao ano
  cdiAnual: 0.1045,       // 104.5% da Selic ≈ CDI
  ipcaAnual: 0.05,        // 5% ao ano (meta)
  poupancaAnual: 0.0706,  // 70.6% da Selic quando Selic > 8.5%
  ibovespaAnual: 0.12,    // média histórica (estimativa conservadora)
};

// ─────────────────────────────────────────────────────────
// FUNÇÕES BÁSICAS
// ─────────────────────────────────────────────────────────

/**
 * Converte taxa anual para taxa mensal equivalente.
 * Fórmula: (1 + taxaAnual)^(1/12) - 1
 */
export function annualToMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

/**
 * Juros compostos simples (sem aportes mensais).
 * M = C × (1 + i)^n
 *
 * @param principal - Valor inicial (R$)
 * @param monthlyRate - Taxa mensal (decimal)
 * @param months - Número de meses
 */
export function compoundInterest(
  principal: number,
  monthlyRate: number,
  months: number
): number {
  return principal * Math.pow(1 + monthlyRate, months);
}

/**
 * Valor futuro com aportes mensais (DCA — Dollar Cost Averaging).
 * VF = C × (1+i)^n + PMT × [((1+i)^n - 1) / i]
 *
 * @param principal - Valor inicial (R$)
 * @param monthlyContribution - Aporte mensal (R$)
 * @param monthlyRate - Taxa mensal (decimal)
 * @param months - Número de meses
 */
export function futureValueWithContributions(
  principal: number,
  monthlyContribution: number,
  monthlyRate: number,
  months: number
): number {
  if (monthlyRate === 0) {
    return principal + monthlyContribution * months;
  }

  const capitalGrowth = compoundInterest(principal, monthlyRate, months);
  const contributionsGrowth =
    monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return capitalGrowth + contributionsGrowth;
}

/**
 * Rendimento real descontando inflação.
 * rendimento_real = ((1 + nominal) / (1 + inflacao)) - 1
 */
export function realReturn(nominalRate: number, inflationRate: number): number {
  return (1 + nominalRate) / (1 + inflationRate) - 1;
}

// ─────────────────────────────────────────────────────────
// SIMULAÇÃO COMPLETA DE CARTEIRA
// ─────────────────────────────────────────────────────────

/**
 * Calcula a taxa mensal ponderada da carteira com base nas alocações.
 */
function portfolioWeightedMonthlyRate(portfolio: Portfolio, assets: Asset[]): number {
  const assetMap = new Map(assets.map((a) => [a.id, a]));
  const total = portfolio.totalInitial || 1;

  let weightedAnnualRate = 0;

  for (const allocation of portfolio.allocations) {
    const asset = assetMap.get(allocation.assetId);
    if (!asset) continue;

    const weight = allocation.amountBRL / total;
    weightedAnnualRate += asset.annualReturnRate * weight;
  }

  return annualToMonthlyRate(weightedAnnualRate);
}

/**
 * Gera série histórica mês a mês para gráficos.
 */
function generateDataPoints(
  principal: number,
  monthlyContribution: number,
  monthlyRate: number,
  totalMonths: number
): SimulationDataPoint[] {
  const points: SimulationDataPoint[] = [];
  const now = new Date();

  let currentValue = principal;
  let totalInvested = principal;

  for (let month = 0; month <= totalMonths; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() + month, 1);
    const monthlyEarning = month === 0 ? 0 : currentValue * monthlyRate;

    if (month > 0) {
      currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
      totalInvested += monthlyContribution;
    }

    points.push({
      monthIndex: month,
      date,
      totalValue: parseFloat(currentValue.toFixed(2)),
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalEarnings: parseFloat((currentValue - totalInvested).toFixed(2)),
      monthlyEarning: parseFloat(monthlyEarning.toFixed(2)),
    });
  }

  return points;
}

/**
 * Simula uma carteira completa com aportes mensais.
 * Retorna série temporal + resumo + comparação com benchmarks.
 *
 * @param portfolio - Carteira a simular
 * @param assets - Lista de ativos disponíveis
 * @param months - Período da simulação em meses
 * @param rates - Taxas de benchmark (usa DEFAULT_RATES se omitido)
 */
export function simulatePortfolio(
  portfolio: Portfolio,
  assets: Asset[],
  months: number,
  rates: BenchmarkRates = DEFAULT_RATES
): SimulationResult {
  const monthlyRate = portfolioWeightedMonthlyRate(portfolio, assets);
  const { totalInitial: principal, monthlyContribution } = portfolio;

  const dataPoints = generateDataPoints(principal, monthlyContribution, monthlyRate, months);
  const finalPoint = dataPoints[dataPoints.length - 1];
  const totalInvested = finalPoint.totalInvested;
  const finalValue = finalPoint.totalValue;

  // Benchmarks — mesmo período e aportes
  const poupancaRate = annualToMonthlyRate(rates.poupancaAnual);
  const cdiRate = annualToMonthlyRate(rates.cdiAnual);
  const ipcaRate = annualToMonthlyRate(rates.ipcaAnual);

  const poupanca = futureValueWithContributions(principal, monthlyContribution, poupancaRate, months);
  const cdi = futureValueWithContributions(principal, monthlyContribution, cdiRate, months);
  const ipca = futureValueWithContributions(principal, monthlyContribution, ipcaRate, months);

  // Retorno anualizado da carteira
  const totalMonthlyReturn = finalValue / totalInvested;
  const annualizedReturn = Math.pow(totalMonthlyReturn, 12 / months) - 1;

  return {
    portfolioId: portfolio.id,
    dataPoints,
    summary: {
      months,
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      finalValue: parseFloat(finalValue.toFixed(2)),
      totalEarnings: parseFloat((finalValue - totalInvested).toFixed(2)),
      averageMonthlyReturn: parseFloat((monthlyRate * 100).toFixed(3)),
      annualizedReturn: parseFloat((annualizedReturn * 100).toFixed(2)),
    },
    benchmarks: {
      poupanca: parseFloat(poupanca.toFixed(2)),
      cdi: parseFloat(cdi.toFixed(2)),
      ipca: parseFloat(ipca.toFixed(2)),
      ibovespa: rates.ibovespaAnual
        ? parseFloat(
            futureValueWithContributions(
              principal,
              monthlyContribution,
              annualToMonthlyRate(rates.ibovespaAnual),
              months
            ).toFixed(2)
          )
        : undefined,
    },
  };
}

// ─────────────────────────────────────────────────────────
// UTILITÁRIOS DE FORMATAÇÃO
// ─────────────────────────────────────────────────────────

/** Formata valor em R$ com separador de milhar */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

/** Formata percentual */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Formata período em anos e meses */
export function formatPeriod(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years}a ${remainingMonths}m`;
}

// ─────────────────────────────────────────────────────────
// CONSTANTES DO BOSS — Trilha 1
// Ativos pré-configurados para a simulação do BOSS
// ─────────────────────────────────────────────────────────
export const BOSS_ASSETS: Asset[] = [
  {
    id: 'tesouro_selic',
    name: 'Tesouro Selic 2029',
    type: 'renda_fixa',
    annualReturnRate: 0.105,
    riskLevel: 'minimo',
    liquidity: 'diaria',
    isIRExempt: false,
    description: 'O investimento mais seguro do Brasil. Empresta dinheiro pro governo.',
    emoji: '🛡️',
  },
  {
    id: 'cdb_xp',
    name: 'CDB Banco XP 115% CDI',
    type: 'renda_fixa',
    annualReturnRate: 0.115,
    riskLevel: 'baixo',
    liquidity: 'vencimento',
    isIRExempt: false,
    description: 'Empréstimo ao banco. Rende um pouco mais que o Tesouro.',
    emoji: '🏦',
  },
  {
    id: 'lci_itau',
    name: 'LCI Banco Itaú',
    type: 'renda_fixa',
    annualReturnRate: 0.098,
    riskLevel: 'baixo',
    liquidity: 'anual',
    isIRExempt: true,
    description: 'Isento de imposto de renda! Financia projetos imobiliários.',
    emoji: '🏠',
  },
  {
    id: 'bova11',
    name: 'BOVA11 — ETF Ibovespa',
    ticker: 'BOVA11',
    type: 'renda_variavel',
    annualReturnRate: 0.12,
    riskLevel: 'medio',
    liquidity: 'diaria',
    isIRExempt: false,
    description: 'Investe em todas as maiores empresas da bolsa de uma vez.',
    emoji: '📈',
  },
  {
    id: 'mxrf11',
    name: 'MXRF11 — FII Maxi Renda',
    ticker: 'MXRF11',
    type: 'renda_variavel',
    annualReturnRate: 0.14,
    riskLevel: 'medio',
    liquidity: 'diaria',
    isIRExempt: false,
    description: 'Fundo imobiliário que paga aluguel todo mês na sua conta.',
    emoji: '🏢',
  },
  {
    id: 'petr4',
    name: 'PETR4 — Petrobras',
    ticker: 'PETR4',
    type: 'renda_variavel',
    annualReturnRate: 0.2,
    riskLevel: 'alto',
    liquidity: 'diaria',
    isIRExempt: false,
    description: 'Ação da Petrobras. Alto potencial — mas pode cair muito também.',
    emoji: '🛢️',
  },
];
