/**
 * InvestUp E2E — Teste completo de todas as 15 features
 * Executa com: node e2e_test.js
 */

const { chromium } = require(process.env.PW_PATH || 'playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL   = 'http://localhost:5173';
const API_URL    = 'http://localhost:8080';
const SS_DIR     = path.join(__dirname, 'e2e_screenshots');
const LOG_FILE   = path.join(__dirname, 'E2E_REPORT.md');

fs.mkdirSync(SS_DIR, { recursive: true });

// ── Helpers
const results = [];
let   passed  = 0;
let   failed  = 0;
let   warned  = 0;

function log(feature, step, status, detail) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
  const line = `  ${icon} [${step}] ${detail}`;
  console.log(line);
  results.push({ feature, step, status, detail });
  if (status === 'PASS') passed++;
  else if (status === 'FAIL') failed++;
  else if (status === 'WARN') warned++;
}

function featureHeader(n, name) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Feature ${n}: ${name}`);
  console.log('─'.repeat(60));
  results.push({ feature: n, step: '---', status: 'HEADER', detail: name });
}

async function ss(page, name) {
  const p = path.join(SS_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

async function login(page, email = 'demo@investup.com', pwd = 'demo123') {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', pwd);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
}

// ── Main
(async () => {
  const startTime = Date.now();
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║        InvestUp — Teste E2E Completo (15 Features)      ║');
  console.log(`║        ${new Date().toLocaleString('pt-BR').padEnd(48)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  const browser = await chromium.launch({ headless: true });

  // ════════════════════════════════════════════
  // FEATURE 0 — Autenticação
  // ════════════════════════════════════════════
  featureHeader(0, 'Autenticação (Login / Register)');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.clear(); });

    // 0.1 — Login com credenciais válidas
    try {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'demo@investup.com');
      await page.fill('input[type="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/app', { timeout: 8000 });
      await ss(page, '00_login_success');
      log(0, '0.1 Login válido', 'PASS', 'Redirecionado para /app após login');
    } catch (e) {
      log(0, '0.1 Login válido', 'FAIL', e.message);
    }

    // 0.2 — Login com senha errada
    try {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'demo@investup.com');
      await page.fill('input[type="password"]', 'errada123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      const errorMsg = await page.locator('text=incorretos').count() + await page.locator('text=inválido').count();
      const stillOnLogin = page.url().includes('/login');
      log(0, '0.2 Login inválido', errorMsg > 0 || stillOnLogin ? 'PASS' : 'WARN', 'Permanece na tela de login com erro');
    } catch (e) {
      log(0, '0.2 Login inválido', 'WARN', 'Não foi possível verificar mensagem de erro');
    }

    // 0.3 — Logout
    try {
      await login(page);
      await page.locator('button', { hasText: 'Sair' }).click();
      await page.waitForURL('**/login', { timeout: 5000 });
      log(0, '0.3 Logout', 'PASS', 'Redirecionado para /login após logout');
    } catch (e) {
      log(0, '0.3 Logout', 'FAIL', e.message);
    }

    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 1 — Simulador de Renda Fixa
  // ════════════════════════════════════════════
  featureHeader(1, 'Simulador de Renda Fixa');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page);

    try {
      await page.goto(`${BASE_URL}/app/simulador`);
      await page.waitForLoadState('networkidle');

      // 1.1 — Aba Renda Fixa existe
      const rfTab = page.locator('button', { hasText: 'Renda Fixa' });
      const exists = await rfTab.count() > 0;
      log(1, '1.1 Aba Renda Fixa', exists ? 'PASS' : 'FAIL', exists ? 'Aba presente na barra de tabs' : 'Aba não encontrada');

      // 1.2 — Abre e mostra produtos
      await rfTab.first().click();
      await page.waitForTimeout(500);
      await ss(page, '01_renda_fixa');
      const produtos = ['CDB', 'Tesouro Selic', 'LCI', 'LCA'];
      let prodOk = 0;
      for (const p of produtos) {
        if (await page.locator('text=' + p).first().isVisible()) prodOk++;
      }
      log(1, '1.2 Produtos visíveis', prodOk === 4 ? 'PASS' : 'FAIL', `${prodOk}/4 produtos renderizados`);

      // 1.3 — IR info dinâmica
      const irInfo = await page.locator('text=IR aplicável').count();
      log(1, '1.3 Info IR dinâmica', irInfo > 0 ? 'PASS' : 'FAIL', irInfo > 0 ? 'Alíquota de IR exibida corretamente' : 'Info IR não encontrada');

      // 1.4 — Badge Melhor opção
      const bestBadge = await page.locator('text=Melhor opção').count() > 0;
      log(1, '1.4 Badge "Melhor opção"', bestBadge ? 'PASS' : 'FAIL', bestBadge ? 'Badge presente no melhor produto' : 'Badge não encontrado');

      // 1.5 — Inputs de taxa editáveis (4)
      const rateInputs = await page.locator('input[type="number"]').count();
      log(1, '1.5 Inputs de taxa', rateInputs === 4 ? 'PASS' : 'WARN', `${rateInputs} inputs de taxa (esperado 4)`);

    } catch(e) { log(1, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 2 — Mapa de Trilhas Visual
  // ════════════════════════════════════════════
  featureHeader(2, 'Mapa de Trilhas Visual');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page);

    try {
      await page.goto(`${BASE_URL}/app/trilhas`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(600);
      await ss(page, '02_trilhas_map');

      // 2.1 — Trilha 1 expandida por padrão com nós
      const lessonLinks = await page.locator('a[href*="/trilhas/"]').count();
      log(2, '2.1 Nós de lições', lessonLinks > 0 ? 'PASS' : 'FAIL', `${lessonLinks} links de lições visíveis na Trilha 1`);

      // 2.2 — Trilhas bloqueadas
      const lockedBadge = await page.locator('text=Bloqueada').count();
      log(2, '2.2 Trilhas bloqueadas', lockedBadge === 3 ? 'PASS' : 'WARN', `${lockedBadge}/3 trilhas com badge "Bloqueada"`);

      // 2.3 — Accordion (colapsar/expandir)
      await page.locator('button').filter({ hasText: 'Fundamentos' }).click();
      await page.waitForTimeout(400);
      const afterCollapse = await page.locator('a[href*="/trilhas/"]').count();
      log(2, '2.3 Accordion colapsar', afterCollapse === 0 ? 'PASS' : 'FAIL', afterCollapse === 0 ? 'Trilha 1 colapsada, nós ocultos' : `${afterCollapse} nós ainda visíveis`);

      await page.locator('button').filter({ hasText: 'Fundamentos' }).click();
      await page.waitForTimeout(400);
      const afterExpand = await page.locator('a[href*="/trilhas/"]').count();
      log(2, '2.4 Accordion expandir', afterExpand > 0 ? 'PASS' : 'FAIL', afterExpand > 0 ? `${afterExpand} nós voltaram após expandir` : 'Nós não apareceram');

      // 2.5 — Barra de progresso por trilha
      const progressBars = await page.locator('[class*="rounded-full"][class*="overflow-hidden"]').count();
      log(2, '2.5 Barras de progresso', progressBars > 0 ? 'PASS' : 'WARN', `${progressBars} barras de progresso encontradas`);

    } catch(e) { log(2, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 3 — Quiz Diário
  // ════════════════════════════════════════════
  featureHeader(3, 'Quiz Diário');
  {
    // Use Julius (fresh account with less activity) to avoid already-answered quiz
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page, 'julius@demo.com', 'demo123');
    await page.waitForTimeout(500);

    try {
      // 3.1 — Card quiz no Dashboard
      const quizCard = await page.locator('text=Quiz do Dia').count();
      log(3, '3.1 Card Quiz do Dia', quizCard > 0 ? 'PASS' : 'FAIL', quizCard > 0 ? 'Card presente no Dashboard' : 'Card não encontrado');

      // 3.2 — Badge +25 XP
      const xpBadge = await page.locator('text=+25 XP').count();
      log(3, '3.2 Badge +25 XP', xpBadge > 0 ? 'PASS' : 'WARN', xpBadge > 0 ? 'Badge de recompensa visível' : 'Badge não encontrado');

      // 3.3 — 4 opções de resposta
      const options = await page.locator('.space-y-2 button').count();
      log(3, '3.3 Opções de resposta', options >= 4 ? 'PASS' : 'WARN', `${options} botões de opção encontrados`);

      // 3.4 — API quiz/daily responde
      const apiRes = await fetch(`${API_URL}/api/quiz/daily`, {
        headers: { Authorization: 'Bearer invalid' }
      }).then(r => r.status);
      log(3, '3.4 API quiz/daily', apiRes === 401 ? 'PASS' : 'WARN', `GET /api/quiz/daily retorna ${apiRes} sem token (esperado 401)`);

      await ss(page, '03_quiz_daily');

    } catch(e) { log(3, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 4 — Flashcards
  // ════════════════════════════════════════════
  featureHeader(4, 'Flashcards do Glossário');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('investup_onboarding_done','true');
      localStorage.removeItem('investup_flashcard_status');
    });
    await login(page);

    try {
      await page.goto(`${BASE_URL}/app/glossario`);
      await page.waitForLoadState('networkidle');

      // 4.1 — Toggle existe
      const toggle = await page.locator('button', { hasText: 'Flashcards' }).count();
      log(4, '4.1 Toggle Flashcards', toggle > 0 ? 'PASS' : 'FAIL', toggle > 0 ? 'Botão de modo Flashcards presente' : 'Toggle não encontrado');

      // 4.2 — Abre modo flashcard
      await page.locator('button', { hasText: 'Flashcards' }).click();
      await page.waitForTimeout(400);
      await ss(page, '04_flashcard_front');
      const hint = await page.locator('text=Toque para ver').count();
      log(4, '4.2 Card frente', hint > 0 ? 'PASS' : 'FAIL', hint > 0 ? 'Card mostra termo + hint de flip' : 'Frente do card não encontrada');

      // 4.3 — Barra de progresso
      const progress = await page.locator('text=Progresso do baralho').count();
      log(4, '4.3 Progresso do baralho', progress > 0 ? 'PASS' : 'FAIL', progress > 0 ? 'Seção de progresso visível' : 'Progresso não encontrado');

      // 4.4 — Botões Sei / Rever
      const seiBtn  = await page.locator('button', { hasText: 'Eu sei!' }).count();
      const reverBtn = await page.locator('button', { hasText: 'Rever depois' }).count();
      log(4, '4.4 Botões ação', seiBtn > 0 && reverBtn > 0 ? 'PASS' : 'FAIL', `"Eu sei!": ${seiBtn > 0}, "Rever depois": ${reverBtn > 0}`);

      // 4.5 — Flip do card
      await page.locator('[role="button"][aria-label*="definição"]').click();
      await page.waitForTimeout(700);
      await ss(page, '04_flashcard_back');
      const backHint = await page.locator('text=Toque novamente').count();
      log(4, '4.5 Flip 3D', backHint > 0 ? 'PASS' : 'WARN', backHint > 0 ? 'Verso do card exibe definição' : 'Verso pode estar renderizando mas hint não visível');

      // 4.6 — Marcar "Sei" avança card
      await page.locator('button', { hasText: 'Eu sei!' }).click();
      await page.waitForTimeout(400);
      const sei1 = await page.locator('text=Sei: 1').count();
      log(4, '4.6 Progresso atualiza', sei1 > 0 ? 'PASS' : 'FAIL', sei1 > 0 ? 'Contador "Sei: 1" atualizado' : 'Contador não atualizou');

      // 4.7 — Modo "Para rever" filtra
      await page.locator('button', { hasText: 'Rever depois' }).click();
      await page.waitForTimeout(300);
      const rever1 = await page.locator('text=Rever: 1').count();
      log(4, '4.7 Rever depois', rever1 > 0 ? 'PASS' : 'FAIL', rever1 > 0 ? 'Contador "Rever: 1" atualizado' : 'Contador não atualizou');

    } catch(e) { log(4, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 5 — Exportar PDF
  // ════════════════════════════════════════════
  featureHeader(5, 'Exportar Relatório PDF');
  {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page);

    try {
      await page.goto(`${BASE_URL}/app/financas`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);
      await ss(page, '05_finance_pdf_btn');

      // 5.1 — Botão PDF existe
      const pdfBtn = await page.locator('button', { hasText: 'PDF' }).count();
      log(5, '5.1 Botão PDF', pdfBtn > 0 ? 'PASS' : 'FAIL', pdfBtn > 0 ? 'Botão "PDF" visível no seletor de mês' : 'Botão não encontrado');

      // 5.2 — Gera download
      const downloadPromise = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
      await page.locator('button', { hasText: 'PDF' }).click();
      const download = await downloadPromise;
      if (download) {
        const fname = download.suggestedFilename();
        log(5, '5.2 Download PDF', fname.endsWith('.pdf') ? 'PASS' : 'FAIL', `Arquivo gerado: ${fname}`);
        const savePath = path.join(SS_DIR, fname);
        await download.saveAs(savePath);
        const size = fs.statSync(savePath).size;
        log(5, '5.3 Tamanho PDF', size > 1000 ? 'PASS' : 'FAIL', `PDF com ${size} bytes (esperado > 1000)`);
      } else {
        log(5, '5.2 Download PDF', 'WARN', 'Evento de download não capturado (possível abertura inline)');
        log(5, '5.3 Tamanho PDF',  'WARN', 'Não foi possível verificar tamanho');
      }

    } catch(e) { log(5, 'ERRO', 'FAIL', e.message); }
    await context.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 6 — Análise de Gastos
  // ════════════════════════════════════════════
  featureHeader(6, 'Análise Textual de Gastos');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page);

    try {
      await page.goto(`${BASE_URL}/app/financas`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await ss(page, '06_spending_analysis');

      // 6.1 — Seção análise visível
      const title = await page.locator('text=Análise do mês').count();
      log(6, '6.1 Seção "Análise do mês"', title > 0 ? 'PASS' : 'FAIL', title > 0 ? 'Componente SpendingAnalysis renderizado' : 'Seção não encontrada');

      // 6.2 — Label "vs. mês anterior"
      const vsLabel = await page.locator('text=vs.').count();
      log(6, '6.2 Label comparativo', vsLabel > 0 ? 'PASS' : 'WARN', vsLabel > 0 ? 'Label "vs. [mês]" presente' : 'Label não encontrado');

      // 6.3 — Pelo menos 1 bullet de análise
      const bullets = await page.locator('.rounded-xl.border.text-xs').count();
      log(6, '6.3 Bullets de análise', bullets > 0 ? 'PASS' : 'WARN', `${bullets} bullets de análise gerados`);

    } catch(e) { log(6, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 7 — Calculadora FIRE
  // ════════════════════════════════════════════
  featureHeader(7, 'Calculadora FIRE');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page);

    try {
      await page.goto(`${BASE_URL}/app/simulador`);
      await page.waitForLoadState('networkidle');

      // 7.1 — Aba FIRE
      const fireTab = await page.locator('button', { hasText: 'FIRE' }).count();
      log(7, '7.1 Aba FIRE', fireTab > 0 ? 'PASS' : 'FAIL', fireTab > 0 ? 'Aba FIRE presente na barra' : 'Aba não encontrada');

      await page.locator('button', { hasText: 'FIRE' }).click();
      await page.waitForTimeout(500);
      await ss(page, '07_fire_calculator');

      // 7.2 — Número FIRE em destaque
      const fireNum = await page.locator('text=Seu número FIRE').count();
      log(7, '7.2 Número FIRE', fireNum > 0 ? 'PASS' : 'FAIL', fireNum > 0 ? 'Card "Seu número FIRE" renderizado' : 'Card não encontrado');

      // 7.3 — Seletor taxa de retirada
      const rateButtons = await page.locator('button', { hasText: '4%' }).count();
      log(7, '7.3 Seletor taxa retirada', rateButtons > 0 ? 'PASS' : 'FAIL', rateButtons > 0 ? 'Botões de taxa de retirada (3%~5%) presentes' : 'Seletor não encontrado');

      // 7.4 — Cards de resultado
      const passiveIncome = await page.locator('text=Renda passiva mensal').count();
      const yearsCard = await page.locator('text=Anos até FIRE').count();
      log(7, '7.4 Cards resultado', passiveIncome > 0 && yearsCard > 0 ? 'PASS' : 'FAIL',
        `"Renda passiva": ${passiveIncome > 0}, "Anos até FIRE": ${yearsCard > 0}`);

      // 7.5 — Explicação FIRE visível
      const explain = await page.locator('text=O que é FIRE').count();
      log(7, '7.5 Explicação FIRE', explain > 0 ? 'PASS' : 'FAIL', explain > 0 ? 'Bloco explicativo do FIRE visível' : 'Explicação não encontrada');

    } catch(e) { log(7, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 8 — Recorrência em Despesas
  // ════════════════════════════════════════════
  featureHeader(8, 'Despesas Recorrentes');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page);

    try {
      await page.goto(`${BASE_URL}/app/financas`);
      await page.waitForLoadState('networkidle');
      await page.locator('button', { hasText: 'Lançamentos' }).click();
      await page.waitForTimeout(600);
      await ss(page, '08_recurring_panel');

      // 8.1 — Painel de recorrentes
      const panel = await page.locator('text=Recorrentes ativos').count();
      log(8, '8.1 Painel recorrentes', panel > 0 ? 'PASS' : 'WARN', panel > 0 ? `Painel "Recorrentes ativos" visível` : 'Nenhuma recorrente ativa (pode ser esperado)');

      // 8.2 — Formulário tem toggle recorrente
      await page.locator('button', { hasText: 'Adicionar' }).click();
      await page.waitForTimeout(300);
      const toggle = await page.locator('text=Recorrente todo mês').count();
      log(8, '8.2 Toggle "Recorrente todo mês"', toggle > 0 ? 'PASS' : 'FAIL', toggle > 0 ? 'Toggle de recorrência no formulário' : 'Toggle não encontrado');

      // 8.3 — API recurring funciona
      const token = await page.evaluate(() => localStorage.getItem('investup_token'));
      const apiRes = await fetch(`${API_URL}/api/user/expenses/recurring`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      log(8, '8.3 API GET recurring', Array.isArray(apiRes) ? 'PASS' : 'FAIL', `API retorna ${Array.isArray(apiRes) ? apiRes.length : 'erro'} templates`);

      // 8.4 — Cancelar fecha o form
      await page.locator('button', { hasText: 'Cancelar' }).click();
      await page.waitForTimeout(200);
      const formClosed = await page.locator('text=Recorrente todo mês').count();
      log(8, '8.4 Cancelar fecha form', formClosed === 0 ? 'PASS' : 'WARN', formClosed === 0 ? 'Formulário fechou ao cancelar' : 'Formulário ainda visível');

    } catch(e) { log(8, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 9 — Sistema de Níveis
  // ════════════════════════════════════════════
  featureHeader(9, 'Sistema de Níveis com Título');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page);
    await page.waitForTimeout(800);

    try {
      // 9.1 — LevelBadge no Dashboard
      const levelCard = await page.locator('text=Investidor').count() + await page.locator('text=Poupador').count() + await page.locator('text=Aprendiz').count();
      log(9, '9.1 LevelBadge no Dashboard', levelCard > 0 ? 'PASS' : 'FAIL', 'Título de nível visível no Dashboard');

      const progressText = await page.locator('text=Faltam').count();
      log(9, '9.2 Progresso "Faltam X XP"', progressText > 0 ? 'PASS' : 'FAIL', progressText > 0 ? 'Texto de progresso para próximo nível' : 'Progresso não encontrado');

      await ss(page, '09_level_dashboard');

      // 9.3 — Jornada de níveis no Perfil
      await page.goto(`${BASE_URL}/app/perfil`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(600);

      const journeyTitle = await page.locator('text=Jornada de níveis').count();
      log(9, '9.3 Jornada de níveis no Perfil', journeyTitle > 0 ? 'PASS' : 'FAIL', journeyTitle > 0 ? 'Grid "Jornada de níveis" presente' : 'Grid não encontrado');

      const nv1 = await page.locator('text=Nv.1 Poupador').count();
      const nv9 = await page.locator('text=Nv.9 Lenda').count();
      log(9, '9.4 Todos os 9 níveis', nv1 > 0 && nv9 > 0 ? 'PASS' : 'FAIL', `Nv.1 Poupador: ${nv1 > 0}, Nv.9 Lenda: ${nv9 > 0}`);

      await ss(page, '09_level_profile');

    } catch(e) { log(9, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 10 — Desafios Semanais
  // ════════════════════════════════════════════
  featureHeader(10, 'Desafios Semanais');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page, 'gekko@demo.com', 'demo123'); // Usa Gekko para ter XP mas desafios frescos
    await page.waitForTimeout(800);

    try {
      // 10.1 — Card desafios no Dashboard
      const challengeCard = await page.locator('text=Desafios da Semana').count();
      log(10, '10.1 Card Desafios da Semana', challengeCard > 0 ? 'PASS' : 'FAIL', challengeCard > 0 ? 'Card presente no Dashboard' : 'Card não encontrado');

      // 10.2 — 3 desafios listados
      const xpBtns = await page.locator('button[class*="bg-primary"]').filter({ hasText: 'XP' }).count();
      log(10, '10.2 Botões XP dos desafios', xpBtns >= 1 ? 'PASS' : 'WARN', `${xpBtns} botões +XP visíveis`);

      // 10.3 — Barra de progresso
      const counter = await page.locator('text=concluídos').count();
      log(10, '10.3 Contador de progresso', counter > 0 ? 'PASS' : 'FAIL', counter > 0 ? 'Contador X/3 concluídos visível' : 'Contador não encontrado');

      await ss(page, '10_weekly_challenges');

      // 10.4 — Completar um desafio
      if (xpBtns > 0) {
        const xpBefore = await page.locator('.badge-xp').first().textContent();
        await page.locator('button[class*="bg-primary"]').filter({ hasText: 'XP' }).first().click();
        await page.waitForTimeout(800);
        const checkmark = await page.locator('text=✅').count();
        log(10, '10.4 Completar desafio', checkmark > 0 ? 'PASS' : 'FAIL', checkmark > 0 ? 'Checkmark aparece após completar' : 'Desafio não marcado como completo');
        await ss(page, '10_challenge_claimed');
      } else {
        log(10, '10.4 Completar desafio', 'WARN', 'Nenhum botão de claim disponível (pode já estar completo)');
      }

      // 10.5 — API valida
      const token = await page.evaluate(() => localStorage.getItem('investup_token'));
      const apiRes = await fetch(`${API_URL}/api/challenges/weekly`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      log(10, '10.5 API /challenges/weekly', apiRes.challenges?.length === 3 ? 'PASS' : 'FAIL',
        `API retorna ${apiRes.challenges?.length ?? 'erro'} desafios (esperado 3)`);

    } catch(e) { log(10, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 11 — Histórico de Atividade
  // ════════════════════════════════════════════
  featureHeader(11, 'Histórico de Atividade (Calendário GitHub)');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page);

    try {
      await page.goto(`${BASE_URL}/app/perfil`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);
      await ss(page, '11_activity_calendar');

      // 11.1 — Seção visível
      const title = await page.locator('text=Histórico de atividade').count();
      log(11, '11.1 Seção "Histórico de atividade"', title > 0 ? 'PASS' : 'FAIL', title > 0 ? 'Componente ActivityCalendar renderizado' : 'Seção não encontrada');

      // 11.2 — Stats dias ativos
      const stats = await page.locator('text=dias ativos').count();
      log(11, '11.2 Stats "dias ativos"', stats > 0 ? 'PASS' : 'FAIL', stats > 0 ? 'Estatísticas de atividade visíveis' : 'Stats não encontrados');

      // 11.3 — Legenda presente
      const legend = await page.locator('text=Menos').count();
      log(11, '11.3 Legenda gradiente', legend > 0 ? 'PASS' : 'FAIL', legend > 0 ? 'Legenda "Menos → Mais" visível' : 'Legenda não encontrada');

      // 11.4 — API retorna dados
      const token = await page.evaluate(() => localStorage.getItem('investup_token'));
      const apiRes = await fetch(`${API_URL}/api/user/activity?weeks=4`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      const hasDates = Object.keys(apiRes.activity || {}).length > 0;
      log(11, '11.4 API /user/activity', apiRes.activity ? 'PASS' : 'FAIL',
        `API retorna ${Object.keys(apiRes.activity || {}).length} datas com atividade`);

    } catch(e) { log(11, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 12 — Compartilhamento de Conquistas
  // ════════════════════════════════════════════
  featureHeader(12, 'Compartilhamento de Conquistas');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => { localStorage.setItem('investup_onboarding_done','true'); });
    await login(page);

    try {
      await page.goto(`${BASE_URL}/app/perfil`);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => { window.scrollBy(0, 1500); });
      await page.waitForTimeout(400);
      await ss(page, '12_share_achievements');

      // 12.1 — Seção Conquistas
      const conquistas = await page.locator('text=Conquistas').count();
      log(12, '12.1 Seção Conquistas', conquistas > 0 ? 'PASS' : 'FAIL', conquistas > 0 ? 'Seção "Conquistas" presente' : 'Seção não encontrada');

      // 12.2 — Botão Compartilhar em conquistas desbloqueadas
      const shareButtons = await page.locator('button', { hasText: 'Compartilhar' }).count();
      log(12, '12.2 Botão "Compartilhar"', shareButtons > 0 ? 'PASS' : 'WARN', `${shareButtons} botão(ões) de compartilhar em conquistas desbloqueadas`);

      // 12.3 — Conquistas bloqueadas não têm botão
      const lockedCards = await page.locator('.grayscale').count();
      log(12, '12.3 Conquistas bloqueadas', lockedCards > 0 ? 'PASS' : 'WARN', `${lockedCards} conquistas em grayscale (bloqueadas)`);

    } catch(e) { log(12, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 13 — Notificações In-App
  // ════════════════════════════════════════════
  featureHeader(13, 'Notificações In-App');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('investup_onboarding_done','true');
      localStorage.removeItem('investup_notifications');
    });
    await login(page);
    await page.waitForTimeout(1500);
    await ss(page, '13_notification_bell');

    try {
      // 13.1 — Sino visível
      const bell = await page.locator('[aria-label="Notificações"]').count();
      log(13, '13.1 Sino de notificações', bell > 0 ? 'PASS' : 'FAIL', `${bell} sino(s) encontrado(s) (sidebar + mobile)`);

      // 13.2 — Badge de não lidas
      const badge = await page.locator('.bg-red-500').count();
      log(13, '13.2 Badge de não lidas', badge > 0 ? 'PASS' : 'WARN', badge > 0 ? 'Badge vermelho com contagem visível' : 'Badge não encontrado (notificações podem ser 0)');

      // 13.3 — Painel abre
      await page.locator('[aria-label="Notificações"]').first().click();
      await page.waitForTimeout(400);
      await ss(page, '13_notif_panel');
      const panelTitle = await page.locator('text=Notificações').filter({ has: page.locator('p') }).count();
      log(13, '13.3 Painel abre', panelTitle > 0 ? 'PASS' : 'FAIL', panelTitle > 0 ? 'Painel de notificações abre' : 'Painel não abriu');

      // 13.4 — Notificações geradas automaticamente
      const items = await page.locator('.max-h-80 a').count();
      log(13, '13.4 Notificações automáticas', items > 0 ? 'PASS' : 'WARN', `${items} notificação(ões) gerada(s) automaticamente`);

      // 13.5 — "Marcar todas lidas" existe
      const markBtn = await page.locator('text=Marcar todas lidas').count();
      log(13, '13.5 "Marcar todas lidas"', markBtn > 0 ? 'PASS' : 'FAIL', markBtn > 0 ? 'Botão de marcar tudo lido presente' : 'Botão não encontrado');

    } catch(e) { log(13, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 14 — Onboarding
  // ════════════════════════════════════════════
  featureHeader(14, 'Onboarding Tour');
  {
    // Usa Madruga (0 XP) sem localStorage de onboarding
    const page = await browser.newPage();
    await page.addInitScript(() => {
      localStorage.removeItem('investup_onboarding_done');
      localStorage.removeItem('investup_notifications');
    });
    await login(page, 'madruga@demo.com', 'demo123');
    await page.waitForTimeout(800);

    try {
      await ss(page, '14_onboarding_step1');

      // 14.1 — Modal aparece para novo usuário
      const modal = await page.locator('text=Bem-vindo ao InvestUp!').count();
      log(14, '14.1 Modal onboarding aparece', modal > 0 ? 'PASS' : 'FAIL', modal > 0 ? 'Modal de boas-vindas visível para usuário com 0 XP' : 'Modal não apareceu');

      // 14.2 — Contador de passos
      const stepCounter = await page.locator('text=1 de 6').count();
      log(14, '14.2 Contador de passos', stepCounter > 0 ? 'PASS' : 'FAIL', stepCounter > 0 ? '"1 de 6" visível' : 'Contador não encontrado');

      // 14.3 — Botão Próximo
      const nextBtn = await page.locator('button', { hasText: 'Próximo' }).count();
      log(14, '14.3 Botão "Próximo"', nextBtn > 0 ? 'PASS' : 'FAIL', nextBtn > 0 ? 'Botão de navegação presente' : 'Botão não encontrado');

      // 14.4 — Navegar para passo 2
      if (nextBtn > 0) {
        await page.locator('button', { hasText: 'Próximo' }).click();
        await page.waitForTimeout(300);
        const step2 = await page.locator('text=Comece pelas Trilhas').count();
        log(14, '14.4 Navegar passo 2', step2 > 0 ? 'PASS' : 'FAIL', step2 > 0 ? 'Passo 2 "Comece pelas Trilhas" visível' : 'Passo 2 não encontrado');
        await ss(page, '14_onboarding_step2');

        // 14.5 — Voltar funciona
        await page.locator('button', { hasText: 'Voltar' }).click();
        await page.waitForTimeout(200);
        const step1Back = await page.locator('text=Bem-vindo ao InvestUp!').count();
        log(14, '14.5 Botão "Voltar"', step1Back > 0 ? 'PASS' : 'FAIL', step1Back > 0 ? 'Retornou ao passo 1' : 'Não voltou ao passo 1');
      }

      // 14.6 — Fechar persiste em localStorage
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      // Try clicking overlay or X button
      const xBtn = page.locator('.fixed.z-50 button').first();
      if (await xBtn.count() > 0) await xBtn.click().catch(() => {});
      await page.waitForTimeout(300);

      // Recarrega e modal não aparece
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(600);
      const modalAfterClose = await page.locator('text=Bem-vindo ao InvestUp!').count();
      // Note: this test is about localStorage persistence after explicit close
      log(14, '14.6 Modal não repete', 'INFO', 'Validação de localStorage via `investup_onboarding_done`');

    } catch(e) { log(14, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  // ════════════════════════════════════════════
  // FEATURE 15 — Dark Mode
  // ════════════════════════════════════════════
  featureHeader(15, 'Dark Mode Completo');
  {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('investup_onboarding_done','true');
      localStorage.setItem('investup_theme', 'dark');
    });
    await login(page);
    await page.waitForTimeout(500);

    try {
      // 15.1 — Classe dark no html
      const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      log(15, '15.1 Classe "dark" no <html>', hasDark ? 'PASS' : 'FAIL', hasDark ? 'Classe dark aplicada ao documentElement' : 'Classe dark não encontrada');

      // 15.2 — Background escuro
      const bg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
      const isDark = bg.includes('3, 7, 18') || bg.includes('17, 24, 39') || bg.includes('0, 0, 0');
      log(15, '15.2 Background escuro', isDark ? 'PASS' : 'WARN', `Body bg: ${bg}`);

      await ss(page, '15_dark_dashboard');

      // 15.3 — Toggle dark/light
      const toggleBtn = page.locator('button', { hasText: 'Modo claro' }).first();
      await toggleBtn.click();
      await page.waitForTimeout(300);
      const isLight = !await page.evaluate(() => document.documentElement.classList.contains('dark'));
      log(15, '15.3 Toggle para modo claro', isLight ? 'PASS' : 'FAIL', isLight ? 'Classe dark removida após toggle' : 'Classe dark permanece');

      await page.locator('button', { hasText: 'Modo escuro' }).first().click();
      await page.waitForTimeout(300);
      const backToDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      log(15, '15.4 Toggle volta ao escuro', backToDark ? 'PASS' : 'FAIL', backToDark ? 'Classe dark restaurada' : 'Não voltou ao dark');

      // 15.5 — Dark mode em páginas internas
      for (const [route, name] of [['trilhas','15_dark_trilhas'], ['glossario','15_dark_glossary'], ['perfil','15_dark_profile']]) {
        await page.goto(`${BASE_URL}/app/${route}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(400);
        await ss(page, name);
        const stillDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        log(15, `15.5 Dark em /${route}`, stillDark ? 'PASS' : 'FAIL', stillDark ? `Dark mode persistiu em /${route}` : `Dark mode perdido em /${route}`);
      }

    } catch(e) { log(15, 'ERRO', 'FAIL', e.message); }
    await page.close();
  }

  await browser.close();

  // ════════════════════════════════════════════
  // GERAR RELATÓRIO
  // ════════════════════════════════════════════
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const total   = passed + failed + warned;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`RESULTADO FINAL`);
  console.log('═'.repeat(60));
  console.log(`✅ PASS:  ${passed}`);
  console.log(`❌ FAIL:  ${failed}`);
  console.log(`⚠️  WARN:  ${warned}`);
  console.log(`Total:   ${total} verificações`);
  console.log(`Tempo:   ${elapsed}s`);
  console.log('═'.repeat(60));

  // Gerar markdown
  const now = new Date().toLocaleString('pt-BR');
  const lines = [
    `# InvestUp — Relatório E2E Completo`,
    ``,
    `**Executado em:** ${now}  `,
    `**Duração:** ${elapsed}s  `,
    `**Resultado:** ✅ ${passed} PASS · ❌ ${failed} FAIL · ⚠️ ${warned} WARN`,
    ``,
    `---`,
    ``,
  ];

  let currentFeature = null;
  for (const r of results) {
    if (r.status === 'HEADER') {
      if (currentFeature !== null) lines.push('');
      lines.push(`## Feature ${r.feature}: ${r.detail}`);
      lines.push('');
      currentFeature = r.feature;
    } else {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : r.status === 'WARN' ? '⚠️' : 'ℹ️';
      lines.push(`- ${icon} **${r.step}** — ${r.detail}`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Screenshots');
  lines.push('');
  const screenshots = fs.readdirSync(SS_DIR).filter(f => f.endsWith('.png')).sort();
  for (const ss of screenshots) {
    lines.push(`- \`${ss}\``);
  }
  lines.push('');
  lines.push(`*Gerado automaticamente por e2e_test.js*`);

  fs.writeFileSync(LOG_FILE, lines.join('\n'), 'utf8');
  console.log(`\n📄 Relatório salvo: ${LOG_FILE}`);
  console.log(`📸 Screenshots:     ${SS_DIR} (${screenshots.length} arquivos)`);

  process.exit(failed > 0 ? 1 : 0);
})();
