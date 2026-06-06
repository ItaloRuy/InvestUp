# InvestUp-Web — Dev Log de Features

Registro de todas as features implementadas, com status, data e observações.

---

## Status Geral

| # | Feature | Status | Data |
|---|---------|--------|------|
| 1 | Simulador de Renda Fixa (CDB/Tesouro/LCI/LCA + IR) | ✅ Concluído | 2026-06-05 |
| 2 | Mapa de trilhas visual (nós conectados, cadeados, estrelas) | ✅ Concluído | 2026-06-05 |
| 3 | Quiz diário com XP bônus | ✅ Concluído | 2026-06-05 |
| 4 | Flashcards de termos do glossário | ✅ Concluído | 2026-06-05 |
| 5 | Exportar relatório mensal em PDF | ✅ Concluído | 2026-06-05 |
| 6 | Análise textual de gastos (comparativo mês a mês) | ✅ Concluído | 2026-06-05 |
| 7 | Calculadora FIRE (Independência Financeira) | ✅ Concluído | 2026-06-06 |
| 8 | Recorrência em despesas (automático todo mês) | ✅ Concluído | 2026-06-06 |
| 9 | Sistema de níveis com título (Poupador → Lenda) | ✅ Concluído | 2026-06-06 |
| 10 | Desafios semanais com XP extra | ✅ Concluído | 2026-06-06 |
| 11 | Histórico de atividade (calendário estilo GitHub) | ✅ Concluído | 2026-06-06 |
| 12 | Compartilhamento de conquistas | ✅ Concluído | 2026-06-06 |
| 13 | Notificações in-app (sino no header) | ✅ Concluído | 2026-06-06 |
| 14 | Onboarding para novos usuários (tour 6 passos) | ✅ Concluído | 2026-06-06 |
| 15 | Dark mode completo | ✅ Concluído | 2026-06-06 |

---

## Detalhes por Feature

---

### Feature 1 — Simulador de Renda Fixa

**Status:** ✅ Concluído | **Data:** 2026-06-05

**Arquivos alterados:**
- `frontend/src/pages/app/SimulatorPage.tsx` — nova aba `rendafixa`

**O que foi feito:**
- Nova aba "🏦 Renda Fixa" no SimulatorPage (6ª aba)
- 4 produtos: CDB, Tesouro Selic, LCI, LCA com taxas editáveis via input numérico
- Cálculo de IR regressivo: 22,5% (≤6m) → 20% (7-12m) → 17,5% (13-24m) → 15% (>24m)
- Comparativo lado a lado: bruto, IR, líquido, rentabilidade
- Badge "Melhor opção" no produto com maior rendimento líquido
- LCI/LCA marcados como "isento IR"

---

### Feature 2 — Mapa de Trilhas Visual

**Status:** ✅ Concluído | **Data:** 2026-06-05

**Arquivos alterados:**
- `frontend/src/pages/app/LessonsPage.tsx` — reescrita completa

**O que foi feito:**
- Lições como nós circulares alternando esquerda/direita (zigzag)
- Linhas de conexão coloridas por trilha (azul, verde, laranja)
- Nós verdes com ✅ para lições concluídas
- Cadeado 🔒 para lições/trilhas bloqueadas
- Card BOSS com fundo azul escuro e badge ⚔️
- Trilhas colapsáveis (accordion) com barra de progresso X/N
- Badge "Bloqueada" para trilhas não desbloqueadas

---

### Feature 3 — Quiz Diário

**Status:** ✅ Concluído | **Data:** 2026-06-05

**Arquivos alterados:**
- `backend-node/server.js` — tabela `daily_quiz_answers`, rotas `GET/POST /api/quiz/daily|answer`
- `frontend/src/components/ui/DailyQuiz.tsx` — novo componente
- `frontend/src/pages/app/DashboardPage.tsx` — integração

**O que foi feito:**
- 15 perguntas rotativas (1 por dia, baseado no dia do ano % 15)
- Card no Dashboard com +25 XP
- Resposta única por dia (backend valida)
- Feedback colorido: verde (acertou +25 XP) ou vermelho (errou + explicação)
- XP atualizado instantaneamente no perfil via `updateUser`

---

### Feature 4 — Flashcards

**Status:** ✅ Concluído | **Data:** 2026-06-05

**Arquivos alterados:**
- `frontend/src/pages/app/GlossaryPage.tsx` — adicionado modo flashcards

**O que foi feito:**
- Toggle "Lista | Flashcards" no Glossário
- Cards com flip animation 3D (CSS `rotateY`)
- Frente: termo + categoria; Verso: definição
- Botões "✅ Eu sei!" e "🔄 Rever depois"
- Progresso salvo em localStorage
- Filtro "Todos" vs "Para rever"
- Barra de progresso do baralho (X/32 termos)
- Navegação com setas e dots
- Botão "Resetar" para recomeçar

---

### Feature 5 — Relatório PDF

**Status:** ✅ Concluído | **Data:** 2026-06-05

