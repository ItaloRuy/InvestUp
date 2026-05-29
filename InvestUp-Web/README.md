# InvestUp Web 🌐

Versão web da plataforma educacional de investimentos InvestUp.
Stack: **React + Vite + TypeScript + Tailwind** (frontend) / **Java Spring Boot 3 + JWT + H2** (backend)

---

## 🚀 Como rodar (desenvolvimento)

### Pré-requisitos
- Node.js 20+
- Java 21+ e Maven 3.9+

---

### 1️⃣ Backend (Spring Boot)

```bash
cd InvestUp-Web/backend

# Compilar e rodar
./mvnw spring-boot:run
# ou no Windows:
mvnw.cmd spring-boot:run
```

> **Sem Maven instalado?** Baixe o wrapper:
> ```bash
> mvn wrapper:wrapper
> ```
> Ou use sua IDE (IntelliJ / Eclipse / VS Code com extensão Java).

O backend sobe em: **http://localhost:8080**

Console H2 (banco em memória): **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:mem:investupdb`
- User: `sa` | Password: *(vazio)*

---

### 2️⃣ Frontend (React + Vite)

```bash
cd InvestUp-Web/frontend

# Instalar dependências
npm install

# Rodar em dev
npm run dev
```

O frontend sobe em: **http://localhost:5173**

O Vite já faz proxy de `/api` → `http://localhost:8080`, então não precisa configurar CORS manualmente.

---

## 📡 Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register` | Cadastro novo usuário | ❌ |
| POST | `/api/auth/login` | Login + token JWT | ❌ |
| GET  | `/api/user/me` | Dados do usuário logado | ✅ Bearer |

### Exemplo de registro (curl)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@email.com","password":"123456"}'
```

### Exemplo de login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"123456"}'
```

### Rota protegida
```bash
curl http://localhost:8080/api/user/me \
  -H "Authorization: Bearer <SEU_TOKEN>"
```

---

## 🗂 Estrutura do projeto

```
InvestUp-Web/
├── backend/                   ← Spring Boot 3
│   └── src/main/java/com/investup/api/
│       ├── config/            ← SecurityConfig (CORS, JWT, rotas)
│       ├── controller/        ← AuthController, UserController
│       ├── dto/               ← Request/Response DTOs
│       ├── entity/            ← User, UserProgress (JPA)
│       ├── exception/         ← GlobalExceptionHandler
│       ├── repository/        ← JPA repositories
│       ├── security/          ← JwtService, JwtAuthFilter
│       └── service/           ← AuthService
│
└── frontend/                  ← React + Vite + Tailwind
    └── src/
        ├── api/               ← axios client com interceptors
        ├── components/
        │   └── layout/        ← AppLayout (sidebar + nav)
        ├── contexts/          ← AuthContext (JWT + localStorage)
        ├── pages/
        │   ├── auth/          ← LoginPage, RegisterPage
        │   └── app/           ← Dashboard, Lessons, Lesson, Simulator, Profile
        └── types/             ← TypeScript interfaces
```

---

## 🔐 Como funciona o login

```
1. Usuário preenche login → POST /api/auth/login
2. Spring Security valida email + senha (BCrypt)
3. JwtService gera token JWT (validade: 24h)
4. Token retorna no body + salvo no localStorage
5. axios interceptor anexa "Authorization: Bearer <token>" em toda requisição
6. JwtAuthFilter valida o token em rotas protegidas
7. Logout → remove token do localStorage + redireciona para /login
```

---

## 📋 Funcionalidades do MVP

- ✅ Cadastro e login com JWT
- ✅ Rotas protegidas (redireciona para /login se não autenticado)
- ✅ Dashboard com XP, streak, trilhas e missão do dia
- ✅ Trilhas de lições com status (locked/in_progress/completed)
- ✅ Tela de lição com conteúdo + quiz interativo + XP
- ✅ Simulador de carteira com gráfico (Recharts)
- ✅ Perfil do usuário com conquistas
- ✅ Layout responsivo (desktop + mobile)
- ✅ Toast notifications
- ✅ Indicador de força de senha no cadastro

---

## 🎓 Fins acadêmicos

Projeto open source para fins educacionais e produção de artigos.
Não usar em produção sem implementar: rate limiting, refresh tokens, validação de email, HTTPS.
