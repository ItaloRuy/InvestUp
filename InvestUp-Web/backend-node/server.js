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

  console.log(`🔐 Login: ${user.email}`)
  const token = generateToken(user)
  return res.json(authResponse(token, user))
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

  db.prepare('UPDATE users SET total_xp = total_xp + ?, lessons_completed = lessons_completed + 1 WHERE id = ?')
    .run(xpReward, userId)

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