**Arquivos alterados:**
- `frontend/src/utils/exportPDF.ts` — novo utilitário com jspdf
- `frontend/src/pages/app/FinancePage.tsx` — botão exportar
- `frontend/package.json` — dependência `jspdf ^4.2.1`

**O que foi feito:**
- Botão "⬇ PDF" no seletor de mês (aba Resumo)
- PDF gerado client-side com jspdf
- Layout: cabeçalho azul InvestUp, cards de resumo (renda/gastos/economizado/poupança), tabela por categoria com IR comparison, últimos lançamentos, rodapé com timestamp
- Download automático com nome `InvestUp_${mês}.pdf`

---

### Feature 6 — Análise de Gastos

**Status:** ✅ Concluído | **Data:** 2026-06-05

**Arquivos alterados:**
- `frontend/src/components/ui/SpendingAnalysis.tsx` — novo componente
- `frontend/src/pages/app/FinancePage.tsx` — integração

**O que foi feito:**
- Componente carrega dados do mês anterior via API
- Gera bullets de análise com 4 tipos: ✅ good / ⚠️ warn / 🚨 danger / 💡 info
- Compara: total de gastos vs mês anterior (%), maior aumento/redução por categoria, taxa de poupança, presença de investimentos
- Aparece automaticamente na aba Resumo
- Label "vs. [mês anterior]" no cabeçalho

---

### Feature 7 — Calculadora FIRE

**Status:** ✅ Concluído | **Data:** 2026-06-06

**Arquivos alterados:**
- `frontend/src/pages/app/SimulatorPage.tsx` — nova aba `fire`

**O que foi feito:**
- 6ª aba "🔥 FIRE" no Simulador
- Sliders: gastos mensais, aporte mensal, patrimônio atual, retorno anual
- Seletor de taxa de retirada segura: 3% / 3.5% / 4% / 4.5% / 5%
- Card azul escuro com "Seu número FIRE" em destaque
- Cards: renda passiva mensal, falta acumular, anos até FIRE
- Gráfico de projeção com linha de patrimônio vs número FIRE
- Insight textual adaptado ao prazo calculado

---

### Feature 8 — Recorrência em Despesas

**Status:** ✅ Concluído | **Data:** 2026-06-06

**Arquivos alterados:**
- `backend-node/server.js` — tabela `recurring_expenses`, 4 rotas
- `frontend/src/pages/app/FinancePage.tsx` — toggle recorrente + painel

**O que foi feito:**
- Tabela `recurring_expenses` como templates
- Toggle "🔁 Recorrente todo mês" no formulário de novo gasto
- Ao abrir qualquer mês, `apply-recurring` insere automaticamente os templates que ainda não estão no mês
- Painel "Recorrentes ativos (N)" na aba Lançamentos com lista e botão de excluir
- Funciona transparentemente: o gasto aparece no 1° do mês seguinte sem ação do usuário

---

### Feature 9 — Sistema de Níveis

**Status:** ✅ Concluído | **Data:** 2026-06-06

**Arquivos alterados:**
- `frontend/src/utils/levels.ts` — novo utilitário com 9 níveis
- `frontend/src/components/ui/LevelBadge.tsx` — componente com barra de progresso
- `frontend/src/pages/app/DashboardPage.tsx` — integração
- `frontend/src/pages/app/ProfilePage.tsx` — integração + jornada de níveis

**O que foi feito:**
- 9 níveis: Poupador(0) → Curioso(200) → Aprendiz(500) → Investidor(1k) → Analista(2.5k) → Trader(5k) → Gestor(10k) → Mestre(20k) → Lenda(50k)
- Componente `LevelBadge` com emoji, nível, título, barra de progresso, "Faltam X XP para [próximo]"
- Visível no Dashboard (após stats) e Perfil
- "Jornada de níveis" no Perfil: grid 3×3 com todos os 9 níveis, os desbloqueados em cor, os restantes em grayscale

---

### Feature 10 — Desafios Semanais

**Status:** ✅ Concluído | **Data:** 2026-06-06

**Arquivos alterados:**
- `backend-node/server.js` — tabela `weekly_challenge_completions`, 2 rotas
- `frontend/src/components/ui/WeeklyChallenges.tsx` — novo componente
- `frontend/src/pages/app/DashboardPage.tsx` — integração

**O que foi feito:**
- 8 tipos de desafios rotacionando por semana (3 ativos por semana)
- Cada semana tem 3 desafios diferentes calculados deterministicamente pelo número da semana
- Botão "+X XP" para marcar como completo (backend valida unicidade por semana)
- Barra de progresso semanal (0/3 → 3/3)
- XP creditado instantaneamente
- Card no Dashboard entre LevelBadge e Quiz do Dia

---

### Feature 11 — Histórico de Atividade

**Status:** ✅ Concluído | **Data:** 2026-06-06

**Arquivos alterados:**
- `backend-node/server.js` — rota `GET /api/user/activity`
- `frontend/src/components/ui/ActivityCalendar.tsx` — novo componente
- `frontend/src/pages/app/ProfilePage.tsx` — integração

**O que foi feito:**
- Calendário estilo GitHub: 26 semanas × 7 dias
- Cores de intensidade: cinza (0) → verde claro (1) → verde médio (2) → verde escuro (3+)
- Dados consolidados de: lições concluídas, despesas cadastradas, quizzes respondidos, desafios completados
- Labels de meses (Jan, Fev, ...) e dias (Dom, Ter, Qui, Sáb)
- Stats: "X dias ativos · Y ações" no cabeçalho
- Legenda "Menos → Mais"

---

### Feature 12 — Compartilhamento de Conquistas

**Status:** ✅ Concluído | **Data:** 2026-06-06

**Arquivos alterados:**
- `frontend/src/pages/app/ProfilePage.tsx` — botão compartilhar em conquistas

**O que foi feito:**
- Botão "Compartilhar" em cada conquista desbloqueada (ao lado da data de desbloqueio)
- Usa `navigator.share()` (Web Share API nativa) quando disponível
- Fallback: copia texto para clipboard com `navigator.clipboard.writeText()`
- Toast de confirmação após copiar
- Conquistas bloqueadas não mostram o botão

---

### Feature 13 — Notificações In-App

**Status:** ✅ Concluído | **Data:** 2026-06-06

**Arquivos alterados:**
- `frontend/src/components/ui/NotificationBell.tsx` — novo componente
- `frontend/src/components/layout/AppLayout.tsx` — integração sidebar + topbar mobile

**O que foi feito:**
- Sino 🔔 com badge de contagem na sidebar (desktop) e topbar (mobile)
- 3 tipos de notificações geradas automaticamente:
  - 🔥 Streak em risco (após 20h se streak > 0)
  - 🧠 Quiz do dia disponível
  - ⚡ Desafios da semana pendentes
- Painel dropdown com lista de notificações (max 30 salvas)
- "Marcar todas lidas" + indicador de não lida (ponto azul)
- Persistência em localStorage
- Clique em notificação navega para a tela relevante

---

### Feature 14 — Onboarding

**Status:** ✅ Concluído | **Data:** 2026-06-06

**Arquivos alterados:**
- `frontend/src/components/ui/OnboardingTour.tsx` — novo componente
- `frontend/src/pages/app/DashboardPage.tsx` — integração

**O que foi feito:**
- Tour de 6 passos para novos usuários (XP < 200, primeira visita)
- Modal centralizado com overlay desfocado
- Passos: Boas-vindas → Trilhas → Simulador → Finanças → Como ganhar XP → Tudo pronto
- Dots de progresso clicáveis + "X de 6"
- Barra de progresso no topo do modal
- Navegação: "Voltar" e "Próximo"
- "Fechar" (X) ou clicar no overlay fecha e salva no localStorage
- Não aparece novamente após a primeira visita

---

### Feature 15 — Dark Mode Completo

**Status:** ✅ Concluído | **Data:** 2026-06-06

**Arquivos alterados:**
- `frontend/src/contexts/ThemeContext.tsx` — já existia, verificado correto
- Todos os novos componentes criados com classes `dark:` corretas

**O que foi feito:**
- Tailwind `darkMode: 'class'` já configurado
- ThemeContext já aplicava `dark` na `documentElement`
- Verificado dark mode em: Dashboard, Trilhas (mapa), Glossário, Finanças, Perfil
- Background escuro `rgb(3, 7, 18)`, cards com `bg-gray-900`, texto com `text-gray-100`
- Toggle "Modo claro/escuro" na sidebar persiste em localStorage
- Todos os 15 novos componentes criados seguem o padrão `dark:` do projeto

---

## Resumo de Novos Arquivos

### Backend
- `backend-node/server.js` — 5 novas tabelas + 12 novas rotas

### Frontend — Utilitários
- `src/utils/exportPDF.ts`
- `src/utils/levels.ts`

### Frontend — Componentes
- `src/components/ui/DailyQuiz.tsx`
- `src/components/ui/SpendingAnalysis.tsx`
- `src/components/ui/LevelBadge.tsx`
- `src/components/ui/WeeklyChallenges.tsx`
- `src/components/ui/ActivityCalendar.tsx`
- `src/components/ui/NotificationBell.tsx`
- `src/components/ui/OnboardingTour.tsx`

### Frontend — Páginas alteradas
- `SimulatorPage.tsx` — abas Renda Fixa e FIRE
- `LessonsPage.tsx` — reescrita para mapa visual
- `GlossaryPage.tsx` — modo Flashcards
- `FinancePage.tsx` — PDF export, análise, recorrência
- `DashboardPage.tsx` — Quiz, Desafios, LevelBadge, Onboarding
- `ProfilePage.tsx` — ActivityCalendar, LevelBadge, jornada de níveis, compartilhar conquistas
- `AppLayout.tsx` — NotificationBell
