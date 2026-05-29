# InvestUp — App Educacional de Investimentos

## Visão do Produto
Aplicativo mobile didático que ensina estudantes a investir, com simulações reais e aportes mensais. Estilo Duolingo para finanças. **Gratuito, fins acadêmicos e produção de artigos.**

## Público-Alvo
- Estudantes universitários (18-30 anos)
- Sem experiência prévia com investimentos
- Querem aprender de forma leve, gamificada e sem jargão

## Referências Visuais e de Produto
- **UX/Engajamento:** Duolingo (streaks, XP, ligas, missões)
- **Visual financeiro:** NuBank (moderno, limpo, confiante)
- **Tom de voz:** encorajador, simples, nunca intimidador

## Stack Tecnológica
- **Mobile:** React Native + Expo (TypeScript)
- **Navegação:** Expo Router
- **Backend:** Node.js + Fastify + PostgreSQL (fase 2)
- **Dados de mercado:** Brapi.dev (gratuito, dados B3)
- **IA/Tutor:** Claude API (claude-sonnet-4-6)

## Design System
```
Cores Primárias:
  - Azul Confiança:    #1E3A5F
  - Verde Crescimento: #00A86B
  - Laranja Alerta:    #FF7B00
  - Background:        #F8F9FA
  - Surface:           #FFFFFF
  - Texto Principal:   #1A1A2E
  - Texto Secundário:  #6B7280

Tipografia:
  - Fonte: Inter (system font fallback: -apple-system)
  - H1: 28px / Bold
  - H2: 22px / SemiBold
  - Body: 16px / Regular
  - Caption: 12px / Regular

Spacing Scale (base 4px):
  - xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | xxl: 48px

Border Radius:
  - sm: 8px | md: 12px | lg: 16px | full: 9999px

Touch Targets: mínimo 44×44px (WCAG)
Contraste: mínimo 4.5:1 (WCAG AA)
```

## Arquitetura de Agentes
O projeto usa uma arquitetura **multi-agent** onde cada agente tem responsabilidade isolada:

| Agente | Arquivo | Fase |
|--------|---------|------|
| 🎨 UX/UI Agent | `.claude/agents/ux-ui-agent.md` | MVP |
| 📚 Content Agent | `.claude/agents/content-agent.md` | MVP |
| 📊 Simulator Agent | `.claude/agents/simulator-agent.md` | Fase 2 |
| 🎮 Gamification Agent | `.claude/agents/gamification-agent.md` | Fase 2 |
| 📱 Mobile Dev Agent | `.claude/agents/mobile-dev-agent.md` | Fase 2 |

## Estrutura de Pastas
```
InvestUp/
├── .claude/
│   ├── agents/          ← definições dos agentes
│   └── skills/          ← skills instaladas do skills.sh
├── design-specs/        ← specs geradas pelo UX Agent
│   └── decisions/       ← log de decisões de design (para artigos)
├── content/             ← conteúdo gerado pelo Content Agent
│   ├── trilha-1-fundamentos/
│   ├── trilha-2-renda-fixa/
│   └── trilha-3-renda-variavel/
├── src/
│   ├── design-system/   ← tokens.ts, theme.ts
│   ├── components/      ← componentes reutilizáveis
│   ├── screens/         ← telas do app
│   ├── engine/          ← simulador de investimentos
│   └── gamification/    ← XP, streaks, conquistas
└── docs/
    └── research/        ← documentação para artigos acadêmicos
```

## Conteúdo das Trilhas
```
Trilha 1 — Fundamentos (MVP)
  Lição 1: O que é dinheiro trabalhando por você?
  Lição 2: Risco x Retorno
  Lição 3: Juros compostos na prática
  BOSS: Simulação — Monte sua primeira carteira

Trilha 2 — Renda Fixa
  Lição 1: Tesouro Direto (Selic, IPCA+, Prefixado)
  Lição 2: CDB, LCI, LCA
  Lição 3: Como o CDI afeta seu dinheiro
  BOSS: Simulação — Escolha o melhor ativo

Trilha 3 — Renda Variável
  Lição 1: O que é uma ação?
  Lição 2: FIIs — Fundos Imobiliários
  Lição 3: ETFs — diversificação simples
  BOSS: Simulação — Monte uma carteira de ações
```

## APIs Gratuitas
- **Brapi.dev** — cotações e dados da B3 (free tier)
- **Alpha Vantage** — dados históricos (free tier, 25 req/dia)
- **Banco Central API** — taxa Selic histórica (open data)

## Contexto Acadêmico
- Projeto open source, fins educacionais
- Decisões de arquitetura documentadas em `/docs/research/`
- Raciocínio dos agentes registrado para artigos sobre multi-agent development
- Cada agente deve comentar suas decisões de design no output

## Convenções de Código
- TypeScript strict mode
- Componentes funcionais com hooks
- StyleSheet.create() para estilos (sem styled-components no MVP)
- Nomes de arquivo: PascalCase para componentes, camelCase para utilitários
- Commits semânticos: feat:, fix:, design:, content:, docs:
