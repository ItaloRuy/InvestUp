# InvestUp Web 🌐

Plataforma educacional de investimentos gamificada — aprenda renda fixa, ações e FIIs de forma simples e divertida.

---

## Stack de Tecnologia

### Backend Ativo — `backend-node/`

| Tech | Versão | Papel |
|------|--------|-------|
| Node.js | 20+ | Runtime |
| Express | 5.2.1 | Framework HTTP |
| better-sqlite3 | 12.10.0 | Banco de dados SQLite (arquivo `investup.db`) |
| jsonwebtoken | 9.0.3 | Geração/validação de JWT (24h) |
| bcryptjs | 3.0.3 | Hash de senhas (bcrypt, salt 10) |
| cors | 2.8.6 | Middleware CORS |

### Backend Legado — `backend/` (Spring Boot)

> Não está em uso no dev atual. Mantido como referência.

| Tech | Versão | Papel |
|------|--------|-------|
| Java | 8 | Runtime |
| Spring Boot | 2.7.18 | Framework |
| Spring Security | – | Autenticação/Autorização |
| Spring Data JPA + Hibernate | – | ORM |
| H2 Database | – | Banco em memória (dev) |
| jjwt | 0.11.5 | JWT |
| Lombok | – | Geração de boilerplate |
| Maven | 3.9+ | Build tool |

### Frontend — `frontend/`

| Tech | Versão | Papel |
|------|--------|-------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.5.3 | Tipagem estática |
| Vite | 5.3.1 | Build tool + dev server (porta 5173) |
| React Router DOM | 6.24.0 | Roteamento SPA |
| Tailwind CSS | 3.4.4 | Estilização utilitária |
| Axios | 1.7.2 | HTTP client (interceptors de JWT e erros globais) |
| Recharts | 2.12.7 | Gráficos (simulador de carteira) |
| react-hot-toast | 2.4.1 | Notificações toast |
| lucide-react | 0.400.0 | Ícones |
| clsx | 2.1.1 | Classes CSS condicionais |
| PostCSS + Autoprefixer | – | Processamento CSS |
| Google Fonts (Inter) | – | Tipografia |

---

## Como rodar (desenvolvimento)

### Pré-requisitos

- Node.js 20+

### 1. Backend (Node.js/Express)

```bash
cd InvestUp-Web/backend-node
npm install
npm start
```

O backend sobe em: **http://localhost:8080**

O banco SQLite é criado automaticamente em `backend-node/investup.db` na primeira execução.
Usuários de demonstração são inseridos automaticamente (seed).

### 2. Frontend (React + Vite)

```bash
cd InvestUp-Web/frontend
npm install
npm run dev
```

O frontend sobe em: **http://localhost:5173**

O Vite faz proxy automático de `/api` → `http://localhost:8080`.

---

## Usuários de demonstração

| Nome | E-mail | Senha | Perfil |
|------|--------|-------|--------|
| Demo InvestUp | demo@investup.com | demo123 | – |
| Tio Patinhas | patinhas@demo.com | demo123 | Moderado |
| Gordon Gekko | gekko@demo.com | demo123 | Arrojado |
| Julius | julius@demo.com | demo123 | Conservador |
| Tartaruga | tartaruga@demo.com | demo123 | Moderado |
| Seu Madruga | madruga@demo.com | demo123 | – |
| Iniciante | iniciante@demo.com | demo123 | Moderado |

---

## Endpoints da API

### Autenticação (sem token)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro de novo usuário |
| POST | `/api/auth/login` | Login + token JWT (retorna `streakReward` se aplicável) |

### Usuário (requer `Authorization: Bearer <token>`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/user/me` | Dados do usuário logado |
| PATCH | `/api/user/profile` | Atualiza perfil de investidor |
| PATCH | `/api/user/avatar` | Atualiza URL do avatar |
| PATCH | `/api/user/password` | Altera senha |
| POST | `/api/user/xp` | Adiciona XP manualmente |
| GET | `/api/user/progress` | Lista lições completadas |
| POST | `/api/user/lessons/:lessonId/complete` | Conclui lição e concede XP |
| GET | `/api/user/streak-status` | Verifica se streak está em risco |

### Finanças

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/user/expenses?month=YYYY-MM` | Lista despesas do mês |
| POST | `/api/user/expenses` | Cria despesa |
| DELETE | `/api/user/expenses/:id` | Remove despesa |
| GET | `/api/user/income?month=YYYY-MM` | Renda do mês |
| PUT | `/api/user/income` | Define/atualiza renda do mês |
| GET | `/api/user/budget?month=YYYY-MM` | Metas de gastos por categoria |
| PUT | `/api/user/budget` | Define/atualiza meta de categoria |
| GET | `/api/user/goals` | Metas financeiras |
| POST | `/api/user/goals` | Cria meta financeira |
| PATCH | `/api/user/goals/:id` | Atualiza aporte ou dados da meta |
| DELETE | `/api/user/goals/:id` | Remove meta financeira |

### Gamificação e Social

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/ranking` | Top 10 por XP + posição do usuário |
| GET | `/api/user/achievements` | Lista conquistas com data de desbloqueio |
| POST | `/api/user/achievements/:achievement` | Registra conquista (idempotente) |

