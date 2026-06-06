/**
 * InvestUp API — Backend Node.js/Express
 * Mesma API do Spring Boot, zero configuração.
 * Banco: SQLite em arquivo (investup.db) — persiste entre reinicializações.
 */

const express    = require('express')
const jwt        = require('jsonwebtoken')
const bcrypt     = require('bcryptjs')
const cors       = require('cors')
const Database   = require('better-sqlite3')
const path       = require('path')

// ── Config
const PORT       = process.env.PORT || 8080
const JWT_SECRET = 'InvestUpSuperSecretKeyForJWTSigning2026AcademicProject'
const JWT_EXPIRY = '24h'
const DB_PATH    = process.env.DB_PATH || path.join(__dirname, 'investup.db')

// ── Banco SQLite
const db = new Database(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT    NOT NULL,
    email            TEXT    NOT NULL UNIQUE,
    password         TEXT    NOT NULL,
    investor_profile TEXT    NOT NULL DEFAULT 'NAO_DEFINIDO',
    total_xp         INTEGER NOT NULL DEFAULT 0,
    streak_days      INTEGER NOT NULL DEFAULT 0,
    lessons_completed INTEGER NOT NULL DEFAULT 0,
    active           INTEGER NOT NULL DEFAULT 1,
    last_login_at    TEXT,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL REFERENCES users(id),
    lesson_id        TEXT    NOT NULL,
    trail_number     INTEGER NOT NULL,
    status           TEXT    NOT NULL DEFAULT 'AVAILABLE',
    progress_percent INTEGER NOT NULL DEFAULT 0,
    quiz_score       INTEGER,
    xp_earned        INTEGER,
    started_at       TEXT,
    completed_at     TEXT,
    UNIQUE(user_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id),
    category     TEXT    NOT NULL,
    description  TEXT    NOT NULL,
    amount       REAL    NOT NULL,
    expense_date TEXT    NOT NULL,
    month        TEXT    NOT NULL,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS monthly_income (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    month   TEXT    NOT NULL,
    amount  REAL    NOT NULL DEFAULT 0,
    UNIQUE(user_id, month)
  );

  CREATE TABLE IF NOT EXISTS budget_goals (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    category      TEXT    NOT NULL,
    monthly_limit REAL    NOT NULL DEFAULT 0,
    month         TEXT    NOT NULL,
    UNIQUE(user_id, category, month)
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id),
    achievement  TEXT    NOT NULL,
    unlocked_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, achievement)
  );
`)

// ── Adicionar colunas novas sem recriar tabelas
try { db.exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT`) } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN streak_rewarded_at TEXT`) } catch {}
try { db.exec(`ALTER TABLE users ADD COLUMN last_activity_at TEXT`) } catch {}

// Tabela de despesas recorrentes (templates)
db.exec(`
  CREATE TABLE IF NOT EXISTS recurring_expenses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    category    TEXT    NOT NULL,
    description TEXT    NOT NULL,
    amount      REAL    NOT NULL,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`)

// Tabela de respostas do quiz diário
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_quiz_answers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    quiz_date   TEXT NOT NULL,
    correct     INTEGER NOT NULL DEFAULT 0,
    answered_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, quiz_date)
  );
`)

// Nova tabela de metas financeiras
db.exec(`
  CREATE TABLE IF NOT EXISTS financial_goals (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER NOT NULL REFERENCES users(id),
    title          TEXT    NOT NULL,
    emoji          TEXT    NOT NULL DEFAULT '🎯',
    target_amount  REAL    NOT NULL,
    current_amount REAL    NOT NULL DEFAULT 0,
    deadline       TEXT    NOT NULL,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`)

