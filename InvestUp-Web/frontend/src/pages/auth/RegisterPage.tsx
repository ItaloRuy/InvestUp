import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.name || form.name.trim().length < 2) e.name = 'Nome deve ter pelo menos 2 caracteres'
    if (!form.email) e.email = 'E-mail obrigatório'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido'
    if (!form.password || form.password.length < 6) e.password = 'Senha deve ter pelo menos 6 caracteres'
    if (form.password !== form.confirm) e.confirm = 'As senhas não coincidem'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password)
      toast.success('Conta criada! Bem-vindo ao InvestUp! 🎉')
      navigate('/app')
    } catch {
      // erros tratados pelo interceptor
    } finally {
      setLoading(false)
    }
  }

  // Força da senha
  const passwordStrength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6)  s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Fraca', 'Razoável', 'Boa', 'Forte', 'Muito forte'][passwordStrength]
  const strengthColor = ['', 'bg-danger', 'bg-warning', 'bg-yellow-400', 'bg-success', 'bg-success'][passwordStrength]

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-4xl">📈</span>
          <h1 className="text-2xl font-bold text-primary mt-1">InvestUp</h1>
          <p className="text-sm text-gray-500 mt-1">Crie sua conta gratuita</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Criar conta</h2>
          <p className="text-sm text-gray-500 mb-5">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Faça login
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Nome */}
            <div>
              <label className="label" htmlFor="name">Seu nome</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="name" type="text" autoComplete="name"
                  className={`input pl-9 ${errors.name ? 'border-danger' : ''}`}
                  placeholder="Como posso te chamar?"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="reg-email">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="reg-email" type="email" autoComplete="email"
                  className={`input pl-9 ${errors.email ? 'border-danger' : ''}`}
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            </div>

            {/* Senha */}
            <div>
              <label className="label" htmlFor="reg-password">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="reg-password" type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pl-9 pr-10 ${errors.password ? 'border-danger' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Barra de força */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength ? strengthColor : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Força: <span className="font-medium">{strengthLabel}</span></p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="label" htmlFor="confirm">Confirmar senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirm" type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input pl-9 ${errors.confirm ? 'border-danger' : ''}`}
                  placeholder="Repita a senha"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
              </div>
              {errors.confirm && <p className="mt-1 text-xs text-danger">{errors.confirm}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : '🚀 Criar conta grátis'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            Projeto acadêmico · Gratuito · Sem cartão de crédito
          </p>
        </div>
      </div>
    </div>
  )
}