### Utilitários

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |

---

## Páginas do Frontend

| Rota | Página | Descrição |
|------|--------|-----------|
| `/login` | LoginPage | Autenticação |
| `/register` | RegisterPage | Cadastro com indicador de força de senha |
| `/app` | Dashboard | XP, streak, trilhas, mascote com dicas |
| `/app/trilhas` | Trilhas | 3 trilhas de aprendizado com progresso |
| `/app/trilhas/:trailId/licao/:lessonId` | Lição | Conteúdo em etapas + quiz interativo + XP |
| `/app/simulador` | Simulador | Simulador de carteira com gráficos Recharts |
| `/app/financas` | Finanças | Controle de despesas, renda e resumo mensal |
| `/app/metas` | Metas | Metas financeiras com barra de progresso |
| `/app/ranking` | Ranking | Top 10 usuários por XP |
| `/app/glossario` | Glossário | Termos de investimentos com busca |
| `/app/acoes` | Ações | Ações brasileiras ilustrativas (fins educacionais) |
| `/app/perfil` | Perfil | Conquistas, avatar, alterar senha, perfil de investidor |

---

## Banco de dados (SQLite)

Tabelas criadas automaticamente na primeira execução:

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários (XP, streak, perfil de investidor, avatar) |
| `user_progress` | Progresso nas lições por usuário |
| `expenses` | Despesas mensais por categoria |
| `monthly_income` | Renda mensal por usuário |
| `budget_goals` | Metas de gasto por categoria e mês |
| `financial_goals` | Metas financeiras (título, valor alvo, prazo) |
| `user_achievements` | Conquistas desbloqueadas com data |

---

## Sistema de Gamificação

### Selos (Badges)

| Selo | Personagem | Critério |
|------|-----------|----------|
| 🎩 Cofre de Ouro | Tio Patinhas | XP ≥ 10.000 |
| 📈 A Ganância é Boa | Gordon Gekko | XP ≥ 2.500 + perfil Arrojado |
| 🧾 Mestre da Economia | Julius | Perfil Conservador + streak ≥ 7 dias |
| 🐢 Devagar e Sempre | A Tartaruga | Streak ≥ 14 dias e XP < 1.000 |
| 🌱 Começando a Jornada | Investidor Iniciante | XP entre 100 e 2.499 |
| 😅 Sem Fundos | Seu Madruga | XP < 100 |

### Streak e Recompensas

- Streak incrementa a cada dia com atividade (lição concluída)
- Marcos de bônus: 7 dias (+50 XP), 30 dias (+200 XP), 100 dias (+500 XP)
- Endpoint `/api/user/streak-status` indica se o streak está em risco no dia atual

---

## Estrutura do Projeto

```
InvestUp-Web/
├── backend-node/              ← Backend ativo (Node.js/Express/SQLite)
│   ├── server.js              ← Todas as rotas + lógica + seed
│   ├── investup.db            ← Banco SQLite persistente
│   └── package.json
│
├── backend/                   ← Backend legado (Spring Boot — não utilizado)
│   └── src/main/java/com/investup/api/
│       ├── config/            ← SecurityConfig
│       ├── controller/        ← AuthController, UserController
│       ├── dto/               ← Request/Response DTOs
│       ├── entity/            ← User, UserProgress (JPA)
│       ├── exception/         ← GlobalExceptionHandler
│       ├── repository/        ← JPA repositories
│       ├── security/          ← JwtService, JwtAuthFilter
│       └── service/           ← AuthService
│
└── frontend/                  ← React + Vite + TypeScript + Tailwind
    └── src/
        ├── api/               ← axios client com interceptors JWT
        ├── components/
        │   └── layout/        ← AppLayout (sidebar desktop + bottom nav mobile)
        ├── contexts/          ← AuthContext (JWT + localStorage), ThemeContext
        ├── pages/
        │   ├── auth/          ← LoginPage, RegisterPage
        │   └── app/           ← Dashboard, Trilhas, Lição, Simulador, Finanças,
        │                         Metas, Ranking, Glossário, Ações, Perfil
        ├── types/             ← TypeScript interfaces
        └── utils/             ← badges.ts (lógica de selos)
```

---

## Como funciona a autenticação

```
1. Usuário preenche login → POST /api/auth/login
2. bcryptjs valida senha com hash armazenado
3. jsonwebtoken gera token JWT (validade: 24h)
4. Token retorna no body + salvo no localStorage
5. axios interceptor anexa "Authorization: Bearer <token>" em toda requisição
6. requireAuth middleware valida o token em rotas protegidas
7. Logout → remove token do localStorage + redireciona para /login
```

---

## Observações de Produção

Projeto para fins acadêmicos e educacionais. Antes de usar em produção, implementar:

- Rate limiting nas rotas de auth
- Refresh tokens
- Validação de e-mail no cadastro
- HTTPS
- Variáveis de ambiente para `JWT_SECRET`