// ── Seed de usuários padrão
function seedUsers() {
  const seeds = [
    // Usuários originais
    { name: 'Demo InvestUp', email: 'demo@investup.com',     password: 'demo123',  profile: 'NAO_DEFINIDO', xp: 450,   streak: 7,  lessons: 5  },
    { name: 'Italo',         email: 'italoruy1@gmail.com',   password: 'teste123', profile: 'NAO_DEFINIDO', xp: 0,     streak: 0,  lessons: 0  },

    // Demo — cada selo
    { name: 'Tio Patinhas',  email: 'patinhas@demo.com',     password: 'demo123',  profile: 'MODERADO',     xp: 12000, streak: 30, lessons: 40 }, // 🎩 Cofre de Ouro
    { name: 'Gordon Gekko',  email: 'gekko@demo.com',        password: 'demo123',  profile: 'ARROJADO',     xp: 3500,  streak: 10, lessons: 18 }, // 📈 A Ganância é Boa
    { name: 'Julius',        email: 'julius@demo.com',       password: 'demo123',  profile: 'CONSERVADOR',  xp: 800,   streak: 14, lessons: 10 }, // 🧾 Mestre da Economia
    { name: 'Tartaruga',     email: 'tartaruga@demo.com',    password: 'demo123',  profile: 'MODERADO',     xp: 400,   streak: 21, lessons: 6  }, // 🐢 Devagar e Sempre
    { name: 'Seu Madruga',   email: 'madruga@demo.com',      password: 'demo123',  profile: 'NAO_DEFINIDO', xp: 0,     streak: 0,  lessons: 0  }, // 😅 Sem Fundos
    { name: 'Iniciante',     email: 'iniciante@demo.com',    password: 'demo123',  profile: 'MODERADO',     xp: 250,   streak: 2,  lessons: 3  }, // 🌱 Começando a Jornada
  ]

  for (const s of seeds) {
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(s.email)
    if (!exists) {
      const hash = bcrypt.hashSync(s.password, 10)
      db.prepare(`
        INSERT INTO users (name, email, password, investor_profile, total_xp, streak_days, lessons_completed, last_login_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(s.name, s.email, hash, s.profile, s.xp, s.streak, s.lessons)
      console.log(`🌱 Usuário criado: ${s.email} (${s.name})`)
    }
  }
}

seedUsers()

// ── Express
const app = express()

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}))

app.use(express.json())

// ── Helpers
function generateToken(user) {
  return jwt.sign(
    { sub: user.email, id: user.id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )
}

function userSummary(user) {
  return {
    id:               user.id,
    name:             user.name,
    email:            user.email,
    totalXp:          user.total_xp,
    streakDays:       user.streak_days,
    lessonsCompleted: user.lessons_completed,
    investorProfile:  user.investor_profile,
    avatarUrl:        user.avatar_url ?? null,
  }
}

function authResponse(token, user) {
  return { token, type: 'Bearer', user: userSummary(user) }
}

// ── Middleware JWT
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

// ══════════════════════════════════════════════
// ROTAS DE AUTH
// ══════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body

  // Validações simples
  const errors = {}
  if (!name || name.trim().length < 2)
    errors.name = 'Nome deve ter pelo menos 2 caracteres'
  if (!email || !/\S+@\S+\.\S+/.test(email))
    errors.email = 'E-mail inválido'
  if (!password || password.length < 6)
    errors.password = 'Senha deve ter pelo menos 6 caracteres'

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ status: 400, error: 'Dados inválidos', fields: errors })
  }

  // Verificar e-mail duplicado
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (existing) {
    return res.status(409).json({ status: 409, error: 'E-mail já cadastrado' })
  }

  // Criar usuário
  const hashedPassword = bcrypt.hashSync(password, 10)
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password, last_login_at)
    VALUES (?, ?, ?, datetime('now'))
  `)
  const result = stmt.run(name.trim(), email.toLowerCase(), hashedPassword)
  const user   = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)

  console.log(`✅ Novo usuário cadastrado: ${user.email}`)
  const token = generateToken(user)
  return res.status(201).json(authResponse(token, user))
})

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ status: 400, error: 'E-mail e senha são obrigatórios' })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ status: 401, error: 'E-mail ou senha incorretos' })
  }

  if (!user.active) {
    return res.status(401).json({ status: 401, error: 'Conta desativada' })
  }

  // Atualiza último login
  db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id)

  // ── F5: streak reward
  let streakReward = null
  const milestones = [7, 30, 100]
  const milestone = milestones.find(m => user.streak_days === m)
  if (milestone) {
    const rewardXp = milestone === 7 ? 50 : milestone === 30 ? 200 : 500
    const alreadyRewarded = user.streak_rewarded_at &&
      user.streak_rewarded_at.slice(0, 10) === new Date().toISOString().slice(0, 10)
    if (!alreadyRewarded) {
      db.prepare("UPDATE users SET total_xp = total_xp + ?, streak_rewarded_at = datetime('now') WHERE id = ?").run(rewardXp, user.id)
      streakReward = { xp: rewardXp, days: milestone, message: `🔥 ${milestone} dias seguidos! +${rewardXp} XP bônus!` }
    }
  }

  console.log(`🔐 Login: ${user.email}`)
  const freshUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)
  const token = generateToken(freshUser)
  const resp = authResponse(token, freshUser)
  if (streakReward) resp.streakReward = streakReward
  return res.json(resp)
})

// ══════════════════════════════════════════════
// ROTAS DE USUÁRIO (protegidas)
// ══════════════════════════════════════════════

// GET /api/user/me
app.get('/api/user/me', requireAuth, (req, res) => {
  res.json(userSummary(req.user))
})

// PATCH /api/user/profile — atualiza perfil de investidor
app.patch('/api/user/profile', requireAuth, (req, res) => {
  const { investorProfile } = req.body
  const valid = ['CONSERVADOR', 'MODERADO', 'ARROJADO']
  if (!valid.includes(investorProfile)) {
    return res.status(400).json({ error: 'Perfil inválido' })
  }
  db.prepare('UPDATE users SET investor_profile = ? WHERE id = ?')
    .run(investorProfile, req.user.id)
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json(userSummary(updated))
})

