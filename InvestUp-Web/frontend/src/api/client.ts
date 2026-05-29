import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ── Interceptor: anexa JWT em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('investup_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Interceptor: trata erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error

    if (status === 401) {
      localStorage.removeItem('investup_token')
      localStorage.removeItem('investup_user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (status === 409) {
      toast.error(message || 'E-mail já cadastrado')
    } else if (status === 400) {
      toast.error('Dados inválidos. Verifique o formulário.')
    } else if (status >= 500) {
      toast.error('Erro no servidor. Tente novamente.')
    }

    return Promise.reject(error)
  }
)

export default api
