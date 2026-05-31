import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import {
  LayoutDashboard, BookOpen, TrendingUp, User, LogOut, Zap, Wallet, BarChart2, Moon, Sun, BookMarked, Trophy, Target
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/app',            label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/trilhas',    label: 'Trilhas',   icon: BookOpen },
  { to: '/app/simulador',  label: 'Simulador', icon: TrendingUp },
  { to: '/app/financas',   label: 'Finanças',  icon: Wallet },
  { to: '/app/metas',      label: 'Metas',     icon: Target },
  { to: '/app/ranking',    label: 'Ranking',   icon: Trophy },
  { to: '/app/glossario',  label: 'Glossário', icon: BookMarked },
  { to: '/app/perfil',     label: 'Perfil',    icon: User },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* ── Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 shadow-card border-r border-gray-100 dark:border-gray-800 fixed h-full z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <span className="text-2xl">📈</span>
          <span className="text-xl font-bold text-primary dark:text-blue-400">InvestUp</span>
        </div>

        {/* User summary */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="bg-primary-muted rounded-xl p-3">
              <p className="text-sm font-semibold text-primary truncate">{user.name}</p>
              <div className="flex gap-2 mt-1.5">
                <span className="badge-xp">⚡ {user.totalXp} XP</span>
                {user.streakDays > 0 && (
                  <span className="badge-streak">🔥 {user.streakDays}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navegação */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Dark mode toggle + Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-danger transition-all duration-150"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Conteúdo principal */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar mobile */}
        <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <span className="text-lg font-bold text-primary dark:text-blue-400">InvestUp</span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <>
                <span className="badge-xp">⚡ {user.totalXp}</span>
                {user.streakDays > 0 && (
                  <span className="badge-streak">🔥 {user.streakDays}</span>
                )}
              </>
            )}
            <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-500" />}
            </button>
          </div>
        </header>

        {/* Página */}
        <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
          <Outlet />
        </div>

        {/* Bottom nav mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex z-10">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => clsx(
                'flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-gray-400'
              )}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  )
}