// POST /api/user/xp — adiciona XP
app.post('/api/user/xp', requireAuth, (req, res) => {
  const { amount } = req.body
  if (!amount || amount < 0) return res.status(400).json({ error: 'Quantidade inválida' })
  db.prepare('UPDATE users SET total_xp = total_xp + ? WHERE id = ?').run(amount, req.user.id)
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({ totalXp: updated.total_xp })
})

// POST /api/user/lessons/:lessonId/complete — conclui uma lição
app.post('/api/user/lessons/:lessonId/complete', requireAuth, (req, res) => {
  const { lessonId }              = req.params
  const { xpReward = 0, trailNumber = 1 } = req.body
  const userId                    = req.user.id

  const existing = db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?'
  ).get(userId, lessonId)

  if (existing && existing.status === 'COMPLETED') {
    const cur = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    return res.json(userSummary(cur))
  }

  const now = new Date().toISOString()
  if (existing) {
    db.prepare(`
      UPDATE user_progress
      SET status = 'COMPLETED', progress_percent = 100, xp_earned = ?, completed_at = ?
      WHERE user_id = ? AND lesson_id = ?
    `).run(xpReward, now, userId, lessonId)
  } else {
    db.prepare(`
      INSERT INTO user_progress (user_id, lesson_id, trail_number, status, progress_percent, xp_earned, started_at, completed_at)
      VALUES (?, ?, ?, 'COMPLETED', 100, ?, ?, ?)
    `).run(userId, lessonId, trailNumber, xpReward, now, now)
  }

  // ── Atualiza XP, lições e streak
  const freshUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  const today     = new Date().toISOString().slice(0, 10)
  const lastAct   = freshUser.last_activity_at?.slice(0, 10) ?? null
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let newStreak
  if (lastAct === today) {
    newStreak = freshUser.streak_days           // já jogou hoje, mantém
  } else if (lastAct === yesterday) {
    newStreak = freshUser.streak_days + 1       // dia consecutivo, incrementa
  } else {
    newStreak = 1                               // quebrou o streak, reinicia
  }

  db.prepare(`
    UPDATE users
    SET total_xp = total_xp + ?,
        lessons_completed = lessons_completed + 1,
        last_activity_at = datetime('now'),
        streak_days = ?
    WHERE id = ?
  `).run(xpReward, newStreak, userId)

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  console.log(`✅ Lição ${lessonId} concluída por ${req.user.email} (+${xpReward} XP)`)
  return res.json(userSummary(updated))
})

// GET /api/user/progress — lista lições completadas
app.get('/api/user/progress', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT lesson_id AS lessonId, LOWER(status) AS status
    FROM user_progress WHERE user_id = ?
  `).all(req.user.id)
  res.json(rows)
})

// ══════════════════════════════════════════════
// ROTAS DE DESPESAS
// ══════════════════════════════════════════════

// GET /api/user/expenses?month=2026-05
app.get('/api/user/expenses', requireAuth, (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7)
  const rows = db.prepare(`
    SELECT id, category, description, amount, expense_date AS date, month
    FROM expenses WHERE user_id = ? AND month = ?
    ORDER BY expense_date DESC, id DESC
  `).all(req.user.id, month)
  res.json(rows)
})

// POST /api/user/expenses
app.post('/api/user/expenses', requireAuth, (req, res) => {
  const { category, description, amount, date } = req.body
  if (!category || !description || !amount || !date) {
    return res.status(400).json({ error: 'Campos obrigatórios: category, description, amount, date' })
  }
  const month = date.slice(0, 7)
  const result = db.prepare(`
    INSERT INTO expenses (user_id, category, description, amount, expense_date, month)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, category, description.trim(), Number(amount), date, month)
  const expense = db.prepare(
    'SELECT id, category, description, amount, expense_date AS date, month FROM expenses WHERE id = ?'
  ).get(result.lastInsertRowid)
  res.status(201).json(expense)
})

// DELETE /api/user/expenses/:id
app.delete('/api/user/expenses/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT id FROM expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!existing) return res.status(404).json({ error: 'Despesa não encontrada' })
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// GET /api/user/income?month=2026-05
app.get('/api/user/income', requireAuth, (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7)
  const row = db.prepare('SELECT amount FROM monthly_income WHERE user_id = ? AND month = ?').get(req.user.id, month)
  res.json({ month, amount: row ? row.amount : 0 })
})

// PUT /api/user/income
app.put('/api/user/income', requireAuth, (req, res) => {
  const { month, amount } = req.body
  if (!month || amount === undefined) return res.status(400).json({ error: 'month e amount são obrigatórios' })
  db.prepare(`
    INSERT INTO monthly_income (user_id, month, amount) VALUES (?, ?, ?)
    ON CONFLICT(user_id, month) DO UPDATE SET amount = excluded.amount
  `).run(req.user.id, month, Number(amount))
  res.json({ month, amount: Number(amount) })
})

// ══════════════════════════════════════════════
// F5 — RANKING
// ══════════════════════════════════════════════

// GET /api/ranking — top 10 por XP
app.get('/api/ranking', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT id, name, total_xp AS totalXp, streak_days AS streakDays,
           lessons_completed AS lessonsCompleted, investor_profile AS investorProfile,
           avatar_url AS avatarUrl
    FROM users WHERE active = 1
    ORDER BY total_xp DESC LIMIT 10
  `).all()
  const myRank = db.prepare(`
    SELECT COUNT(*)+1 AS rank FROM users WHERE active = 1 AND total_xp > (SELECT total_xp FROM users WHERE id = ?)
  `).get(req.user.id)
  res.json({ ranking: rows, myRank: myRank?.rank ?? 1 })
})

// ══════════════════════════════════════════════
// F13 — BUDGET GOALS (Metas por categoria)
// ══════════════════════════════════════════════

// GET /api/user/budget?month=2026-05
app.get('/api/user/budget', requireAuth, (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7)
  const rows = db.prepare('SELECT category, monthly_limit AS monthlyLimit, month FROM budget_goals WHERE user_id = ? AND month = ?').all(req.user.id, month)
  res.json(rows)
})

// PUT /api/user/budget — upsert meta de categoria
app.put('/api/user/budget', requireAuth, (req, res) => {
  const { category, monthly_limit, month } = req.body
  if (!category || monthly_limit === undefined || !month) {
    return res.status(400).json({ error: 'category, monthly_limit e month são obrigatórios' })
  }
  db.prepare(`
    INSERT INTO budget_goals (user_id, category, monthly_limit, month) VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, category, month) DO UPDATE SET monthly_limit = excluded.monthly_limit
  `).run(req.user.id, category, Number(monthly_limit), month)
  res.json({ category, monthly_limit: Number(monthly_limit), month })
})

// ══════════════════════════════════════════════
// F15 — AVATAR
// ══════════════════════════════════════════════

// PATCH /api/user/avatar
app.patch('/api/user/avatar', requireAuth, (req, res) => {
  const { avatarUrl } = req.body
  if (!avatarUrl) return res.status(400).json({ error: 'avatarUrl é obrigatório' })
  db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, req.user.id)
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({ ...userSummary(updated), avatarUrl: updated.avatar_url })
})

// ══════════════════════════════════════════════
// F16 — ALTERAR SENHA
// ══════════════════════════════════════════════

// PATCH /api/user/password
app.patch('/api/user/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword e newPassword são obrigatórios' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' })
  }
  if (!bcrypt.compareSync(currentPassword, req.user.password)) {
    return res.status(401).json({ error: 'Senha atual incorreta' })
  }
  const hashed = bcrypt.hashSync(newPassword, 10)
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id)
  res.json({ success: true, message: 'Senha alterada com sucesso' })
})

// ══════════════════════════════════════════════
// F17 — CONQUISTAS COM DATA
// ══════════════════════════════════════════════

// GET /api/user/achievements
app.get('/api/user/achievements', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT achievement, unlocked_at AS unlockedAt FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at ASC').all(req.user.id)
  res.json(rows)
})

// POST /api/user/achievements/:achievement — registrar conquista
app.post('/api/user/achievements/:achievement', requireAuth, (req, res) => {
  const { achievement } = req.params
  const existing = db.prepare('SELECT id FROM user_achievements WHERE user_id = ? AND achievement = ?').get(req.user.id, achievement)
  if (existing) return res.json({ alreadyUnlocked: true })
  db.prepare(`INSERT INTO user_achievements (user_id, achievement) VALUES (?, ?)`).run(req.user.id, achievement)
  res.status(201).json({ achievement, unlockedAt: new Date().toISOString() })
})

// ══════════════════════════════════════════════
// STREAK EM RISCO
// ══════════════════════════════════════════════

// GET /api/user/streak-status
app.get('/api/user/streak-status', requireAuth, (req, res) => {
  const today    = new Date().toISOString().slice(0, 10)
  const lastAct  = req.user.last_activity_at?.slice(0, 10) ?? null
  const atRisk   = req.user.streak_days > 0 && lastAct !== today
  const hoursLeft = atRisk ? Math.max(0, 24 - new Date().getHours()) : null
  res.json({
    streakDays:   req.user.streak_days,
    lastActivity: lastAct,
    atRisk,
    hoursLeft,
  })
})

// ══════════════════════════════════════════════
// METAS FINANCEIRAS
// ══════════════════════════════════════════════

// GET /api/user/goals
app.get('/api/user/goals', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT id, title, emoji, target_amount AS targetAmount,
           current_amount AS currentAmount, deadline, created_at AS createdAt
    FROM financial_goals WHERE user_id = ? ORDER BY deadline ASC
  `).all(req.user.id)
  res.json(rows)
})

// POST /api/user/goals
app.post('/api/user/goals', requireAuth, (req, res) => {
  const { title, emoji = '🎯', target_amount, current_amount = 0, deadline } = req.body
  if (!title || !target_amount || !deadline) {
    return res.status(400).json({ error: 'title, target_amount e deadline são obrigatórios' })
  }
  const result = db.prepare(`
    INSERT INTO financial_goals (user_id, title, emoji, target_amount, current_amount, deadline)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, title.trim(), emoji, Number(target_amount), Number(current_amount), deadline)
  const goal = db.prepare('SELECT id, title, emoji, target_amount AS targetAmount, current_amount AS currentAmount, deadline, created_at AS createdAt FROM financial_goals WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(goal)
})

// PATCH /api/user/goals/:id — atualiza aporte atual
app.patch('/api/user/goals/:id', requireAuth, (req, res) => {
  const { current_amount, title, emoji, target_amount, deadline } = req.body
  const goal = db.prepare('SELECT id FROM financial_goals WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!goal) return res.status(404).json({ error: 'Meta não encontrada' })
  if (current_amount !== undefined) db.prepare('UPDATE financial_goals SET current_amount = ? WHERE id = ?').run(Number(current_amount), req.params.id)
  if (title)          db.prepare('UPDATE financial_goals SET title = ? WHERE id = ?').run(title, req.params.id)
  if (emoji)          db.prepare('UPDATE financial_goals SET emoji = ? WHERE id = ?').run(emoji, req.params.id)
  if (target_amount)  db.prepare('UPDATE financial_goals SET target_amount = ? WHERE id = ?').run(Number(target_amount), req.params.id)
  if (deadline)       db.prepare('UPDATE financial_goals SET deadline = ? WHERE id = ?').run(deadline, req.params.id)
  const updated = db.prepare('SELECT id, title, emoji, target_amount AS targetAmount, current_amount AS currentAmount, deadline, created_at AS createdAt FROM financial_goals WHERE id = ?').get(req.params.id)
  res.json(updated)
})

// DELETE /api/user/goals/:id
app.delete('/api/user/goals/:id', requireAuth, (req, res) => {
  const goal = db.prepare('SELECT id FROM financial_goals WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!goal) return res.status(404).json({ error: 'Meta não encontrada' })
  db.prepare('DELETE FROM financial_goals WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ══════════════════════════════════════════════
// DESAFIOS SEMANAIS
// ══════════════════════════════════════════════

db.exec(`
  CREATE TABLE IF NOT EXISTS weekly_challenge_completions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id),
    week_key     TEXT    NOT NULL,
    challenge_id TEXT    NOT NULL,
    completed_at TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, week_key, challenge_id)
  );
