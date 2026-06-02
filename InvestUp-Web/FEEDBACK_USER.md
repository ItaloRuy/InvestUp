# Feedback de Usabilidade e QA — InvestUp Web

Data: 2026-06-02

---

## Resumo Executivo

O InvestUp Web foi testado em profundidade com quatro perfis de usuário (conservador, moderado, arrojado e um usuário demo com histórico prévio), cobrindo autenticação, trilhas de aprendizado, controle financeiro, metas financeiras, conquistas, ranking, streak e segurança. O backend Node.js/Express respondeu de forma estável durante toda a sessão de testes, sem crashes ou timeouts. A arquitetura é simples, compreensível e o modelo de dados relacional com SQLite funciona adequadamente para o volume acadêmico previsto.

A maioria das funcionalidades core está implementada corretamente: autenticação JWT com validações robustas, sistema de lições idempotente, controle financeiro com isolamento por usuário, conquistas com proteção contra duplicatas e ranking por XP. Todos os casos de segurança testados (acesso sem token, token inválido, acesso a recursos de outros usuários) funcionaram conforme o esperado. O ponto mais crítico encontrado é a ausência de incremento automático de streak: não existe nenhuma rota ou lógica que aumente o `streak_days` de um usuário real — o valor é apenas semeado para usuários demo, tornando o sistema de streak inoperante para novos cadastros.

Outros pontos de atenção incluem: (1) `avatar_url` não é retornado pelo endpoint `GET /api/user/me`, apenas pelo endpoint `PATCH /api/user/avatar`, causando inconsistência na UI; (2) o `GET /api/user/budget` não retorna o campo `month` em cada item, enquanto o `PUT` o recebe — assimetria de contrato; (3) o frontend define IDs de lição `X.boss` como guardiões de desbloqueio entre trilhas, mas a tarefa de teste usou `2.6` e `3.6` que não existem no frontend (as trilhas têm `2.1`–`2.5` + `2.boss` e `3.1`–`3.5` + `3.boss`); (4) emojis em metas financeiras aparecem como `??` no banco quando enviados via curl no terminal Windows — confirmou-se que o servidor processa corretamente UTF-8 quando recebe bytes válidos, sendo um problema de encoding de terminal, não do servidor.

---

## Usuarios Testados

| Nome | Email | Perfil | XP Final | Licoes Completas | Conquistas |
|------|-------|--------|----------|------------------|------------|
| Ana Conservadora | ana.conservadora@test.com | CONSERVADOR | 230 | 6 (Trilha 1) | primeiro_passo, trilha_1_completa, 7_dias_streak |
| Bruno Moderado | bruno.moderado@test.com | MODERADO | 300 | 9 (Trilha 1 + 3 da Trilha 2) | primeiro_passo, trilha_1_completa, 7_dias_streak |
| Carlos Arrojado | carlos.arrojado@test.com | ARROJADO | 720 | 18 (Trilhas 1, 2 e 3) | primeiro_passo, trilha_1_completa, 7_dias_streak |
| Demo InvestUp | demo@investup.com | MODERADO | 1110 | 15 (historico + Trilha 2 extra) | primeiro_passo (preexistente), trilha_1_completa, 7_dias_streak |

Nota sobre XP de Ana: apos completar as 6 licoes da Trilha 1 (total 180 XP) foi realizado tambem um POST /api/user/xp de +50 XP no teste de validacao, totalizando 230 XP.

---

## Resultado por Funcionalidade

### Autenticacao

**Status: APROVADO com observacoes**

- `POST /api/auth/register`: funciona corretamente. Registra usuario, retorna token JWT e dados do usuario. Validacoes presentes: nome minimo 2 chars (400), email formato valido (400), senha minimo 6 chars (400), email duplicado (409).
- `POST /api/auth/login`: funciona corretamente. Retorna token e dados atualizados. Inclui logica de `streakReward` quando usuario atinge milestone de 7/30/100 dias de streak.
- `GET /api/user/me`: retorna dados do usuario autenticado. **BUG MENOR**: nao inclui `avatarUrl` na resposta, embora o campo exista no banco e seja retornado pelo `PATCH /api/user/avatar`.
- Autenticacao sem token retorna 401 com mensagem "Token nao fornecido". Token invalido retorna 401 com "Token invalido ou expirado". Comportamento correto.
- Registro: os usuarios foram criados com sucesso na primeira tentativa. Tentativa de registro com email ja existente retornou corretamente 409.
- `PATCH /api/user/profile`: atualiza perfil de investidor (CONSERVADOR/MODERADO/ARROJADO). Validacao correta: perfil inexistente retorna 400.

**Observacao**: o campo `email` e retornado no `userSummary`, o que pode ser considerado informacao sensivel em algumas APIs. Para uso academico nao e um problema, mas em producao seria ideal omiti-lo dos responses publicos.

---

### Trilhas e Licoes

**Status: APROVADO com ressalvas de design**

Todas as licoes foram completadas com sucesso via `POST /api/user/lessons/:lessonId/complete`.

**Idempotencia**: confirmada. Ao tentar completar a licao 1.1 novamente para Ana (que ja estava com status COMPLETED), o sistema retornou os dados do usuario sem incrementar XP ou lessonsCompleted. Comportamento correto e esperado.

**Progresso**: `GET /api/user/progress` retorna array com `lessonId` e `status` em minusculo (`"completed"`). Para Carlos, todos os 18 registros apareceram corretamente.

**XP por trilha testado**:
- Trilha 1: 30 XP por licao (1.1 a 1.6)
- Trilha 2: 40 XP por licao (2.1 a 2.6 via API)
- Trilha 3: 50 XP por licao (3.1 a 3.6 via API)

**DISCREPANCIA CRITICA de IDs**: O frontend define as trilhas com os seguintes IDs reais:
- Trilha 1: `1.1`, `1.2`, `1.3`, `1.4`, `1.5`, `1.6`, `1.boss`
- Trilha 2: `2.1`, `2.2`, `2.3`, `2.4`, `2.5`, `2.boss` (sem `2.6`)
- Trilha 3: `3.1`, `3.2`, `3.3`, `3.4`, `3.5`, `3.boss` (sem `3.6`)

Os IDs `2.6` e `3.6` nao existem no frontend mas foram completados via API nos testes. O desbloqueio entre trilhas depende da conclusao da licao `boss` da trilha anterior (`1.boss` para desbloquear Trilha 2, `2.boss` para desbloquear Trilha 3). Isso significa que Carlos, embora tenha completado 18 licoes via API, na interface grafica nao teria acesso as Trilhas 2 e 3 sem completar as licoes boss. Esta e uma falha de documentacao/especificacao entre o enunciado do teste e a implementacao real.

**Conteudo**: O backend e puramente um armazenador de progresso — o conteudo das licoes e definido inteiramente no frontend (`LessonPage.tsx`). A API aceita qualquer `lessonId` como string, sem validar se o ID corresponde a uma licao existente. Isso e aceitavel para o escopo academico mas significaria um risco em producao.

**Trilha 1 — Fundamentos** (`1.1` a `1.6` + `1.boss`):
- 1.1: "Dinheiro trabalhando por voce" (30 XP, 5 min) — introducao ao conceito de investimento passivo
- 1.2: "Risco x Retorno" (30 XP, 5 min) — relacao fundamental para qualquer investidor
- 1.3: "O poder dos juros compostos" (50 XP, 6 min) — conteudo de alto valor educativo
- 1.4: "Inflacao — o ladrao silencioso" (40 XP, 5 min) — relevante para contexto brasileiro
- 1.5: "Seu perfil de investidor" (30 XP, 5 min) — conecta com o perfil definido no cadastro
- 1.6: "O numero magico dos dividendos" (60 XP, 7 min) — conteudo avancado para uma trilha de fundamentos
- 1.boss: "Monte sua primeira carteira" (100 XP, 8 min) — licao sintetizadora, desbloqueio da Trilha 2

**Trilha 2 — Renda Fixa** (`2.1` a `2.5` + `2.boss`):
- 2.1: "O que e Renda Fixa?" (30 XP, 5 min) — definicao e caracteristicas
- 2.2: "Tesouro Direto" (40 XP, 6 min) — produto mais acessivel para iniciantes
- 2.3: "CDB — o banco te pagando" (35 XP, 5 min) — produto bancario comum
- 2.4: "LCI e LCA — sem pagar imposto" (35 XP, 5 min) — beneficio fiscal importante
- 2.5: "Como comparar e escolher" (40 XP, 6 min) — aplicacao pratica
- 2.boss: "Monte sua carteira de renda fixa" (100 XP, 8 min) — desbloqueio da Trilha 3

**Trilha 3 — Renda Variavel** (`3.1` a `3.5` + `3.boss`):
- 3.1: "O que sao acoes?" (30 XP, 5 min) — conceito base
- 3.2: "Como funciona a bolsa" (35 XP, 5 min) — mecanismos de mercado
- 3.3: "FIIs — o tijolo que paga dividendo" (40 XP, 6 min) — produto popular no Brasil
- 3.4: "ETFs — a cesta de acoes" (35 XP, 5 min) — diversificacao acessivel
- 3.5: "Como analisar uma acao" (50 XP, 7 min) — analise fundamentalista basica
- 3.boss: "Carteira diversificada" (120 XP, 10 min) — sintese da trilha

**Trilha 4 — Cripto** (bloqueada, apenas no frontend, sem licoes testadas via API):
- Presente na UI mas marcada como `locked: true`
- IDs: `4.1` a `4.5` + `4.boss`

**Avaliacao do conteudo**: A sequencia pedagogica e logica e coerente — progride de fundamentos para ativos especificos. Os titulos sao acessiveis e usam linguagem informal que reduz a barreira de entrada. Os quizzes (presentes no LessonPage) cobrem cenarios praticos como "o mercado caiu 20%, o que fazer?" e calculos de juros compostos com valores reais. A progressao de XP (mais XP para licoes mais longas/complexas) incentiva o estudo aprofundado.

---

### Controle Financeiro

**Status: APROVADO com observacoes**

**Ana (2026-06)**:
- Renda: R$ 3.500 — criada e lida corretamente
- Despesas criadas: Alimentacao R$180 (02/06), Alimentacao R$220 (10/06), Transporte R$150 (05/06), Moradia R$800 (01/06), Lazer R$300 (15/06), Saude R$120 (08/06)
- Total criado: 6 despesas. `GET /api/user/expenses?month=2026-06` retornou corretamente todas as 6.
- A despesa de Saude (ID 36) foi deletada e confirmada ausente na listagem seguinte.
- Metas de orcamento: Alimentacao R$400, Lazer R$200 — criadas e lidas corretamente.
- Meta financeira: "Reserva de emergencia" com alvo R$10.500 e aporte inicial R$1.200 — criada corretamente.

**Bruno (2026-06)**:
- Renda: R$ 6.000 — criada e lida corretamente
- Despesas em 6 categorias: Alimentacao R$650, Transporte R$320, Moradia R$2.200, Investimentos R$1.000, Lazer R$280, Saude R$450
- A despesa de Saude (ID 42) foi deletada e confirmada ausente. Restaram 5 despesas (IDs 37-41).
- Metas de orcamento em 3 categorias: Alimentacao R$700, Lazer R$300, Investimentos R$1.200
- 2 metas financeiras: "Aposentadoria" (R$500.000, prazo 2045) e "Viagem Europa" (R$25.000, prazo 2027)

**Observacao — campo `month` no GET budget**: O endpoint `PUT /api/user/budget` recebe e armazena o `month`, mas o `GET /api/user/budget` retorna apenas `category` e `monthlyLimit`, omitindo o `month`. Isso e levemente inconsistente: se o frontend precisar exibir para qual mes e o limite, teria que inferir a partir do parametro de query em vez de ler do response. Nao e um bug critico mas e uma assimetria de API.

**Ordenacao de despesas**: O `GET /api/user/expenses` retorna ordenado por `expense_date DESC, id DESC` — adequado para exibir as mais recentes primeiro.

**Isolamento de usuarios**: Confirmado. Tentativa de deletar despesa de Ana (ID 31) usando token de Bruno retornou `{"error":"Despesa nao encontrada"}` com status 200 (nao 403/404 com HTTP correto), mas sem vazar informacoes ou modificar dados. Tecnicamente deveria retornar 404 e o faz — o status HTTP foi correto.

---

### Metas Financeiras

**Status: APROVADO**

- Carlos criou 3 metas com titulos, emojis, valores-alvo e prazos variados.
- `PATCH /api/user/goals/:id` para atualizar aportes funcionou corretamente para todas as 3.
- DELETE da meta 3 (Carro Novo, ID 8) funcionou. `GET /api/user/goals` subsequente retornou apenas 2 metas.
- Tentativa de PATCH na meta de Ana (ID 3) usando token de Carlos retornou corretamente 404.
- Tentativa de DELETE na meta de Carlos usando token de Ana retornou 404.
- `GET /api/user/goals` retorna ordenado por `deadline ASC` — logico para priorizar metas mais proximas.

**Observacao de emojis**: Os emojis enviados via curl no Windows foram armazenados como `??` no banco devido a limitacao de encoding do terminal. Confirmado via teste com Node.js direto que o servidor processa UTF-8 corretamente — este e um problema exclusivo do ambiente de teste (PowerShell/cmd no Windows), nao do servidor.

---

### Ranking

**Status: APROVADO com observacoes**

`GET /api/ranking` retorna os top 10 usuarios por XP, com campo `myRank` indicando a posicao do usuario autenticado.

**Ranking final observado** (em ordem):
1. Tio Patinhas — 12.000 XP (seed demo)
2. Gordon Gekko — 3.500 XP (seed demo)
3. Demo InvestUp — 1.110 XP
4. Julius — 800 XP (seed demo)
5. Carlos Arrojado — 720 XP
6. Tartaruga — 400 XP (seed demo)
7. Bruno Moderado — 300 XP
8. Iniciante — 250 XP (seed demo)
9. Ana Conservadora — 230 XP (com XP manual adicionado no teste)
10. Italo — 150 XP (seed)

Carlos aparece na 5a posicao, o que e coerente com o esperado dado que os seeds demo tem XP muito maior.

**Observacao**: O ranking inclui os usuarios seed (Tio Patinhas, Gordon Gekko, etc.) que tem XP muito elevado comparado a um usuario real que acabou de comecar. Isso pode desmotivar novos usuarios que verem o ranking e se perceberem distantes do topo. Uma solucao seria mostrar o ranking da semana ou segmentar por nivel.

**Observacao de `myRank`**: O campo e calculado como `COUNT(*)+1 WHERE total_xp > (SELECT total_xp FROM users WHERE id = ?)`. Isso e correto mas pode retornar posicao 1 em caso de empate, ao inves da posicao real. Situacao de borda nao critica para o escopo atual.

---

### Conquistas e Gamificacao

**Status: APROVADO**

- Conquistas registradas para todos os 4 usuarios: `primeiro_passo`, `trilha_1_completa`, `7_dias_streak`.
- `GET /api/user/achievements` retorna lista com `achievement` e `unlockedAt`.
- **Idempotencia confirmada**: POST duplicado na mesma conquista retornou `{"alreadyUnlocked":true}` com status 200 (nao 409). Comportamento adequado.
- O Demo ja tinha `primeiro_passo` registrado — a segunda tentativa retornou corretamente `alreadyUnlocked: true`.

**Observacao**: O sistema de conquistas e "manual" — o backend so registra se o frontend enviar o POST. Nao ha validacao no backend se o usuario realmente merece a conquista (ex: nao verifica se o usuario realmente completou a Trilha 1 antes de conceder `trilha_1_completa`). Para um projeto academico isso e aceitavel, mas poderia ser explorado por um usuario mal-intencionado que conheca a API.

**Conquistas existentes no sistema**: apenas as que sao registradas via POST com qualquer string como nome. Nao ha lista canonica de conquistas validas no backend — qualquer string e aceita. Isso e flexivel mas sem contrato definido.

---

### Perfil (avatar, senha, perfil de investidor)

**Status: APROVADO com bug menor**

**Avatar**:
- `PATCH /api/user/avatar` com `{"avatarUrl": "..."}` funcionou corretamente para Ana.
- A URL e salva no banco e retornada no response do proprio endpoint PATCH.
- **BUG**: `GET /api/user/me` NAO retorna `avatarUrl`. A funcao `userSummary()` omite o campo. O endpoint de avatar retorna `{...userSummary(updated), avatarUrl: updated.avatar_url}` — ou seja, o `avatarUrl` so aparece no response do proprio PATCH, mas nao nas demais respostas que usam `userSummary`. Isso significa que apos um refresh, o frontend nao recebe o avatar via `/me` e teria que armazena-lo no localStorage ou ter uma rota separada.

**Senha**:
- Tentativa com senha incorreta: retornou 401 com `{"error":"Senha atual incorreta"}`. Correto.
- Tentativa com nova senha curta (< 6 chars): retornou 400. Correto.
- Alteracao correta: funcionou. Login subsequente com a nova senha (`novasenha456`) gerou novo token valido. Fluxo completo funcional.

**Perfil de investidor**:
- PATCH funcionou para CONSERVADOR, MODERADO e ARROJADO.
- Tentativa com perfil inexistente retornou 400. Correto.

---

### Streak

**Status: INCOMPLETO — falta logica de incremento**

`GET /api/user/streak-status` retorna:
```json
{"streakDays": N, "lastActivity": "YYYY-MM-DD", "atRisk": bool, "hoursLeft": int|null}
```

Para usuarios novos (Ana, Bruno, Carlos), `streakDays = 0` e `atRisk = false`. Mesmo apos completar licoes, o streak nao aumenta.

Para o Demo, `streakDays = 7` (semeado) e `lastActivity = "2026-06-02"` (atividade registrada via lesson complete), logo `atRisk = false`.

**BUG CRITICO**: Nao existe nenhuma rota ou logica no `server.js` que incrementa `streak_days`. A coluna so e populada durante o seeding de usuarios demo. Um usuario real que use o app diariamente nunca tera seu streak incrementado — o campo permanecera 0 indefinidamente. A logica de `streak-status` existe e funciona corretamente para os dados que recebe, mas os dados nunca sao atualizados. O sistema de `streakReward` no login (bonus de XP a cada milestone) tambem e inoperante para novos usuarios pelo mesmo motivo.

**Campo `last_activity_at`**: e atualizado quando uma licao e completada (`UPDATE users SET last_activity_at = datetime('now')`), mas nao e usado para calcular ou incrementar o streak.

---

## Bugs Encontrados

### BUG 1 — CRITICO: `streak_days` nunca e incrementado
- **Endpoint**: nenhum — falta de implementacao
- **Comportamento atual**: `streak_days` permanece 0 para qualquer usuario criado via register. Completar licoes nao incrementa o streak.
- **Comportamento esperado**: Ao completar uma licao em dias consecutivos, `streak_days` deve ser incrementado. Sugestao: ao completar uma licao, verificar `last_activity_at` — se foi ontem, incrementar streak; se foi hoje, nao mudar; se foi ha mais de 1 dia, resetar para 1.
- **Impacto**: todo o sistema de gamificacao de streak e inoperante para usuarios reais.

### BUG 2 — MEDIO: `avatarUrl` ausente em `GET /api/user/me`
- **Endpoint**: `GET /api/user/me`
- **Comportamento atual**: response omite `avatarUrl` mesmo quando o usuario tem avatar configurado.
- **Comportamento esperado**: o response deve incluir `avatarUrl` (ou `null` se nao configurado).
- **Causa**: a funcao `userSummary()` nao inclui `avatar_url`.
- **Correcao**: adicionar `avatarUrl: user.avatar_url` ao objeto retornado por `userSummary()`.

### BUG 3 — LEVE: `GET /api/user/budget` omite campo `month`
- **Endpoint**: `GET /api/user/budget?month=2026-06`
- **Comportamento atual**: retorna `[{"category":"Alimentacao","monthlyLimit":400}]`
- **Comportamento esperado**: incluir `month` para consistencia com o PUT
- **Impacto**: baixo — o frontend sabe o mes via parametro de query, mas e inconsistente.

### BUG 4 — LEVE: IDs de licao inconsistentes entre documentacao/teste e frontend
- **Contexto**: a especificacao deste teste menciona IDs `2.1`–`2.6` e `3.1`–`3.6`, mas o frontend define Trilha 2 com IDs `2.1`–`2.5`+`2.boss` e Trilha 3 com IDs `3.1`–`3.5`+`3.boss`.
- **Impacto**: IDs `2.6` e `3.6` existem no banco (completados via API) mas nao correspondem a nenhuma licao real no frontend — o progresso fica "fantasma".

### BUG 5 — LEVE: emojis armazenados como `??` em ambiente Windows
- **Contexto**: quando emojis Unicode sao enviados via curl no Windows (terminal CP1252), chegam ao servidor como bytes invalidos e sao armazenados como `??`.
- **Confirmacao**: Node.js direto e browser (UTF-8) armazenam corretamente.
- **Recomendacao**: documentar que a API espera Content-Type: application/json com charset UTF-8.

---

## Observacoes de Usabilidade

**O que funcionou bem**:
- O fluxo de registro + perfil + licoes e direto e sem fricao. Um usuario conseguiria completar a Trilha 1 inteira rapidamente.
- As mensagens de erro sao claras e em portugues: "Nome deve ter pelo menos 2 caracteres", "Senha atual incorreta", etc.
- A idempotencia nas licoes evita penalizacao por double-click ou reconexao.
- O isolamento de dados por usuario e correto — nenhum dado vaza entre contas.
- O ranking mostra o `myRank` junto com o top 10, o que e util para motivacao.
- O sistema de metas financeiras com emoji, titulo, valor-alvo e prazo e simples e pratico.
- A validacao de campos obrigatorios em todas as rotas POST/PUT e consistente.

**O que seria confuso para um usuario real**:
- **Streak sempre zerado**: o usuario completaria licoes todos os dias e nunca veria o streak subir. Isso quebraria a expectativa de gamificacao logo nos primeiros dias de uso.
- **Avatar sumindo apos refresh**: se o frontend busca os dados do usuario via `GET /me` ao carregar a pagina, o avatar configurado nao sera retornado — o usuario pensaria que o avatar foi perdido.
- **Trilhas bloqueadas sem instrucao clara**: um usuario que completou as licoes 1.1–1.6 mas nao sabe da licao `1.boss` nao conseguira desbloquear a Trilha 2. A dependencia de boss-licoes precisa ser comunicada claramente na UI.
- **Falta de feedback de "meta atingida"**: o sistema registra conquistas e orcamentos, mas nao ha notificacao automatica quando o usuario ultrapassa o limite de orcamento ou atinge 100% de uma meta financeira.
- **Conquistas sem validacao**: um usuario poderia chamar `POST /api/user/achievements/qualquer_coisa` e adicionar conquistas inventadas. Nao ha impacto funcional mas quebra a integridade da gamificacao.

---

## Conteudo das Trilhas — Avaliacao

### Trilha 1 — Fundamentos

| ID | Titulo | XP | Tempo | Avaliacao |
|----|--------|----|-------|-----------|
| 1.1 | Dinheiro trabalhando por voce | 30 | 5 min | Excelente introducao. Define o conceito central de investimento como trabalho do capital. |
| 1.2 | Risco x Retorno | 30 | 5 min | Conceito fundamental bem posicionado no inicio. Conteudo essencial para qualquer investidor. |
| 1.3 | O poder dos juros compostos | 50 | 6 min | Ponto alto da trilha. Quizzes com calculos reais (regra dos 72, simulacao de 30 anos) tornam concreto o impacto do tempo. |
| 1.4 | Inflacao — o ladrao silencioso | 40 | 5 min | Muito relevante para o contexto brasileiro. Contextualiza por que deixar dinheiro parado perde valor. |
| 1.5 | Seu perfil de investidor | 30 | 5 min | Conecta com o cadastro. Quizzes com cenarios ("mercado caiu 20%") sao pedagogicamente eficazes. |
| 1.6 | O numero magico dos dividendos | 60 | 7 min | Titulo um pouco críptico. Conteudo avancado para uma trilha de fundamentos — poderia ser licao introdutoria da Trilha 3. |
| 1.boss | Monte sua primeira carteira | 100 | 8 min | Excelente sintetizador. XP elevado recompensa quem chega ao fim. Funcao de desbloqueio e bem sinalizada. |

### Trilha 2 — Renda Fixa

| ID | Titulo | XP | Tempo | Avaliacao |
|----|--------|----|-------|-----------|
| 2.1 | O que e Renda Fixa? | 30 | 5 min | Definicao clara. Introducao adequada antes dos produtos especificos. |
| 2.2 | Tesouro Direto | 40 | 6 min | Produto mais acessivel e popular. Correto priorizar. |
| 2.3 | CDB — o banco te pagando | 35 | 5 min | Nome didatico que explica o produto no titulo. |
| 2.4 | LCI e LCA — sem pagar imposto | 35 | 5 min | O beneficio fiscal e o diferencial mais importante — titulo acerta ao enfatiza-lo. |
| 2.5 | Como comparar e escolher | 40 | 6 min | Aplicacao pratica e necessaria. Boa posicao como penultima licao antes do boss. |
| 2.boss | Monte sua carteira de renda fixa | 100 | 8 min | Sintetizador adequado. Desbloqueio da Trilha 3. |

### Trilha 3 — Renda Variavel

| ID | Titulo | XP | Tempo | Avaliacao |
|----|--------|----|-------|-----------|
| 3.1 | O que sao acoes? | 30 | 5 min | Necessario antes de entrar em bolsa. |
| 3.2 | Como funciona a bolsa | 35 | 5 min | Mecanismos de pregao e liquidez — importante para contexto de compra/venda. |
| 3.3 | FIIs — o tijolo que paga dividendo | 40 | 6 min | Produto muito popular no Brasil para iniciantes. Titulo memoravel. |
| 3.4 | ETFs — a cesta de acoes | 35 | 5 min | Conceito de diversificacao passiva bem colocado. |
| 3.5 | Como analisar uma acao | 50 | 7 min | Licao mais densa e importante. XP maior justificado. |
| 3.boss | Carteira diversificada | 120 | 10 min | XP mais alto de todas as trilhas. Licao final de construcao de carteira completa. |

**Avaliacao geral do conteudo**: A progressao pedagogica e solida — do conceitual ao pratico, do simples ao complexo. Os titulos sao engajantes e usam linguagem acessivel. O uso de emojis como identificadores visuais ajuda na navegacao rapida. A presenca de quizzes com cenarios reais (nao apenas teoricos) e um diferencial positivo para retencao do aprendizado.

---

## Sugestoes de Melhoria

### Prioritarias (impactam funcionalidade core)

1. **Implementar incremento de streak_days**: Ao `POST /api/user/lessons/:id/complete`, verificar `last_activity_at` — se foi ontem, incrementar `streak_days + 1`; se foi mais de 1 dia atras, resetar para 1; se foi hoje, manter. Isso tornara o sistema de gamificacao funcional para todos os usuarios.

2. **Adicionar `avatarUrl` ao `userSummary()`**: Uma linha de codigo. Sem isso, o avatar configurado nao persiste entre sessoes do ponto de vista do front.

3. **Adicionar `month` ao response de `GET /api/user/budget`**: Pequena inconsistencia de contrato que pode causar confusao.

### Melhorias de produto

4. **Validar conquistas no backend**: Criar uma lista de conquistas validas e verificar se o usuario atende ao criterio antes de registrar (ex: `trilha_1_completa` so pode ser concedida se o usuario tem as 7 licoes da Trilha 1 completas, incluindo `1.boss`).

5. **Notificacao de orcamento excedido**: Incluir no response de `GET /api/user/expenses` ou em um endpoint dedicado um alerta quando a soma de despesas de uma categoria supera o `monthly_limit` configurado.

6. **Segmentar ranking**: Adicionar um ranking "da semana" ou por nivel de XP (iniciante/intermediario/avancado) para evitar desmotivacao de novos usuarios que veem a diferenca grande em relacao aos seeds demo.

7. **Rota de delete de income**: Atualmente existe apenas PUT para criar/atualizar renda mensal. Nao ha como remover um registro de renda, apenas sobrescrever com zero.

8. **Endpoint para listar todas as conquistas possiveis**: Atualmente o frontend sabe quais conquistas existem, mas a API aceita qualquer string. Uma rota `GET /api/achievements` com a lista canonica e descricoes tornaria o sistema mais robusto.

9. **Soft-delete para usuarios**: Atualmente existe coluna `active` na tabela users, mas nao ha rota para desativar conta. Um endpoint `DELETE /api/user/me` (que faz soft-delete) seria necessario para compliance com LGPD em um cenario real.

10. **Paginacao no ranking**: O ranking atual limita a top 10 com `LIMIT 10`. Para bases maiores, paginacao seria necessaria. `myRank` poderia estar em qualquer posicao.
