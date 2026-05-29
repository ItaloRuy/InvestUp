import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.email)    e.email    = 'E-mail obrigatório'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido'
    if (!form.password) e.password = 'Senha obrigatória'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Bem-vindo de volta! 🎉')
      navigate('/app')
    } catch {
      // erros tratados pelo interceptor do axios
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Painel esquerdo — hero */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 bg-primary px-12">
        <div className="max-w-md text-white space-y-6">
          <div className="text-6xl">📈</div>
          <h1 className="text-4xl font-bold leading-tight">
            Aprenda a investir do zero
          </h1>
          <p className="text-lg text-blue-200">
            Trilhas interativas, simulações reais e gamificação para você dominar o mundo dos investimentos.
          </p>
          <div className="flex gap-4 pt-4">
            {['🛡️ Renda Fixa', '📈 Ações', '🏢 FIIs', '🌍 ETFs'].map((item) => (
              <span key={item} className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Header mobile */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-4xl">📈</span>
            <h1 className="text-2xl font-bold text-primary mt-2">InvestUp</h1>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Entrar na conta</h2>
            <p className="text-sm text-gray-500 mb-6">
              Não tem conta?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Cadastre-se grátis
              </Link>
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label className="label" htmlFor="email">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email" type="email" autoComplete="email"
                    className={`input pl-9 ${errors.email ? 'border-danger focus:ring-danger/30' : ''}`}
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1 text-xs text-danger">{errors.email}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label className="label" htmlFor="password">Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password" type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`input pl-9 pr-10 ${errors.password ? 'border-danger focus:ring-danger/30' : ''}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-danger">{errors.password}</p>
                )}
              </div>

              <button
                type="submit" disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </form>

            {/* Divisor */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 border-t border-gray-100" />
              <span className="text-xs text-gray-400">ou teste com</span>
              <div className="flex-1 border-t border-gray-100" />
            </div>

            {/* Demo rápido */}
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true)
                try {
                  await login('demo@investup.com', 'demo123')
                  toast.success('Bem-vindo à demo! 🎓')
                  navigate('/app')
                } catch {
                  // fallback: preenche o form
                  setForm({ email: 'demo@investup.com', password: 'demo123' })
                  toast('Dados preenchidos! Clique em Entrar.', { icon: '💡' })
                } finally {
                  setLoading(false)
                }
              }}
              className="btn-outline w-full text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Entrando na demo...
                </span>
              ) : '🎓 Conta de demonstração'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