`)

const WEEKLY_CHALLENGES = [
  { id: 'complete_3_lessons',   title: 'Estude 3 lições',          desc: 'Complete 3 lições em qualquer trilha',  emoji: '📚', xp: 50,  type: 'lessons',  target: 3  },
  { id: 'log_5_expenses',       title: 'Registre 5 gastos',        desc: 'Adicione 5 lançamentos no controle',   emoji: '💸', xp: 30,  type: 'expenses', target: 5  },
  { id: '7_day_streak',         title: 'Streak de 7 dias',         desc: 'Mantenha 7 dias consecutivos de acesso', emoji: '🔥', xp: 75,  type: 'streak',   target: 7  },
  { id: 'complete_quiz',        title: 'Responda o quiz diário',   desc: 'Responda o quiz do dia corretamente',  emoji: '🧠', xp: 25,  type: 'quiz',     target: 1  },
  { id: 'set_financial_goal',   title: 'Defina uma meta',          desc: 'Crie ou atualize uma meta financeira', emoji: '🎯', xp: 40,  type: 'goals',    target: 1  },
  { id: 'complete_5_lessons',   title: 'Estude 5 lições',          desc: 'Complete 5 lições em qualquer trilha', emoji: '🏆', xp: 80,  type: 'lessons',  target: 5  },
  { id: 'use_simulator',        title: 'Use o simulador',          desc: 'Acesse qualquer aba do simulador',     emoji: '📊', xp: 20,  type: 'action',   target: 1  },
  { id: 'log_income',           title: 'Registre sua renda',       desc: 'Defina sua renda mensal no controle',  emoji: '💼', xp: 20,  type: 'income',   target: 1  },
]

function getWeekKey() {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil((((d - jan1) / 86400000) + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function getWeeklyChallenges() {
  const wk = getWeekKey()
  const seed = parseInt(wk.replace(/\D/g, ''), 10)
  const idx1 = seed % WEEKLY_CHALLENGES.length
  const idx2 = (seed + 2) % WEEKLY_CHALLENGES.length
  const idx3 = (seed + 5) % WEEKLY_CHALLENGES.length
  return [WEEKLY_CHALLENGES[idx1], WEEKLY_CHALLENGES[idx2], WEEKLY_CHALLENGES[idx3]]
}

// GET /api/challenges/weekly
app.get('/api/challenges/weekly', requireAuth, (req, res) => {
  const wk = getWeekKey()
  const challenges = getWeeklyChallenges()
  const completions = db.prepare('SELECT challenge_id FROM weekly_challenge_completions WHERE user_id = ? AND week_key = ?').all(req.user.id, wk)
  const completedIds = new Set(completions.map(c => c.challenge_id))

  res.json({
    weekKey:    wk,
    challenges: challenges.map(c => ({ ...c, completed: completedIds.has(c.id) })),
  })
})

// POST /api/challenges/complete/:id
app.post('/api/challenges/complete/:id', requireAuth, (req, res) => {
  const wk = getWeekKey()
  const challengeId = req.params.id
  const challenge = WEEKLY_CHALLENGES.find(c => c.id === challengeId)
  if (!challenge) return res.status(404).json({ error: 'Desafio não encontrado' })

  const exists = db.prepare('SELECT id FROM weekly_challenge_completions WHERE user_id = ? AND week_key = ? AND challenge_id = ?').get(req.user.id, wk, challengeId)
  if (exists) return res.status(409).json({ error: 'Já completado esta semana' })

  db.prepare('INSERT INTO weekly_challenge_completions (user_id, week_key, challenge_id) VALUES (?, ?, ?)').run(req.user.id, wk, challengeId)
  db.prepare("UPDATE users SET total_xp = total_xp + ? WHERE id = ?").run(challenge.xp, req.user.id)
  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)

  res.json({ success: true, xpEarned: challenge.xp, totalXp: updatedUser.total_xp })
})

// ══════════════════════════════════════════════
// DESPESAS RECORRENTES
// ══════════════════════════════════════════════

// GET /api/user/expenses/recurring
app.get('/api/user/expenses/recurring', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM recurring_expenses WHERE user_id = ? AND active = 1 ORDER BY id DESC').all(req.user.id)
  res.json(rows)
})

// POST /api/user/expenses/recurring
app.post('/api/user/expenses/recurring', requireAuth, (req, res) => {
  const { category, description, amount } = req.body
  if (!category || !description || !amount) {
    return res.status(400).json({ error: 'Campos obrigatórios: category, description, amount' })
  }
  const result = db.prepare('INSERT INTO recurring_expenses (user_id, category, description, amount) VALUES (?, ?, ?, ?)').run(req.user.id, category, description.trim(), Number(amount))
  const row = db.prepare('SELECT * FROM recurring_expenses WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(row)
})

// DELETE /api/user/expenses/recurring/:id
app.delete('/api/user/expenses/recurring/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT id FROM recurring_expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!row) return res.status(404).json({ error: 'Não encontrado' })
  db.prepare('UPDATE recurring_expenses SET active = 0 WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// POST /api/user/expenses/apply-recurring — auto-inserir recorrentes no mês
app.post('/api/user/expenses/apply-recurring', requireAuth, (req, res) => {
  const { month } = req.body  // ex: '2026-06'
  if (!month) return res.status(400).json({ error: 'month obrigatório' })

  const templates = db.prepare('SELECT * FROM recurring_expenses WHERE user_id = ? AND active = 1').all(req.user.id)
  const day1 = `${month}-01`
  let inserted = 0

  for (const t of templates) {
    // Verifica se já existe uma despesa recorrente desse template nesse mês
    const exists = db.prepare(`
      SELECT id FROM expenses WHERE user_id = ? AND month = ? AND description = ? AND category = ? AND amount = ?
    `).get(req.user.id, month, t.description, t.category, t.amount)
    if (!exists) {
      db.prepare('INSERT INTO expenses (user_id, category, description, amount, expense_date, month) VALUES (?, ?, ?, ?, ?, ?)').run(req.user.id, t.category, t.description, t.amount, day1, month)
      inserted++
    }
  }
  res.json({ inserted, month })
})

// ══════════════════════════════════════════════
// QUIZ DIÁRIO
// ══════════════════════════════════════════════

const DAILY_QUESTIONS = [
  {
    q: 'O que é a taxa Selic?',
    opts: ['Taxa de câmbio do dólar', 'Taxa básica de juros da economia brasileira', 'Taxa de inflação mensal', 'Taxa de rentabilidade da poupança'],
    answer: 1,
    explain: 'A Selic é a taxa básica de juros da economia brasileira, definida pelo Copom (Banco Central). Ela serve de referência para todos os outros juros do país.',
  },
  {
    q: 'O que significa "diversificar" uma carteira de investimentos?',
    opts: ['Investir tudo em uma única ação', 'Aplicar somente em renda fixa', 'Distribuir o dinheiro em diferentes tipos de ativos', 'Sacar os rendimentos todo mês'],
    answer: 2,
    explain: 'Diversificar significa distribuir os investimentos em diferentes classes de ativos (renda fixa, ações, FIIs, etc.) para reduzir o risco total da carteira.',
  },
  {
    q: 'O que é o CDI?',
    opts: ['Certificado de Depósito Interbancário — taxa usada entre bancos', 'Um título do governo federal', 'Uma moeda digital', 'Uma corretora de valores'],
    answer: 0,
    explain: 'O CDI (Certificado de Depósito Interbancário) é a taxa que os bancos usam entre si para empréstimos de curto prazo. Serve de referência para vários investimentos de renda fixa.',
  },
  {
    q: 'O que são "juros compostos"?',
    opts: ['Juros que pagam somente sobre o capital inicial', 'Juros calculados sobre o valor total, incluindo os juros anteriores', 'Uma taxa fixa paga mensalmente', 'Juros cobrados em parcelamentos'],
    answer: 1,
    explain: 'Juros compostos (ou "juros sobre juros") são calculados sobre o saldo total, incluindo os rendimentos acumulados. Com o tempo, criam o efeito bola de neve.',
  },
  {
    q: 'O que é inflação?',
    opts: ['Aumento do valor dos investimentos', 'Queda generalizada dos preços', 'Aumento generalizado dos preços que reduz o poder de compra', 'Taxa de crescimento do PIB'],
    answer: 2,
    explain: 'Inflação é o aumento generalizado e contínuo dos preços de bens e serviços. Ela corrói o poder de compra do dinheiro ao longo do tempo.',
  },
  {
    q: 'Qual é o limite de cobertura do FGC por CPF por instituição?',
    opts: ['R$ 100.000', 'R$ 250.000', 'R$ 500.000', 'R$ 1.000.000'],
    answer: 1,
    explain: 'O Fundo Garantidor de Créditos (FGC) protege até R$ 250.000 por CPF por instituição financeira em caso de falência do banco.',
  },
  {
    q: 'LCI e LCA são isentos de qual imposto para pessoas físicas?',
    opts: ['IOF', 'Imposto de Renda', 'CSLL', 'COFINS'],
    answer: 1,
    explain: 'LCI (Letra de Crédito Imobiliário) e LCA (Letra de Crédito do Agronegócio) são isentos de Imposto de Renda para pessoas físicas, tornando-os competitivos mesmo com taxas menores.',
  },
  {
    q: 'O que é um FII (Fundo de Investimento Imobiliário)?',
    opts: ['Um fundo que investe em ações de empresas', 'Um fundo que investe em imóveis e distribui rendimentos mensais', 'Um título público do governo', 'Uma conta poupança especial'],
    answer: 1,
    explain: 'FIIs são fundos que investem em imóveis (shoppings, escritórios, galpões, etc.) ou ativos imobiliários. Distribuem rendimentos mensais chamados de "dividendos" ou "proventos".',
  },
  {
    q: 'O que significa "renda variável"?',
    opts: ['Investimentos com rendimento fixo e previsível', 'Investimentos cujo retorno varia conforme o mercado, sem garantia', 'Investimentos somente em imóveis', 'Aplicações com prazo máximo de 1 ano'],
    answer: 1,
    explain: 'Renda variável inclui ativos cujo preço oscila conforme o mercado (ações, FIIs, criptos). O retorno não é garantido, mas o potencial de ganho é maior.',
  },
  {
    q: 'O que é o "efeito bola de neve" dos investimentos?',
    opts: ['A queda acelerada do valor dos ativos', 'O crescimento acelerado do patrimônio graças aos juros compostos', 'A inflação corroendo os rendimentos', 'O aumento das taxas de administração'],
    answer: 1,
    explain: 'O efeito bola de neve ocorre quando os rendimentos são reinvestidos e passam a gerar novos rendimentos, acelerando cada vez mais o crescimento do patrimônio.',
  },
  {
    q: 'Qual ativo é considerado o mais seguro do Brasil?',
    opts: ['Ações da Petrobras', 'Tesouro Selic (título público federal)', 'Bitcoin', 'CDB de banco médio'],
    answer: 1,
    explain: 'O Tesouro Direto (especialmente o Tesouro Selic) é considerado o investimento mais seguro do Brasil, pois é garantido pelo governo federal.',
  },
  {
    q: 'O que é "Dividend Yield" (DY)?',
    opts: ['O preço atual de uma ação', 'A relação entre os dividendos pagos e o preço do ativo', 'A variação diária de um fundo', 'O custo de custódia de um investimento'],
    answer: 1,
    explain: 'Dividend Yield é o percentual de dividendos pagos em relação ao preço do ativo. Ex: DY de 1% ao mês significa que o ativo paga 1% do seu valor em dividendos mensalmente.',
  },
  {
    q: 'O que é o "aporte mensal"?',
    opts: ['O valor inicial investido de uma vez', 'A taxa cobrada pelo banco', 'O valor adicionado regularmente ao investimento todo mês', 'A rentabilidade esperada por mês'],
    answer: 2,
    explain: 'Aporte mensal é o valor que você adiciona ao investimento regularmente todo mês. Manter aportes consistentes é um dos hábitos mais importantes para construir patrimônio.',
  },
  {
    q: 'Para qual perfil de investidor a renda fixa é mais adequada?',
    opts: ['Arrojado', 'Conservador', 'Especulativo', 'Agressivo'],
    answer: 1,
    explain: 'O investidor conservador prioriza segurança e previsibilidade. Renda fixa oferece retornos estáveis com baixo risco, sendo ideal para esse perfil.',
  },
  {
    q: 'O que é ETF?',
    opts: ['Um tipo de conta bancária', 'Um fundo negociado em bolsa que replica um índice', 'Uma criptomoeda', 'Uma taxa de transferência entre bancos'],
    answer: 1,
    explain: 'ETF (Exchange-Traded Fund) é um fundo negociado em bolsa que replica a performance de um índice (como o Ibovespa). Permite diversificação com uma única compra e baixo custo.',
  },
]

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function getDailyQuestion() {
  const today = getTodayDate()
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const idx = dayOfYear % DAILY_QUESTIONS.length
  return { ...DAILY_QUESTIONS[idx], date: today, index: idx }
}

// GET /api/quiz/daily
app.get('/api/quiz/daily', requireAuth, (req, res) => {
  const today = getTodayDate()
  const question = getDailyQuestion()
  const existing = db.prepare('SELECT correct FROM daily_quiz_answers WHERE user_id = ? AND quiz_date = ?').get(req.user.id, today)

  res.json({
    date:      today,
    question:  question.q,
    options:   question.opts,
    answered:  !!existing,
    correct:   existing ? !!existing.correct : null,
    answer:    existing ? question.answer : null,
    explain:   existing ? question.explain : null,
    xpReward:  25,
  })
})

// POST /api/quiz/answer
app.post('/api/quiz/answer', requireAuth, (req, res) => {
  const today    = getTodayDate()
  const { answer } = req.body

  const existing = db.prepare('SELECT id FROM daily_quiz_answers WHERE user_id = ? AND quiz_date = ?').get(req.user.id, today)
  if (existing) {
    return res.status(409).json({ error: 'Quiz já respondido hoje' })
  }

  const question = getDailyQuestion()
  const isCorrect = Number(answer) === question.answer

  db.prepare('INSERT INTO daily_quiz_answers (user_id, quiz_date, correct) VALUES (?, ?, ?)').run(req.user.id, today, isCorrect ? 1 : 0)

  if (isCorrect) {
    db.prepare('UPDATE users SET total_xp = total_xp + 25, last_activity_at = datetime(\'now\') WHERE id = ?').run(req.user.id)
  }

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)

  res.json({
    correct:  isCorrect,
    answer:   question.answer,
    explain:  question.explain,
    xpEarned: isCorrect ? 25 : 0,
    totalXp:  updatedUser.total_xp,
  })
})

// ── Histórico de atividade
app.get('/api/user/activity', requireAuth, (req, res) => {
  const weeks = parseInt(req.query.weeks) || 26
  const since = new Date()
  since.setDate(since.getDate() - weeks * 7)
  const sinceStr = since.toISOString().slice(0, 10)

  // Coleta todas as datas com atividade: lições, despesas, quiz, desafios
  const lessonDates = db.prepare(`SELECT DATE(completed_at) AS d FROM user_progress WHERE user_id = ? AND completed_at >= ? AND status = 'completed'`).all(req.user.id, sinceStr)
  const expenseDates = db.prepare(`SELECT DATE(created_at) AS d FROM expenses WHERE user_id = ? AND created_at >= ?`).all(req.user.id, sinceStr)
  const quizDates = db.prepare(`SELECT quiz_date AS d FROM daily_quiz_answers WHERE user_id = ? AND quiz_date >= ?`).all(req.user.id, sinceStr)
  const challengeDates = db.prepare(`SELECT DATE(completed_at) AS d FROM weekly_challenge_completions WHERE user_id = ? AND completed_at >= ?`).all(req.user.id, sinceStr)

  // Conta atividades por dia
  const counts = {}
  for (const row of [...lessonDates, ...expenseDates, ...quizDates, ...challengeDates]) {
    if (row.d) counts[row.d] = (counts[row.d] || 0) + 1
  }

  res.json({ activity: counts, sinceDate: sinceStr })
})

// ── Health check
app.get('/api/health', (_, res) => res.json({ status: 'UP', timestamp: new Date() }))

// ── Start
app.listen(PORT, () => {
  console.log('')
  console.log('╔══════════════════════════════════════╗')
  console.log('║    InvestUp API — Node.js/Express    ║')
  console.log(`║    Rodando em http://localhost:${PORT}  ║`)
  console.log('╚══════════════════════════════════════╝')
  console.log('')
  console.log('📡 Endpoints:')
  console.log('  POST /api/auth/register')
  console.log('  POST /api/auth/login')
  console.log('  GET  /api/user/me  [JWT]')
  console.log('')
  console.log(`🗄️  Banco SQLite: ${DB_PATH}`)
  console.log('')
})
