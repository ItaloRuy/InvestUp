/**
 * Simulator Agent — Tipos do Motor de Simulação
 * Todos os tipos TypeScript usados nos cálculos financeiros.
 */

// ─── Ativos disponíveis ────────────────────────────────────
export type AssetType = 'renda_fixa' | 'renda_variavel';
export type LiquidityType = 'diaria' | 'mensal' | 'anual' | 'vencimento';
export type RiskLevel = 'minimo' | 'baixo' | 'medio' | 'alto' | 'muito_alto';

export interface Asset {
  id: string;
  name: string;
  ticker?: string;            // ex: BOVA11, PETR4
  type: AssetType;
  annualReturnRate: number;   // taxa anual em decimal (0.105 = 10.5%)
  riskLevel: RiskLevel;
  liquidity: LiquidityType;
  isIRExempt: boolean;        // LCI, LCA, LIG são isentos
  description: string;
  emoji: string;
}

// ─── Carteira ──────────────────────────────────────────────
export interface PortfolioAllocation {
  assetId: string;
  amountBRL: number;          // valor em reais
  percentual: number;         // 0-100
}

export interface Portfolio {
  id: string;
  name: string;
  allocations: PortfolioAllocation[];
  totalInitial: number;
  monthlyContribution: number;
  createdAt: Date;
}

// ─── Resultado de simulação ────────────────────────────────
export interface SimulationDataPoint {
  monthIndex: number;
  date: Date;
  totalValue: number;         // valor total da carteira
  totalInvested: number;      // quanto foi colocado (sem juros)
  totalEarnings: number;      // só os juros acumulados
  monthlyEarning: number;     // quanto rendeu nesse mês
}

export interface SimulationResult {
  portfolioId: string;
  dataPoints: SimulationDataPoint[];
  summary: {
    months: number;
    totalInvested: number;
    finalValue: number;
    totalEarnings: number;
    averageMonthlyReturn: number;
    annualizedReturn: number;
  };
  benchmarks: {
    poupanca: number;
    cdi: number;
    ipca: number;
    ibovespa?: number;
  };
}

// ─── Benchmarks ───────────────────────────────────────────
export interface BenchmarkRates {
  selicAnual: number;
  cdiAnual: number;
  ipcaAnual: number;
  poupancaAnual: number;
  ibovespaAnual?: number;
}

// ─── Perfil do investidor ──────────────────────────────────
export type InvestorProfile = 'conservador' | 'moderado' | 'arrojado';

export interface InvestorProfileConfig {
  profile: InvestorProfile;
  suggestedAllocations: {
    rendaFixa: number;        // percentual (0-100)
    rendaVariavel: number;
  };
  maxAcceptableLoss: number;  // percentual de queda tolerável
  minHorizonMonths: number;   // prazo mínimo recomendado
}
