import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { authAPI } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Always try backend first
      try {
        const response: any = await authAPI.login(email, password)
        console.log('Login response:', response)

        if (response.success && response.token) {
          // Check if user is admin
          if (response.user?.userType !== 'admin') {
            toast.error('Access denied. Admin privileges required.')
            setLoading(false)
            return
          }

          console.log('Storing token and user:', {
            token: response.token.substring(0, 20) + '...',
            user: response.user
          })

          localStorage.setItem('admin_token', response.token)
          localStorage.setItem('admin_user', JSON.stringify(response.user || { email }))
          toast.success('Welcome back! Redirecting...')
          setTimeout(() => navigate('/dashboard'), 500)
          return
        } else {
          console.error('No token in response:', response)
          throw new Error('No token received from server')
        }
      } catch (backendError: any) {
        console.error('Backend login error:', backendError.response?.data || backendError.message)

        // If user not found on production, show helpful message
        if (backendError.response?.data?.message?.includes('User not found')) {
          toast.error('Account not found on production server. Please use valid credentials or contact administrator.')
          setLoading(false)
          return
        }
        // Not a demo account and backend failed
        throw backendError
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || 'Invalid credentials. Please check your email and password.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(1200px_600px_at_50%_-20%,theme(colors.primary/0.08),transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md mx-auto p-8 bg-card-light dark:bg-card-dark backdrop-blur border border-border-light dark:border-border-dark rounded-xl shadow-xl">
        <div className="flex flex-col items-center gap-4 mb-6">
          <img
            src="/logo.png"
            alt="Connecta Logo"
            className="h-12 w-auto"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-light-primary dark:text-dark-primary">Admin Portal</h1>
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary mt-1">Manage your platform with ease</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-1 text-text-light-primary dark:text-dark-primary">Sign in</h2>
        <p className="text-sm text-text-light-secondary dark:text-dark-secondary mb-6">Use your admin credentials to access the portal.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-left text-text-light-primary dark:text-dark-primary">Email</label>
            <div className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3">
              <Icon name="mail" className="text-text-light-secondary dark:text-dark-secondary" />
              <input
                type="email"
                className="w-full h-11 bg-transparent outline-none text-sm text-text-light-primary dark:text-dark-primary placeholder:text-text-light-secondary dark:placeholder:text-dark-secondary"
                placeholder="admin@connecta.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-left text-text-light-primary dark:text-dark-primary">Password</label>
            <div className="flex items-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3">
              <Icon name="lock" className="text-text-light-secondary dark:text-dark-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full h-11 bg-transparent outline-none text-sm text-text-light-primary dark:text-dark-primary placeholder:text-text-light-secondary dark:placeholder:text-dark-secondary"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-text-light-secondary dark:text-dark-secondary hover:text-text-light-primary dark:hover:text-dark-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-medium hover:opacity-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Icon name="progress_activity" className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Icon name="login" />
                Sign in
              </>
            )}
          </button>


        </form>


      </div>
    </div>
  )
}
