import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Páginas de autenticação
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Páginas do app (protegidas)
import DashboardPage  from './pages/app/DashboardPage'
import LessonsPage    from './pages/app/LessonsPage'
import LessonPage     from './pages/app/LessonPage'
import SimulatorPage  from './pages/app/SimulatorPage'
import ProfilePage    from './pages/app/ProfilePage'
import FinancePage    from './pages/app/FinancePage'
import AcoesPage      from './pages/app/AcoesPage'
import GlossaryPage   from './pages/app/GlossaryPage'
import RankingPage    from './pages/app/RankingPage'
import GoalsPage      from './pages/app/GoalsPage'

// Layout com sidebar/navbar
import AppLayout from './components/layout/AppLayout'

// ── Rota protegida — redireciona para /login se não autenticado
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// ── Rota pública — redireciona para /app se já autenticado
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <FullPageLoader />
  if (isAuthenticated) return <Navigate to="/app" replace />
  return <>{children}</>
}

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Carregando...</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rota raiz → redireciona conforme auth */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* Rotas públicas */}
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Rotas protegidas dentro do AppLayout */}
        <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index          element={<DashboardPage />} />
          <Route path="trilhas" element={<LessonsPage />} />
          <Route path="trilhas/:trailId/licao/:lessonId" element={<LessonPage />} />
          <Route path="simulador" element={<SimulatorPage />} />
          <Route path="financas"  element={<FinancePage />} />
          <Route path="acoes"     element={<AcoesPage />} />
          <Route path="glossario" element={<GlossaryPage />} />
          <Route path="metas"     element={<GoalsPage />} />
          <Route path="ranking"   element={<RankingPage />} />
          <Route path="perfil"    element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </AuthProvider>
  )
}
