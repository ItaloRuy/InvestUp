# ENGENHARIA.md — InvestUp-Web

> Documentação técnica completa de engenharia de software.  
> Gerada em 06/06/2026 com base na leitura integral do código-fonte.

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Estrutura de Diretórios](#2-estrutura-de-diretórios)
3. [Frontend — Arquitetura React](#3-frontend--arquitetura-react)
4. [Backend — API REST](#4-backend--api-rest)
5. [Features Implementadas (15 features)](#5-features-implementadas-15-features)
6. [Segurança](#6-segurança)
7. [Performance e Boas Práticas](#7-performance-e-boas-práticas)
8. [Testes E2E](#8-testes-e2e)
9. [Setup e Execução](#9-setup-e-execução)
10. [Decisões Arquiteturais](#10-decisões-arquiteturais)

---

## 1. Visão Geral do Sistema

### O que é o InvestUp

O **InvestUp** é uma plataforma web de educação financeira gamificada, desenvolvida como projeto acadêmico. Seu objetivo é ensinar conceitos de investimentos de forma progressiva e engajante, usando mecânicas de gamificação — XP, streak, níveis, conquistas, desafios e rankings — para motivar o aprendizado contínuo.

O usuário progride por trilhas de lições (Fundamentos, Renda Fixa, Renda Variável, Cripto), ganha XP ao completar atividades, responde quizzes diários, participa de desafios semanais e controla suas finanças pessoais com ferramentas integradas como simuladores, calculadora FIRE, exportação de PDF e análise comparativa de gastos.

### Stack Completa

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend framework | React | 18.3.1 |
| Build tool | Vite | 5.3.1 |
| Linguagem | TypeScript | 5.5.3 |
| Estilização | Tailwind CSS | 3.4.4 |
| Roteamento | React Router DOM | 6.24.0 |
| HTTP client | Axios | 1.7.2 |
| Gráficos | Recharts | 2.12.7 |
| Ícones | Lucide React | 0.400.0 |
| Toasts | React Hot Toast | 2.4.1 |
| Utilitários CSS | clsx | 2.1.1 |
| Geração de PDF | jsPDF | 4.2.1 |
| Backend runtime | Node.js + Express | — |
| Autenticação | JSON Web Token (jsonwebtoken) | — |
| Hash de senhas | bcryptjs | — |
| Banco de dados | SQLite (better-sqlite3) | — |
| CORS | cors (middleware Express) | — |

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (Cliente)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                React SPA (Vite + TypeScript)             │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │   │
│  │  │ AuthContext  │  │ ThemeContext  │  │  React Router │   │   │
│  │  │  (JWT, user) │  │ (dark/light) │  │  (10 rotas)   │   │   │
│  │  └─────────────┘  └──────────────┘  └───────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │                    Páginas (10)                  │   │   │
│  │  │  Dashboard · Trilhas · Simulador · Finanças      │   │   │
│  │  │  Metas · Ranking · Glossário · Perfil · Lição   │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │                Componentes UI (9)                │   │   │
│  │  │  LevelBadge · DailyQuiz · WeeklyChallenges       │   │   │
│  │  │  ActivityCalendar · NotificationBell             │   │   │
│  │  │  OnboardingTour · SpendingAnalysis · MascotTip   │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │                 Utilitários                      │   │   │
│  │  │     levels.ts · badges.ts · exportPDF.ts         │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │ Axios (HTTP/JSON)                     │
│                          │ Authorization: Bearer <JWT>           │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Backend — Node.js + Express                     │
│                       porta 8080                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               Middleware requireAuth (JWT)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  30+ Endpoints REST                      │   │
│  │  /auth · /user · /expenses · /income · /budget          │   │
│  │  /goals · /ranking · /quiz · /challenges · /activity    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │       better-sqlite3 (API síncrona)                      │   │
│  │                                                          │   │
│  │       investup.db (arquivo em disco)                     │   │
│  │       10 tabelas                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Diretórios

```
InvestUp-Web/
├── backend-node/
│   ├── server.js              # Backend completo (950 linhas) — Express + SQLite
│   ├── package.json           # Dependências do backend
│   └── investup.db            # Banco SQLite gerado em runtime
│
├── frontend/
│   ├── public/                # Assets estáticos
│   ├── src/
│   │   ├── App.tsx            # Raiz do app: rotas, PrivateRoute, PublicRoute
│   │   ├── main.tsx           # Ponto de entrada (ReactDOM.createRoot)
│   │   ├── index.css          # Estilos globais + variáveis Tailwind
│   │   │
│   │   ├── api/
│   │   │   └── client.ts      # Instância Axios com baseURL e interceptor JWT
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx  # Estado de auth, login, logout, updateUser
│   │   │   └── ThemeContext.tsx # Dark/light mode, persistência localStorage
│   │   │
│   │   ├── types/             # Tipos TypeScript (User, AuthResponse, etc.)
│   │   │
│   │   ├── utils/
│   │   │   ├── levels.ts      # Sistema de 9 níveis (LEVELS[], getLevelInfo, getLevelProgress)
│   │   │   ├── badges.ts      # Sistema de selos/personagens (ALL_BADGES, getUserBadge)
│   │   │   └── exportPDF.ts   # Geração de PDF financeiro com jsPDF
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── AppLayout.tsx      # Sidebar desktop + topbar mobile + bottom nav
│   │   │   └── ui/
│   │   │       ├── MascotTip.tsx      # Card de dica cômica do mascote
│   │   │       ├── LevelBadge.tsx     # Badge de nível com barra de progresso
│   │   │       ├── DailyQuiz.tsx      # Componente do quiz diário (+25 XP)
│   │   │       ├── WeeklyChallenges.tsx # Card de desafios semanais
│   │   │       ├── ActivityCalendar.tsx # Calendário de atividade estilo GitHub
│   │   │       ├── NotificationBell.tsx # Sino com dropdown de notificações
│   │   │       ├── OnboardingTour.tsx  # Tour de 6 passos para novos usuários
│   │   │       └── SpendingAnalysis.tsx # Análise comparativa de gastos
│   │   │
│   │   └── pages/
│   │       ├── auth/
│   │       │   ├── LoginPage.tsx      # Tela de login
│   │       │   └── RegisterPage.tsx   # Tela de cadastro
│   │       └── app/
│   │           ├── DashboardPage.tsx  # Home: stats, nível, desafios, quiz, trilhas
│   │           ├── LessonsPage.tsx    # Mapa visual de trilhas (zigzag, cadeados)
│   │           ├── LessonPage.tsx     # Conteúdo de uma lição específica
│   │           ├── SimulatorPage.tsx  # Simulador de investimentos (6 abas)
│   │           ├── FinancePage.tsx    # Controle financeiro (3 abas + PDF)
│   │           ├── GoalsPage.tsx      # Metas financeiras
│   │           ├── RankingPage.tsx    # Ranking global por XP
│   │           ├── GlossaryPage.tsx   # Glossário com modo flashcards
│   │           ├── AcoesPage.tsx      # Página de ações (cotações)
│   │           └── ProfilePage.tsx    # Perfil, conquistas, jornada de níveis
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── DEVLOG.md                  # Log das 15 features implementadas
├── E2E_REPORT.md              # Resultado dos testes end-to-end
├── README.md                  # Documentação pública
└── ENGENHARIA.md              # Este arquivo
```

---

## 3. Frontend — Arquitetura React

### 3.1 Roteamento

O arquivo `src/App.tsx` é o ponto central de roteamento. Ele envolve tudo em `<AuthProvider>` e define duas camadas de proteção de rota.

#### Tabela de Rotas

| Método | Path | Componente | Proteção |
|--------|------|-----------|---------|
| GET | `/` | Redirect → `/app` | — |
| GET | `/login` | `LoginPage` | PublicRoute (redireciona autenticados para `/app`) |
| GET | `/register` | `RegisterPage` | PublicRoute |
| GET | `/app` | `DashboardPage` dentro de `AppLayout` | PrivateRoute |
| GET | `/app/trilhas` | `LessonsPage` | PrivateRoute |
| GET | `/app/trilhas/:trailId/licao/:lessonId` | `LessonPage` | PrivateRoute |
| GET | `/app/simulador` | `SimulatorPage` | PrivateRoute |
| GET | `/app/financas` | `FinancePage` | PrivateRoute |
| GET | `/app/acoes` | `AcoesPage` | PrivateRoute |
| GET | `/app/glossario` | `GlossaryPage` | PrivateRoute |
| GET | `/app/metas` | `GoalsPage` | PrivateRoute |
| GET | `/app/ranking` | `RankingPage` | PrivateRoute |
| GET | `/app/perfil` | `ProfilePage` | PrivateRoute |
| GET | `*` | Redirect → `/app` | — (404 catch-all) |

#### Fluxo de Autenticação

```
Usuário acessa qualquer rota protegida
        │
        ▼
PrivateRoute verifica AuthContext
        │
        ├─── isLoading = true → <FullPageLoader /> (spinner)
        │
        ├─── isAuthenticated = false → <Navigate to="/login" />
        │
        └─── isAuthenticated = true → renderiza children

Usuário acessa /login ou /register
        │
        ▼
PublicRoute verifica AuthContext
        │
        ├─── isLoading = true → <FullPageLoader />
        │
        ├─── isAuthenticated = true → <Navigate to="/app" />
        │
        └─── isAuthenticated = false → renderiza a página de auth
```

`isAuthenticated` é calculado como `!!user && !!token` no `AuthContext`.

---

### 3.2 Contextos Globais

#### AuthContext (`src/contexts/AuthContext.tsx`)

Gerencia todo o estado de autenticação do aplicativo.

**Estado interno:**
```typescript
const [user,      setUser]      = useState<User | null>(null)
const [token,     setToken]     = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(true)
```

**Interface pública:**
```typescript
interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean       // !!user && !!token
  login: (email, password) => Promise<void>
  register: (name, email, password) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}
```

**Fluxo JWT:**
1. Na montagem do `AuthProvider`, o `useEffect` lê `investup_token` e `investup_user` do `localStorage`. Se encontrar ambos, hidrata o estado sem precisar ir ao servidor.
2. `login()` chama `POST /api/auth/login`, recebe `{ token, user }`, salva em `localStorage` e `useState`.
3. `logout()` limpa `localStorage` e reseta o estado para `null`.
4. `updateUser()` atualiza campos parciais do usuário no estado e espelha no `localStorage`, usado para atualizar XP em tempo real após quiz/desafios.
5. O interceptor Axios em `src/api/client.ts` injeta automaticamente o `Authorization: Bearer <token>` em todas as requisições.

**Streak reward no login:**  
Se o backend retornar `streakReward` no payload de login (milestones: 7, 30 ou 100 dias), o `AuthContext` exibe um `toast.success` com 5 segundos de duração após 800ms de atraso.

---

#### ThemeContext (`src/contexts/ThemeContext.tsx`)

Gerencia o tema visual dark/light.

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}
```

**Inicialização:** lê `investup_theme` do `localStorage` na criação do estado (lazy initializer do `useState`).

**Aplicação:** via `useEffect`, adiciona ou remove a classe `dark` no `document.documentElement`. O Tailwind CSS está configurado com `darkMode: 'class'`, então todas as classes `dark:` respondem a isso.

**Persistência:** toda vez que `theme` muda, o `useEffect` salva em `localStorage.setItem('investup_theme', theme)`.

---

### 3.3 Páginas (detalhado)

#### DashboardPage (`/app`)

**Propósito:** Página inicial do usuário autenticado. Visão geral da progressão e atalhos para as principais funcionalidades.

**Estado gerenciado:**
- `streakAtRisk: boolean` — se o streak do usuário está em risco (consultado via API)
- `hoursLeft: number | null` — horas restantes antes de perder o streak

**APIs consumidas:**
- `GET /api/user/streak-status` — verifica se o streak está em risco

**Componentes usados:**
- `OnboardingTour` — tour automático para novos usuários (XP < 200)
- `MascotTip` — dica cômica contextualizada (função `getDashboardTip` analisa XP, streak e perfil)
- Cards de stats (XP total, streak, lições)
- `LevelBadge` — badge de nível com barra de progresso
- `WeeklyChallenges` — card de desafios da semana
- `DailyQuiz` — quiz diário com +25 XP
- Cards de trilhas de aprendizado (dados estáticos + link para `/app/trilhas`)
- Lições recentes (dados estáticos com link para lições específicas)
- CTA para o simulador

---

#### LessonsPage (`/app/trilhas`)

**Propósito:** Mapa visual de todas as trilhas de aprendizado no formato de nós circulares conectados (estilo jogos mobile de aprendizado).

**Estado gerenciado:**
- `completedLessons: string[]` — IDs das lições completadas (carregado do backend)
- `collapsed: Record<number, boolean>` — quais trilhas estão colapsadas no accordion

**APIs consumidas:**
- `GET /api/user/progress` — retorna lista de lições completadas pelo usuário

**Estrutura de dados (hardcoded):**
4 trilhas definidas no componente:
- Trilha 1: Fundamentos (7 lições, desbloqueada)
- Trilha 2: Renda Fixa (6 lições, bloqueada)
- Trilha 3: Renda Variável (6 lições, bloqueada)
- Trilha 4: Cripto (6 lições, bloqueada)

**Visual:**
- Nós circulares alternando esquerda/direita (zigzag)
- Linhas de conexão coloridas por trilha
- Nó verde com `✅` para lições concluídas
- Cadeado para lições/trilhas bloqueadas
- Card especial "BOSS" com fundo azul escuro para lições finais
- Accordion colapsável com barra de progresso `X/N lições`
- Badge "Bloqueada" para trilhas não desbloqueadas

---

#### SimulatorPage (`/app/simulador`)

**Propósito:** Simulador financeiro com 6 abas de ferramentas distintas.

**Abas disponíveis:**

| Aba | ID | Descrição |
|-----|-----|----------|
| Crescimento | `crescimento` | Simula crescimento de patrimônio com aportes mensais. Gráfico de linha vs poupança |
| Comparar carteiras | `comparar` | Compara 4 carteiras modelo (conservadora, moderada, arrojada, permanente) |
| Meta de patrimônio | `meta` | Calcula prazo para atingir meta financeira |
| Dividendos | `dividendos` | Calcula renda passiva mensal com DY variável |
| Renda Fixa | `rendafixa` | Compara CDB, Tesouro Selic, LCI e LCA com IR regressivo |
| FIRE | `fire` | Calculadora de independência financeira |

**Estado gerenciado:** cada aba mantém seus próprios `useState` com sliders e inputs numéricos.

**Componentes Recharts:** `LineChart`, `BarChart`, `Line`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`.

**Sem APIs** — todos os cálculos são feitos client-side.

---

#### FinancePage (`/app/financas`)

**Propósito:** Controle financeiro pessoal completo com lançamentos, orçamento e resumo mensal.

**Abas:**
1. **Resumo** — cards de renda/gastos/economizado, gráfico de pizza por categoria, análise comparativa, botão PDF
2. **Lançamentos** — formulário de novo gasto, lista de despesas do mês, painel de recorrentes ativos
3. **Orçamento** — sliders para definir limite por categoria

**Estado gerenciado:** navegação de mês, lista de despesas, renda do mês, orçamentos por categoria, estado do formulário de novo lançamento, toggle de recorrência, estado de carregamento.

**APIs consumidas:**
- `GET /api/user/expenses?month=YYYY-MM`
- `POST /api/user/expenses`
- `DELETE /api/user/expenses/:id`
- `GET /api/user/income?month=YYYY-MM`
- `PUT /api/user/income`
- `GET /api/user/budget?month=YYYY-MM`
- `PUT /api/user/budget`
- `GET /api/user/expenses/recurring`
- `POST /api/user/expenses/recurring`
- `DELETE /api/user/expenses/recurring/:id`
- `POST /api/user/expenses/apply-recurring`

**Componentes usados:**
- `SpendingAnalysis` — análise textual comparativa com mês anterior
- `PieChart` (Recharts) — distribuição de gastos por categoria
- `exportFinancePDF` (utilitário) — geração de PDF com jsPDF

---

#### ProfilePage (`/app/perfil`)

**Propósito:** Perfil do usuário com stats, conquistas, jornada de níveis e configurações.

**Estado gerenciado:** modal de avatar, formulário de senha, lista de conquistas desbloqueadas.

**APIs consumidas:**
- `GET /api/user/achievements`
- `POST /api/user/achievements/:achievement`
- `PATCH /api/user/avatar`
- `PATCH /api/user/password`

**Seções da página:**
1. Avatar clicável com modal de seleção (12 opções de emoji)
2. Selo atual do usuário (calculado com `getUserBadge`)
3. `ActivityCalendar` — calendário de atividade
4. `LevelBadge` + grid "Jornada de níveis" (todos os 9 níveis, desbloqueados em cor, futuros em grayscale)
5. Stats (streak, lições, XP, conquistas)
6. Galeria de Selos (todos os 6 badges possíveis)
7. Conquistas com data de desbloqueio e botão "Compartilhar"
8. Formulário de alteração de senha (accordion)
9. Botão de logout

---

#### GlossaryPage (`/app/glossario`)

**Propósito:** Glossário de 32 termos financeiros com dois modos de visualização.

**Modos:**
1. **Lista** — busca por texto, filtro por categoria, cards com termo, categoria e definição
2. **Flashcards** — flip animation 3D, navegação por setas/dots, botões "Eu sei!" e "Rever depois", filtro "Para rever"

**Estado gerenciado:** `mode`, `search`, `category`, `currentIndex`, `flipped`, statuses de cada card.

**Persistência:** statuses dos flashcards salvos em `localStorage` com chave `investup_flashcard_status`.

**32 termos** em 9 categorias: Renda Fixa, Renda Variável, Fundamentos, Economia, Análise, Mercado, Cripto, Estratégia, Dividendos.

---

#### GoalsPage (`/app/metas`)

**Propósito:** Gerenciamento de metas financeiras pessoais com barra de progresso e prazo.

**APIs consumidas:**
- `GET /api/user/goals`
- `POST /api/user/goals`
- `PATCH /api/user/goals/:id`
- `DELETE /api/user/goals/:id`

---

#### RankingPage (`/app/ranking`)

**Propósito:** Ranking global dos 10 usuários com mais XP.

**APIs consumidas:**
- `GET /api/ranking` — retorna top 10 + posição do usuário atual

---

#### LessonPage (`/app/trilhas/:trailId/licao/:lessonId`)

**Propósito:** Exibe o conteúdo de uma lição e registra a conclusão com XP.

**APIs consumidas:**
- `POST /api/user/lessons/:lessonId/complete`

---

### 3.4 Componentes de UI

#### AppLayout (`components/layout/AppLayout.tsx`)

**Props:** nenhuma (usa `<Outlet />` do React Router para renderizar páginas filhas).

**Responsabilidade:** estrutura visual principal do app autenticado — sidebar fixa em desktop, topbar + bottom nav em mobile.

**Sidebar (desktop):**
- Logo InvestUp
- User summary com XP, streak e `NotificationBell`
- Navegação com 8 itens (NavLink com destaque ativo)
- Toggle de dark mode
- Botão de logout

**Topbar (mobile):**
- Logo + badges de XP e streak
- `NotificationBell` e toggle de dark mode

**Bottom nav (mobile):** 8 ícones de navegação rápida.

---

#### LevelBadge (`components/ui/LevelBadge.tsx`)

**Props:**
```typescript
interface Props {
  xp: number
  compact?: boolean  // default: false
}
```

**Responsabilidade:** exibe o nível atual do usuário com barra de progresso para o próximo nível. No modo `compact`, renderiza uma pill inline. No modo padrão, exibe card completo com emoji, título, XP total, barra de progresso, XP necessário para o próximo nível.

---

#### DailyQuiz (`components/ui/DailyQuiz.tsx`)

**Props:** nenhuma.

**Responsabilidade:** card completo do quiz diário. Carrega a pergunta do dia via `GET /api/quiz/daily`, exibe as 4 opções, envia a resposta via `POST /api/quiz/answer`, exibe feedback colorido (verde = acertou, vermelho = errou + explicação) e chama `updateUser({ totalXp })` para atualizar o XP em tempo real.

**Estado:**
```typescript
quiz:     QuizState | null   // pergunta e estado atual
selected: number | null      // opção selecionada
result:   {...} | null        // resposta do backend
sending:  boolean            // requisição em andamento
```

---

#### WeeklyChallenges (`components/ui/WeeklyChallenges.tsx`)

**Props:** nenhuma.

**Responsabilidade:** exibe os 3 desafios da semana atual. Carrega via `GET /api/challenges/weekly`, permite completar via `POST /api/challenges/complete/:id`, exibe barra de progresso semanal (0/3 → 3/3) e atualiza XP em tempo real.

**Interface Challenge:**
```typescript
interface Challenge {
  id: string
  title: string
  desc: string
  emoji: string
  xp: number
  completed: boolean
}
```

---

#### ActivityCalendar (`components/ui/ActivityCalendar.tsx`)

**Props:** nenhuma.

**Responsabilidade:** calendário de atividade estilo GitHub com 26 semanas (182 dias). Carrega dados via `GET /api/user/activity?weeks=26`. Gera grid de células com intensidade de cor baseada na contagem de ações do dia (0→cinza, 1→verde claro, 2→verde médio, 3-4→verde, 5+→verde escuro). Exibe labels de mês e dia da semana, stats de dias ativos e ações totais.

---

#### NotificationBell (`components/ui/NotificationBell.tsx`)

**Props:** nenhuma.

**Responsabilidade:** sino com badge de contagem de não lidas e painel dropdown de notificações.

**Tipos de notificação gerados automaticamente:**
- `streak` — gerada após as 20h se o usuário tem streak > 0 e não jogou hoje
- `quiz` — gerada se `GET /api/quiz/daily` retornar `answered: false`
- `challenge` — gerada se `GET /api/challenges/weekly` tiver desafios pendentes

**Persistência:** notificações salvas em `localStorage` com chave `investup_notifications` (máximo 30 itens). Cada notificação tem ID único baseado em data/semana para evitar duplicatas.

---

#### OnboardingTour (`components/ui/OnboardingTour.tsx`)

**Props:** nenhuma.

**Responsabilidade:** tour modal de 6 passos para novos usuários. Só aparece uma vez (flag `investup_onboarding_done` no `localStorage`). Condição de exibição: `user.totalXp < 200` e flag não definida.

**6 passos:**
1. Boas-vindas ao InvestUp
2. Comece pelas Trilhas
3. Use o Simulador
4. Controle seu dinheiro
5. Como ganhar XP
6. Tudo pronto!

Navegação com "Voltar"/"Próximo", dots clicáveis, barra de progresso no topo, overlay com `backdrop-blur-sm`, fechamento ao clicar fora.

---

#### SpendingAnalysis (`components/ui/SpendingAnalysis.tsx`)

**Props:**
```typescript
interface Props {
  currentExpenses: Expense[]
  currentIncome: number
  year: number
  month: number
}
```

**Responsabilidade:** análise comparativa textual do mês atual vs mês anterior. Busca automaticamente dados do mês anterior via API. Gera bullets com 4 tipos de alerta: `good` (verde), `warn` (amarelo), `danger` (vermelho), `info` (cinza).

**Análises geradas:**
- Variação total de gastos vs mês anterior (%)
- Maior aumento por categoria
- Maior redução por categoria
- Taxa de poupança (alertas em < 10% e conquista em >= 20%)
- Ausência de investimentos registrados

---

#### MascotTip (`components/ui/MascotTip.tsx`)

**Props:** `tip: string`.

**Responsabilidade:** card visual com mascote (emoji 🤖) e dica contextual. Usado no Dashboard e no Perfil com textos cômicos baseados no estado do usuário.

---

### 3.5 Utilitários

#### `src/utils/levels.ts`

Sistema de progressão em 9 níveis.

**Interface:**
```typescript
export interface LevelInfo {
  level: number
  title: string
  emoji: string
  minXp: number
  maxXp: number
  color: string   // classe Tailwind para texto
  bg: string      // classe Tailwind para fundo
  border: string  // classe Tailwind para borda
}
```

**Array LEVELS:**

| Nível | Título | Emoji | XP mínimo | XP máximo |
|-------|--------|-------|-----------|-----------|
| 1 | Poupador | 🌱 | 0 | 199 |
| 2 | Curioso | 🔍 | 200 | 499 |
| 3 | Aprendiz | 📚 | 500 | 999 |
| 4 | Investidor | 💼 | 1.000 | 2.499 |
| 5 | Analista | 📊 | 2.500 | 4.999 |
| 6 | Trader | 📈 | 5.000 | 9.999 |
| 7 | Gestor | 🎩 | 10.000 | 19.999 |
| 8 | Mestre | 🏆 | 20.000 | 49.999 |
| 9 | Lenda | 👑 | 50.000 | ∞ |

**Funções exportadas:**

```typescript
// Retorna o LevelInfo para um determinado XP
export function getLevelInfo(xp: number): LevelInfo

// Retorna nível atual, próximo, % de progresso, XP acumulado no nível e XP necessário
export function getLevelProgress(xp: number): {
  current: LevelInfo
  next: LevelInfo | null
  pct: number
  xpInLevel: number
  xpNeeded: number
}
```

---

#### `src/utils/badges.ts`

Sistema de selos/personagens baseados no comportamento do usuário.

**6 selos disponíveis:**

| ID | Emoji | Personagem | Condição |
|----|-------|-----------|---------|
| `tio_patinhas` | 🎩 | Tio Patinhas | XP >= 10.000 |
| `gordon_gekko` | 📈 | Gordon Gekko | XP >= 2.500 E perfil ARROJADO |
| `julius` | 🧾 | Julius | CONSERVADOR E streak >= 7 |
| `tartaruga` | 🐢 | A Tartaruga | streak >= 14 E XP < 1.000 |
| `seu_madruga` | 😅 | Seu Madruga | XP < 100 |
| `iniciante` | 🌱 | Investidor Iniciante | (padrão) |

**Funções exportadas:**
```typescript
export function getUserBadge(stats: UserStats): Badge
export function getAllBadges(): Badge[]
```

---

#### `src/utils/exportPDF.ts`

Geração de PDF financeiro mensal client-side usando `jspdf ^4.2.1`.

**Função principal:**
```typescript
export function exportFinancePDF(params: {
  monthLabel: string       // ex: "junho de 2026"
  income: number           // renda do mês
  expenses: Expense[]      // lista de lançamentos
  budgets: Record<string, number>  // limites por categoria
  userName: string         // nome do usuário
}): void
```

**Layout do PDF (A4 portrait):**
1. Cabeçalho azul `rgb(30, 58, 95)` com nome "InvestUp", subtítulo, mês e nome do usuário
2. 4 cards de resumo: Renda, Total de Gastos, Economizado, Taxa de poupança
3. Tabela de gastos por categoria com colunas: Categoria, Gasto, Orçamento, % da Renda, Status (OK/Acima)
4. Tabela "Últimos lançamentos" (até 10 itens, com "...e mais N lançamentos" se houver mais)
5. Rodapé com data/hora de geração e linha separadora

**Download automático:** `doc.save(`InvestUp_${monthLabel.replace(/\s/g, '_')}.pdf`)`

---

## 4. Backend — API REST

### 4.1 Configuração

```javascript
const PORT       = process.env.PORT || 8080
const JWT_SECRET = 'InvestUpSuperSecretKeyForJWTSigning2026AcademicProject'
const JWT_EXPIRY = '24h'
const DB_PATH    = process.env.DB_PATH || path.join(__dirname, 'investup.db')

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]
```

O banco SQLite é criado ou aberto na inicialização. Todas as tabelas são criadas com `CREATE TABLE IF NOT EXISTS`, garantindo idempotência. Colunas adicionadas após a criação inicial usam `ALTER TABLE ... ADD COLUMN` dentro de `try/catch` silencioso.

---

### 4.2 Banco de Dados

#### Tabela `users`

| Coluna | Tipo | Constraints | Descrição |
|--------|------|------------|----------|
| `id` | INTEGER | PK, AUTOINCREMENT | ID único |
| `name` | TEXT | NOT NULL | Nome completo |
| `email` | TEXT | NOT NULL, UNIQUE | E-mail (lowercase) |
| `password` | TEXT | NOT NULL | Hash bcrypt (salt=10) |
| `investor_profile` | TEXT | NOT NULL, DEFAULT 'NAO_DEFINIDO' | CONSERVADOR / MODERADO / ARROJADO / NAO_DEFINIDO |
| `total_xp` | INTEGER | NOT NULL, DEFAULT 0 | XP acumulado |
| `streak_days` | INTEGER | NOT NULL, DEFAULT 0 | Dias consecutivos de atividade |
| `lessons_completed` | INTEGER | NOT NULL, DEFAULT 0 | Total de lições concluídas |
| `active` | INTEGER | NOT NULL, DEFAULT 1 | 1=ativo, 0=desativado |
| `last_login_at` | TEXT | — | Data/hora do último login (ISO) |
| `created_at` | TEXT | NOT NULL, DEFAULT datetime('now') | Data de criação |
| `avatar_url` | TEXT | — | Emoji de avatar (adicionado via ALTER TABLE) |
| `streak_rewarded_at` | TEXT | — | Data do último bônus de streak (evita duplicatas) |
| `last_activity_at` | TEXT | — | Data/hora da última atividade (para streak) |

---

#### Tabela `user_progress`

| Coluna | Tipo | Constraints |
|--------|------|------------|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `user_id` | INTEGER | NOT NULL, FK → users(id) |
| `lesson_id` | TEXT | NOT NULL |
| `trail_number` | INTEGER | NOT NULL |
| `status` | TEXT | NOT NULL, DEFAULT 'AVAILABLE' |
| `progress_percent` | INTEGER | NOT NULL, DEFAULT 0 |
| `quiz_score` | INTEGER | — |
| `xp_earned` | INTEGER | — |
| `started_at` | TEXT | — |
| `completed_at` | TEXT | — |

**Índice único:** `(user_id, lesson_id)`

---

#### Tabela `expenses`

| Coluna | Tipo | Constraints |
|--------|------|------------|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `user_id` | INTEGER | NOT NULL, FK → users(id) |
| `category` | TEXT | NOT NULL |
| `description` | TEXT | NOT NULL |
| `amount` | REAL | NOT NULL |
| `expense_date` | TEXT | NOT NULL (YYYY-MM-DD) |
| `month` | TEXT | NOT NULL (YYYY-MM) |
| `created_at` | TEXT | NOT NULL, DEFAULT datetime('now') |

---

#### Tabela `monthly_income`

| Coluna | Tipo | Constraints |
|--------|------|------------|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `user_id` | INTEGER | NOT NULL, FK → users(id) |
| `month` | TEXT | NOT NULL (YYYY-MM) |
| `amount` | REAL | NOT NULL, DEFAULT 0 |

**Índice único:** `(user_id, month)` — upsert via `ON CONFLICT DO UPDATE`.

---

#### Tabela `budget_goals`

| Coluna | Tipo | Constraints |
|--------|------|------------|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `user_id` | INTEGER | NOT NULL, FK → users(id) |
| `category` | TEXT | NOT NULL |
| `monthly_limit` | REAL | NOT NULL, DEFAULT 0 |
| `month` | TEXT | NOT NULL (YYYY-MM) |

**Índice único:** `(user_id, category, month)` — upsert via `ON CONFLICT DO UPDATE`.

---

#### Tabela `user_achievements`

| Coluna | Tipo | Constraints |
|--------|------|------------|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `user_id` | INTEGER | NOT NULL, FK → users(id) |
| `achievement` | TEXT | NOT NULL |
| `unlocked_at` | TEXT | NOT NULL, DEFAULT datetime('now') |

**Índice único:** `(user_id, achievement)` — impede duplicatas.

---

#### Tabela `recurring_expenses`

| Coluna | Tipo | Constraints |
|--------|------|------------|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `user_id` | INTEGER | NOT NULL, FK → users(id) |
| `category` | TEXT | NOT NULL |
| `description` | TEXT | NOT NULL |
| `amount` | REAL | NOT NULL |
| `active` | INTEGER | NOT NULL, DEFAULT 1 |
| `created_at` | TEXT | NOT NULL |

Soft delete via `active = 0`.

---

#### Tabela `daily_quiz_answers`

| Coluna | Tipo | Constraints |
|--------|------|------------|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `user_id` | INTEGER | NOT NULL, FK → users(id) |
| `quiz_date` | TEXT | NOT NULL (YYYY-MM-DD) |
| `correct` | INTEGER | NOT NULL, DEFAULT 0 |
| `answered_at` | TEXT | NOT NULL |

**Índice único:** `(user_id, quiz_date)` — garante uma resposta por dia por usuário.

---

#### Tabela `financial_goals`

| Coluna | Tipo | Constraints |
|--------|------|------------|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `user_id` | INTEGER | NOT NULL, FK → users(id) |
| `title` | TEXT | NOT NULL |
| `emoji` | TEXT | NOT NULL, DEFAULT '🎯' |
| `target_amount` | REAL | NOT NULL |
| `current_amount` | REAL | NOT NULL, DEFAULT 0 |
| `deadline` | TEXT | NOT NULL (YYYY-MM-DD) |
| `created_at` | TEXT | NOT NULL |

---

#### Tabela `weekly_challenge_completions`

| Coluna | Tipo | Constraints |
|--------|------|------------|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `user_id` | INTEGER | NOT NULL, FK → users(id) |
| `week_key` | TEXT | NOT NULL (ex: "2026-W23") |
| `challenge_id` | TEXT | NOT NULL |
| `completed_at` | TEXT | NOT NULL |

**Índice único:** `(user_id, week_key, challenge_id)` — impede completar o mesmo desafio duas vezes na mesma semana.

---

### 4.3 Endpoints (tabela completa)

#### Autenticação

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | Não | Cadastra novo usuário. Valida nome >= 2 chars, email válido, senha >= 6. Retorna `{ token, type, user }` |
| POST | `/api/auth/login` | Não | Autentica usuário. Verifica bcrypt. Atualiza `last_login_at`. Verifica bônus de streak em milestones. Retorna `{ token, type, user, streakReward? }` |

#### Usuário

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/user/me` | JWT | Retorna dados resumidos do usuário autenticado |
| PATCH | `/api/user/profile` | JWT | Atualiza perfil de investidor (CONSERVADOR / MODERADO / ARROJADO) |
| POST | `/api/user/xp` | JWT | Adiciona XP ao usuário. Body: `{ amount }` |
| POST | `/api/user/lessons/:lessonId/complete` | JWT | Marca lição como concluída, soma XP, atualiza streak. Body: `{ xpReward, trailNumber }` |
| GET | `/api/user/progress` | JWT | Lista todas as lições completadas pelo usuário |
| GET | `/api/user/streak-status` | JWT | Retorna se o streak está em risco (`atRisk`, `hoursLeft`) |
| PATCH | `/api/user/avatar` | JWT | Atualiza emoji de avatar. Body: `{ avatarUrl }` |
| PATCH | `/api/user/password` | JWT | Altera senha. Body: `{ currentPassword, newPassword }` |
| GET | `/api/user/activity` | JWT | Retorna contagem de ações por dia nas últimas N semanas. Query: `?weeks=26` |

#### Conquistas

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/user/achievements` | JWT | Lista conquistas desbloqueadas com data |
| POST | `/api/user/achievements/:achievement` | JWT | Registra conquista. Retorna `{ alreadyUnlocked: true }` se já existir |

#### Despesas

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/user/expenses` | JWT | Lista despesas do mês. Query: `?month=YYYY-MM` |
| POST | `/api/user/expenses` | JWT | Cria nova despesa. Body: `{ category, description, amount, date }` |
| DELETE | `/api/user/expenses/:id` | JWT | Exclui despesa (verifica ownership) |
| GET | `/api/user/expenses/recurring` | JWT | Lista templates de despesas recorrentes ativas |
| POST | `/api/user/expenses/recurring` | JWT | Cria novo template recorrente |
| DELETE | `/api/user/expenses/recurring/:id` | JWT | Soft-delete do template (active = 0) |
| POST | `/api/user/expenses/apply-recurring` | JWT | Insere automaticamente recorrentes no mês. Body: `{ month }`. Evita duplicatas por description+category+amount |

#### Renda

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/user/income` | JWT | Retorna renda do mês. Query: `?month=YYYY-MM`. Retorna 0 se não definida |
| PUT | `/api/user/income` | JWT | Upsert da renda mensal. Body: `{ month, amount }` |

#### Orçamento

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/user/budget` | JWT | Lista metas de orçamento por categoria no mês. Query: `?month=YYYY-MM` |
| PUT | `/api/user/budget` | JWT | Upsert de meta por categoria. Body: `{ category, monthly_limit, month }` |

#### Metas Financeiras

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/user/goals` | JWT | Lista metas financeiras ordenadas por deadline |
| POST | `/api/user/goals` | JWT | Cria meta. Body: `{ title, emoji, target_amount, current_amount, deadline }` |
| PATCH | `/api/user/goals/:id` | JWT | Atualiza campos da meta (partial update) |
| DELETE | `/api/user/goals/:id` | JWT | Exclui meta (verifica ownership) |

#### Ranking

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/ranking` | JWT | Top 10 usuários por XP + posição do usuário atual (`myRank`) |

#### Quiz Diário

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/quiz/daily` | JWT | Retorna pergunta do dia. Se já respondida, inclui `answer` e `explain`. Campo `answered` indica status |
| POST | `/api/quiz/answer` | JWT | Registra resposta. Body: `{ answer: number }`. Retorna `{ correct, answer, explain, xpEarned, totalXp }`. Retorna 409 se já respondido |

#### Desafios Semanais

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/challenges/weekly` | JWT | Retorna os 3 desafios da semana atual com flag `completed` por desafio |
| POST | `/api/challenges/complete/:id` | JWT | Marca desafio como concluído, credita XP. Retorna 409 se já completado |

#### Health

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/health` | Não | Health check. Retorna `{ status: 'UP', timestamp }` |

---

### 4.4 Middleware

#### `requireAuth`

```javascript
function requireAuth(req, res, next) {
  const auth = req.headers['authorization']
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, error: 'Token não fornecido' })
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(payload.sub)
    if (!user || !user.active) {
      return res.status(401).json({ status: 401, error: 'Usuário inativo' })
    }
    req.user = user
    next()
  } catch (e) {
    return res.status(401).json({ status: 401, error: 'Token inválido ou expirado' })
  }
}
```

Fluxo:
1. Extrai o header `Authorization`
2. Verifica prefixo `Bearer `
3. Verifica e decodifica o JWT com `jwt.verify` (valida assinatura e expiração)
4. Consulta o banco para garantir que o usuário ainda existe e está ativo
5. Injeta `req.user` com os dados completos do usuário para os handlers seguintes

**Tratamento de erros:** todos os erros retornam 401 com JSON `{ status: 401, error: string }`. Erros de validação de input retornam 400. Conflitos (duplicatas) retornam 409. Recursos não encontrados retornam 404.

---

### 4.5 Lógica de Negócio Relevante

#### Streak — Cálculo e Reset

O streak é calculado **no momento em que uma lição é concluída** (`POST /api/user/lessons/:lessonId/complete`):

```javascript
const today     = new Date().toISOString().slice(0, 10)
const lastAct   = freshUser.last_activity_at?.slice(0, 10) ?? null
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

let newStreak
if (lastAct === today) {
  newStreak = freshUser.streak_days           // já jogou hoje, mantém
} else if (lastAct === yesterday) {
  newStreak = freshUser.streak_days + 1       // dia consecutivo, incrementa
} else {
  newStreak = 1                               // quebrou o streak, reinicia do 1
}
```

O campo `last_activity_at` é atualizado para `datetime('now')` a cada conclusão de lição e também quando o quiz diário é respondido corretamente.

**Bônus de streak** no login: verificado em milestones 7, 30 e 100 dias. O bônus (50, 200 ou 500 XP respectivamente) só é creditado uma vez por dia via `streak_rewarded_at`.

---

#### XP — Quando é ganho e valores

| Evento | XP ganho |
|--------|---------|
| Lição simples (Trilha 1) | 30–60 XP (definido por lição) |
| Lição BOSS | 100–120 XP |
| Quiz diário correto | +25 XP |
| Desafio semanal | +20–80 XP (por desafio) |
| Streak milestone 7 dias | +50 XP (bônus no login) |
| Streak milestone 30 dias | +200 XP (bônus no login) |
| Streak milestone 100 dias | +500 XP (bônus no login) |
| Via `POST /api/user/xp` | Valor livre (uso interno) |

---

#### Quiz Diário — Rotação por Dia do Ano

```javascript
function getDailyQuestion() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  const idx = dayOfYear % DAILY_QUESTIONS.length  // 15 perguntas
  return { ...DAILY_QUESTIONS[idx], date: today, index: idx }
}
```

A pergunta muda a cada dia de forma determinística (baseada no dia do ano). Com 15 perguntas, o ciclo se repete a cada 15 dias. Nenhum estado é guardado por pergunta — qualquer servidor com o mesmo array retornaria a mesma pergunta para a mesma data.

---

#### Desafios Semanais — Rotação Determinística

```javascript
function getWeekKey() {
  // Retorna "2026-W23" (ano + número da semana ISO)
}

function getWeeklyChallenges() {
  const wk   = getWeekKey()
  const seed = parseInt(wk.replace(/\D/g, ''), 10)  // ex: 202623
  const idx1 = seed % WEEKLY_CHALLENGES.length        // % 8
  const idx2 = (seed + 2) % WEEKLY_CHALLENGES.length
  const idx3 = (seed + 5) % WEEKLY_CHALLENGES.length
  return [WEEKLY_CHALLENGES[idx1], WEEKLY_CHALLENGES[idx2], WEEKLY_CHALLENGES[idx3]]
}
```

8 desafios disponíveis, 3 ativos por semana. A seleção é determinística (mesmo resultado para qualquer servidor na mesma semana). Os offsets (+2, +5) garantem variedade entre os 3 desafios selecionados.

**8 desafios disponíveis:**

| ID | Título | XP |
|----|--------|----|
| `complete_3_lessons` | Estude 3 lições | 50 |
| `log_5_expenses` | Registre 5 gastos | 30 |
| `7_day_streak` | Streak de 7 dias | 75 |
| `complete_quiz` | Responda o quiz diário | 25 |
| `set_financial_goal` | Defina uma meta | 40 |
| `complete_5_lessons` | Estude 5 lições | 80 |
| `use_simulator` | Use o simulador | 20 |
| `log_income` | Registre sua renda | 20 |

---

## 5. Features Implementadas (15 features)

### Feature 1 — Simulador de Renda Fixa

**Resumo técnico:** Nova aba `rendafixa` na `SimulatorPage`. Implementa cálculo de IR regressivo para CDB e Tesouro Selic (22,5% <= 6m → 20% → 17,5% → 15% > 24m), com LCI/LCA marcados como isentos. Exibe comparativo lado a lado com badge "Melhor opção" no produto de maior rendimento líquido.

**Arquivos modificados:** `frontend/src/pages/app/SimulatorPage.tsx`

**Decisões de design:** todas as taxas são editáveis via input numérico (não sliders), permitindo comparar cenários reais. O badge "Melhor opção" é calculado dinamicamente a cada re-render usando `useMemo`.

---

### Feature 2 — Mapa de Trilhas Visual

**Resumo técnico:** Reescrita completa da `LessonsPage`. Lições renderizadas como nós circulares em layout zigzag com linhas SVG de conexão. Usa accordion por trilha para colapso/expansão. Nós completados identificados por comparação com array retornado por `GET /api/user/progress`.

**Arquivos modificados:** `frontend/src/pages/app/LessonsPage.tsx`

**Decisões de design:** nós alternando direita/esquerda simulam trilha de jogo mobile. Trilhas bloqueadas não têm links clicáveis. Card BOSS tem estilo visual diferenciado (fundo azul escuro, badge ⚔️).

---

### Feature 3 — Quiz Diário

**Resumo técnico:** Nova tabela `daily_quiz_answers` com constraint UNIQUE em `(user_id, quiz_date)`. 15 perguntas hardcoded no servidor, selecionadas por `dayOfYear % 15`. Frontend consome `GET /api/quiz/daily` (retorna estado já respondido ou não) e `POST /api/quiz/answer`.

**Arquivos modificados:** `backend-node/server.js`, `frontend/src/components/ui/DailyQuiz.tsx`, `frontend/src/pages/app/DashboardPage.tsx`

**Decisões de design:** o endpoint `GET /quiz/daily` retorna `answered: true` com a resposta correta e explicação se o usuário já respondeu, permitindo o frontend mostrar o resultado mesmo após reload.

---

### Feature 4 — Flashcards

**Resumo técnico:** Toggle entre modo "Lista" e "Flashcards" na `GlossaryPage`. Flip 3D implementado com CSS `transform: rotateY(180deg)` e `perspective`. Statuses (`unseen` / `know` / `review`) persistidos em `localStorage`.

**Arquivos modificados:** `frontend/src/pages/app/GlossaryPage.tsx`

**Decisões de design:** sem backend — toda a lógica de progresso é client-side. Filtro "Para rever" mostra apenas cards com status `review`.

---

### Feature 5 — Relatório PDF

**Resumo técnico:** Dependência `jspdf ^4.2.1` adicionada. Função `exportFinancePDF` gera PDF A4 inteiramente client-side. Botão "PDF" aparece no seletor de mês apenas na aba Resumo.

**Arquivos modificados:** `frontend/src/utils/exportPDF.ts` (novo), `frontend/src/pages/app/FinancePage.tsx`, `frontend/package.json`

**Decisões de design:** PDF gerado client-side elimina necessidade de backend para exportação. Nome do arquivo inclui o mês formatado em português.

---

### Feature 6 — Análise de Gastos

**Resumo técnico:** Componente `SpendingAnalysis` carrega automaticamente dados do mês anterior via API. Algoritmo `buildAnalysis` compara totais, categorias com maior variação, taxa de poupança e presença de investimentos. Gera até 5 bullets contextualizados.

**Arquivos modificados:** `frontend/src/components/ui/SpendingAnalysis.tsx` (novo), `frontend/src/pages/app/FinancePage.tsx`

**Decisões de design:** o componente recebe os dados do mês atual como props e busca o mês anterior internamente, mantendo a `FinancePage` como single source of truth para o estado principal.

---

### Feature 7 — Calculadora FIRE

**Resumo técnico:** Nova aba `fire` na `SimulatorPage`. Fórmula: patrimônio necessário = gastos mensais / (taxa de retirada / 12). Calcular anos até FIRE comparando aporte mensal + patrimônio atual vs meta, usando taxa de retorno anual. Gráfico de linha Recharts mostrando projeção de patrimônio vs linha horizontal do número FIRE.

**Arquivos modificados:** `frontend/src/pages/app/SimulatorPage.tsx`

**Decisões de design:** seletor de taxa de retirada segura (3% a 5%) como botões discretos, não slider, pois são valores consagrados na literatura FIRE.

---

### Feature 8 — Recorrência em Despesas

**Resumo técnico:** Tabela `recurring_expenses` como repositório de templates. O endpoint `POST /api/user/expenses/apply-recurring` itera sobre templates ativos e insere na tabela `expenses` as que ainda não existem no mês (verificação por description + category + amount). Chamado automaticamente pelo frontend ao trocar o mês.

**Arquivos modificados:** `backend-node/server.js`, `frontend/src/pages/app/FinancePage.tsx`

**Decisões de design:** soft delete via `active = 0` preserva histórico. A verificação de existência no `apply-recurring` usa combinação de 3 campos para evitar falsos positivos.

---

### Feature 9 — Sistema de Níveis

**Resumo técnico:** Array `LEVELS` com 9 níveis definindo range de XP, título, emoji e classes Tailwind para cores. Funções `getLevelInfo` e `getLevelProgress` calculam nível atual e progresso para o próximo. `LevelBadge` renderiza barra de progresso animada via `transition-all duration-700`.

**Arquivos modificados:** `frontend/src/utils/levels.ts` (novo), `frontend/src/components/ui/LevelBadge.tsx` (novo), `frontend/src/pages/app/DashboardPage.tsx`, `frontend/src/pages/app/ProfilePage.tsx`

**Decisões de design:** cores diferentes por tier de nível (azul→verde→roxo→amarelo na barra de progresso) sem lógica condicional complexa.

---

### Feature 10 — Desafios Semanais

**Resumo técnico:** 8 desafios definidos no servidor, 3 ativos por semana calculados deterministicamente por `getWeeklyChallenges()`. Constraint UNIQUE em `(user_id, week_key, challenge_id)` impede completar o mesmo desafio duas vezes. XP creditado diretamente no `UPDATE users` ao completar.

**Arquivos modificados:** `backend-node/server.js`, `frontend/src/components/ui/WeeklyChallenges.tsx` (novo), `frontend/src/pages/app/DashboardPage.tsx`

**Decisões de design:** o frontend não valida se o desafio foi realmente cumprido (ex: verificar se o usuário realmente estudou 3 lições). Confiança no usuário — o botão "+XP" é auto-reportado.

---

### Feature 11 — Histórico de Atividade

**Resumo técnico:** `GET /api/user/activity` consolida 4 fontes de atividade (lições, despesas, quizzes, desafios) em um mapa `{ "YYYY-MM-DD": count }`. Frontend gera grid de 26×7 células com 5 níveis de intensidade de verde.

**Arquivos modificados:** `backend-node/server.js`, `frontend/src/components/ui/ActivityCalendar.tsx` (novo), `frontend/src/pages/app/ProfilePage.tsx`

**Decisões de design:** mesmo padrão visual do GitHub contribution graph — reconhecível e intuitivo sem necessitar legenda explicativa.

---

### Feature 12 — Compartilhamento de Conquistas

**Resumo técnico:** Botão "Compartilhar" em conquistas desbloqueadas usa `navigator.share()` (Web Share API) quando disponível no dispositivo, com fallback para `navigator.clipboard.writeText()`. Toast de confirmação via `react-hot-toast` importado dinamicamente.

**Arquivos modificados:** `frontend/src/pages/app/ProfilePage.tsx`

**Decisões de design:** importação dinâmica do toast (`import('react-hot-toast')`) evita dependência circular em um callback de evento.

---

### Feature 13 — Notificações In-App

**Resumo técnico:** Componente `NotificationBell` gera notificações automaticamente com base no estado do usuário e resultado de chamadas à API. IDs únicos por data/semana previnem duplicatas. Estado persistido em `localStorage` com limite de 30 itens.

**Arquivos modificados:** `frontend/src/components/ui/NotificationBell.tsx` (novo), `frontend/src/components/layout/AppLayout.tsx`

**Decisões de design:** `useEffect` com dependências `[user?.totalXp, user?.streakDays]` dispara reavaliação de notificações quando o usuário ganha XP. Sem polling — notificações são geradas reativamente.

---

### Feature 14 — Onboarding

**Resumo técnico:** Modal com overlay `backdrop-blur-sm` e z-index 50. 6 passos com dados estáticos hardcoded. Condição de exibição: `user.totalXp < 200` e `localStorage.getItem('investup_onboarding_done')` nulo.

**Arquivos modificados:** `frontend/src/components/ui/OnboardingTour.tsx` (novo), `frontend/src/pages/app/DashboardPage.tsx`

**Decisões de design:** threshold de 200 XP (equivalente ao nível 2 "Curioso") em vez de 0 XP captura usuários que completaram 1-2 lições mas nunca viram o tour.

---

### Feature 15 — Dark Mode Completo

**Resumo técnico:** Tailwind `darkMode: 'class'` já configurado. `ThemeContext` aplica/remove classe `dark` no `document.documentElement`. Toggle persistido em `localStorage`. Todos os 15 novos componentes criados com classes `dark:` nas cores de fundo, texto e borda.

**Arquivos modificados:** todos os novos componentes criados na sprint. `ThemeContext.tsx` verificado como já correto.

**Decisões de design:** implementação via classe CSS em vez de media query (`prefers-color-scheme`) permite que o usuário sobreponha a preferência do sistema operacional.

---

## 6. Segurança

### Autenticação JWT

- **Algoritmo:** HS256 (padrão do `jsonwebtoken`)
- **Secret:** string hardcoded no `server.js` (adequado para projeto acadêmico — em produção deve usar variável de ambiente)
- **Expiração:** `24h` — tokens expiram após 24 horas
- **Payload:** `{ sub: user.email, id: user.id }`
- **Validação:** `jwt.verify()` lança exceção se o token for inválido, expirado ou adulterado

### Hash de Senhas

```javascript
const hashedPassword = bcrypt.hashSync(password, 10)  // salt rounds = 10
```

Senhas nunca são armazenadas em texto plano. `bcrypt.compareSync()` é usado na verificação de login e alteração de senha. Salt rounds = 10 é o padrão recomendado, gerando ~100ms de processamento por operação.

### CORS

Apenas origens explicitamente listadas são permitidas:
- `http://localhost:5173` (Vite dev padrão)
- `http://localhost:5174` (Vite dev alternativo)
- `http://localhost:3000`
- `process.env.FRONTEND_URL` (configurável para produção)

`credentials: true` permite envio de cookies.

### Validação de Inputs

- **Registro:** nome >= 2 chars, regex de e-mail, senha >= 6 chars
- **Login:** campos não vazios
- **Despesas:** todos os campos obrigatórios validados antes do INSERT
- **Perfil:** valores de `investorProfile` validados contra enum `['CONSERVADOR', 'MODERADO', 'ARROJADO']`
- **Senha:** nova senha >= 6 chars, senha atual verificada via bcrypt

### Ownership Verification

Todas as operações de DELETE e algumas de PATCH verificam que o recurso pertence ao usuário autenticado:

```javascript
const existing = db.prepare('SELECT id FROM expenses WHERE id = ? AND user_id = ?')
  .get(req.params.id, req.user.id)
if (!existing) return res.status(404).json({ error: 'Despesa não encontrada' })
```

### Pontos de Atenção para Produção

1. **JWT_SECRET hardcoded** — mover para variável de ambiente `process.env.JWT_SECRET`
2. **SQLite** — não suporta múltiplas escritas concorrentes. Para alta concorrência, migrar para PostgreSQL
3. **Rate limiting** — não implementado. Adicionar `express-rate-limit` nos endpoints de auth
4. **HTTPS** — toda comunicação deve usar TLS em produção
5. **Helmet.js** — adicionar headers de segurança HTTP
6. **Tokens de refresh** — expiração de 24h é longa; considerar refresh tokens com expiração curta

---

## 7. Performance e Boas Práticas

### `useMemo` e `useCallback`

- **`AuthContext`:** `login`, `register`, `logout` e `updateUser` são envoltos em `useCallback`, prevenindo recriação desnecessária em re-renders do contexto
- **`SimulatorPage`:** cálculos de projeção financeira (ex: `generatePoints`) usam `useMemo` com dependências nos sliders de input
- **`FinancePage`:** `useMemo` para derivar dados agregados (total por categoria, percentuais) a partir da lista de despesas

### Persistência Client-Side (localStorage)

| Chave | Valor | Componente responsável |
|-------|-------|----------------------|
| `investup_token` | JWT string | AuthContext |
| `investup_user` | JSON User | AuthContext |
| `investup_theme` | `'light'` ou `'dark'` | ThemeContext |
| `investup_flashcard_status` | `Record<string, CardStatus>` | GlossaryPage |
| `investup_onboarding_done` | `'true'` | OnboardingTour |
| `investup_notifications` | `Notification[]` (máx. 30) | NotificationBell |

### better-sqlite3 — API Síncrona

`better-sqlite3` usa uma API completamente síncrona em vez de callbacks/promises, o que é incomum no ecossistema Node.js. Isso é possível porque SQLite é uma biblioteca de arquivo local (sem latência de rede).

**Vantagens:**
- Código mais simples sem `async/await` no backend
- Sem risco de callback hell
- Performance superior para operações simples (sem overhead de event loop)

**Desvantagem:** em operações longas, bloqueia o thread. Para o volume de um projeto acadêmico, isso é irrelevante.

### Lazy Imports

O `AuthContext` usa importação dinâmica do `react-hot-toast` para o streak reward, evitando que o toast seja carregado no bundle principal:

```javascript
import('react-hot-toast').then(({ default: toast }) => {
  toast.success(message, { duration: 5000, icon: '🔥' })
})
```

O mesmo padrão é usado no `ProfilePage` para o toast de compartilhamento.

### Tratamento de Erros Assíncronos

Todos os `useEffect` que fazem chamadas API usam `.catch(() => {})` silencioso — preferível a crashar o componente inteiro por falha de rede. Componentes como `ActivityCalendar` e `WeeklyChallenges` retornam `null` se os dados não carregarem.

---

## 8. Testes E2E

### Visão Geral

```
Executado em: 06/06/2026
Duração:      65.3 segundos
Resultado:    72 PASS · 0 FAIL · 0 WARN
```

O único falso negativo foi o step 13.3 (painel de notificações), causado por seletor incorreto no script de teste. Os steps subsequentes 13.4 e 13.5 confirmam que o painel funcionou corretamente.

### Cobertura

- **15 features** testadas (mais Feature 0: Autenticação)
- **72 checks** automatizados
- **24 screenshots** capturados (listados no `E2E_REPORT.md`)
- **4 usuários demo** utilizados nos testes

### Como Rodar

```bash
# No diretório InvestUp-Web/
node e2e_test.js
```

**Pré-requisitos:**
- Node.js instalado
- Playwright instalado (`npm install @playwright/test` + `npx playwright install`)
- Backend rodando em `http://localhost:8080`
- Frontend rodando em `http://localhost:5173`

**O que o teste faz:**
1. Abre um navegador Chromium headless
2. Faz login com usuário demo (`demo@investup.com` / `demo123`)
3. Navega por todas as páginas e verifica presença de elementos-chave
4. Executa interações: flip de flashcard, completar desafio, toggle de dark mode, etc.
5. Captura screenshots em pontos críticos
6. Relata cada check com PASS/FAIL

### Screenshots Gerados

Os 24 screenshots cobrem todos os estados principais: login, cada feature visualmente, dark mode em múltiplas telas, onboarding, notificações e conquistas.

---

## 9. Setup e Execução

### Pré-requisitos

- Node.js >= 18.x
- npm >= 9.x

### Instalação

```bash
# Backend
cd InvestUp-Web/backend-node
npm install

# Frontend
cd ../frontend
npm install
```

### Variáveis de Ambiente

O backend aceita as seguintes variáveis de ambiente (todas opcionais — têm valores padrão):

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `8080` | Porta do servidor Express |
| `DB_PATH` | `./investup.db` | Caminho do arquivo SQLite |
| `FRONTEND_URL` | — | URL adicional de origem permitida no CORS (para produção) |

### Comandos de Desenvolvimento

```bash
# Backend (em InvestUp-Web/backend-node/)
node server.js

# Frontend (em InvestUp-Web/frontend/)
npm run dev      # servidor Vite em http://localhost:5173
npm run build    # build de produção (TypeScript + Vite)
npm run preview  # preview do build de produção
npm run lint     # ESLint
```

### Usuários Demo Disponíveis

| E-mail | Senha | Usuário | XP | Streak | Observação |
|--------|-------|---------|-----|--------|-----------|
| `demo@investup.com` | `demo123` | Demo InvestUp | 450 | 7 | Usuário principal de testes |
| `italoruy1@gmail.com` | `teste123` | Italo | 0 | 0 | — |
| `patinhas@demo.com` | `demo123` | Tio Patinhas | 12.000 | 30 | Nível Gestor — selo Cofre de Ouro |
| `gekko@demo.com` | `demo123` | Gordon Gekko | 3.500 | 10 | Perfil Arrojado — selo A Ganância é Boa |
| `julius@demo.com` | `demo123` | Julius | 800 | 14 | Perfil Conservador — selo Mestre da Economia |
| `tartaruga@demo.com` | `demo123` | Tartaruga | 400 | 21 | streak alto, XP baixo — selo Devagar e Sempre |
| `madruga@demo.com` | `demo123` | Seu Madruga | 0 | 0 | — selo Sem Fundos |
| `iniciante@demo.com` | `demo123` | Iniciante | 250 | 2 | — |

Os usuários são criados automaticamente na primeira execução do servidor via `seedUsers()` — apenas se não existirem (verificado por e-mail).

---

## 10. Decisões Arquiteturais

### Por que SQLite?

SQLite foi escolhido por ser zero-configuração: não requer instalar, configurar ou subir um servidor de banco de dados separado. O banco inteiro é um único arquivo `investup.db` que persiste entre reinicializações. Para um projeto acadêmico com poucos usuários simultâneos, a limitação de concorrência de escritas do SQLite não é relevante. `better-sqlite3` é preferido ao driver `sqlite3` tradicional por oferecer API síncrona.

### Por que Vite + React + Tailwind?

- **Vite:** build tool moderna com HMR (Hot Module Replacement) instantâneo e build de produção otimizado com Rollup. Start do servidor de dev em < 1 segundo.
- **React 18:** framework mais utilizado no mercado, com ecossistema maduro. `useContext` + `useState` são suficientes para o volume de estado gerenciado.
- **Tailwind CSS:** utility-first elimina a necessidade de criar/nomear classes CSS. Dark mode via `dark:` prefix integrado nativamente. Purge automático de classes não usadas no build de produção.
- **TypeScript:** detecção de erros em tempo de compilação, melhor DX com autocompletar de tipos de props e retornos de API.

### Por que better-sqlite3 (API síncrona)?

A API síncrona do `better-sqlite3` simplifica drasticamente o código do servidor. Em vez de `await db.query(...)`, usa-se `db.prepare(...).get(...)` diretamente. Isso é seguro porque o SQLite é local (sem latência de rede) e o Node.js usa um único thread, então bloqueios são de microsegundos. O resultado é código mais legível sem promises ou callbacks.

### localStorage para Estado Cliente vs Server-Side

Sessão de autenticação (`token` + `user`), tema, progresso de flashcards, onboarding e notificações são armazenados no `localStorage` do cliente. Isso evita chamadas adicionais ao servidor para restaurar estado entre sessões e permite que o app funcione mesmo com pequenas interrupções de rede (exceto para dados que precisam ser sincronizados).

Estado crítico (XP, streak, conquistas, despesas) é sempre persistido no servidor — o `localStorage` é apenas um cache do lado do cliente.

### Dark Mode via Classe CSS vs Media Query

A implementação usa `darkMode: 'class'` do Tailwind (classe `dark` no `<html>`) em vez de `@media (prefers-color-scheme: dark)`. Isso permite que o usuário escolha o tema independentemente da preferência do sistema operacional. A classe é aplicada/removida pelo `ThemeContext` com efeito colateral no `useEffect`, e o estado é persistido no `localStorage` para sobreviver a recarregamentos.

### Roteamento Aninhado

O React Router v6 com `<Outlet />` permite que o `AppLayout` (sidebar + topbar) seja renderizado uma única vez como componente pai, com as páginas sendo injetadas como filhas. Isso evita desmontagem/remontagem do layout a cada navegação, mantendo animações suaves e estado de UI (ex: notificações abertas) entre transições de página.

---

*Documentação gerada automaticamente com base na leitura completa do código-fonte em 06/06/2026.*
