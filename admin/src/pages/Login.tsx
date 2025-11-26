import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { authAPI } from '../services/api'

// Demo admin accounts (fallback when database is unavailable)
const DEMO_ADMINS = [
  { email: 'admin@connecta.com', password: 'demo1234', name: 'Admin User' },
  { email: 'safe@admin.com', password: 'imsafe', name: 'Safe Admin' }
]

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
        const response = await authAPI.login(email, password)
        if (response.success && response.token) {
          localStorage.setItem('admin_token', response.token)
          localStorage.setItem('admin_user', JSON.stringify(response.user))
          toast.success('Welcome back! Redirecting...')
          setTimeout(() => navigate('/dashboard'), 500)
          return
        }
      } catch (backendError: any) {
        console.warn('Backend error:', backendError.message)
        
        // Check if this is a demo admin account
        const demoAdmin = DEMO_ADMINS.find(
          admin => admin.email === email && admin.password === password
        )
        
        if (demoAdmin) {
          // Backend unavailable but valid demo credentials - use mock login
          const names = demoAdmin.name.split(' ')
          const mockUser = {
            _id: 'mock-admin-' + Date.now(),
            email: demoAdmin.email,
            firstName: names[0],
            lastName: names[1] || 'User',
            userType: 'admin',
            profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(demoAdmin.name)}&background=fd6730&color=fff&size=256`,
          }
          const mockToken = 'mock-jwt-token-' + Date.now()
          localStorage.setItem('admin_token', mockToken)
          localStorage.setItem('admin_user', JSON.stringify(mockUser))
          toast.success('Welcome back! (Demo Mode) 🚀')
          setTimeout(() => navigate('/dashboard'), 500)
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

  const handleDemoLogin = () => {
    setEmail(DEMO_ADMINS[0].email)
    setPassword(DEMO_ADMINS[0].password)
    toast('Using demo account', { icon: '👋' })
    // Automatically trigger login after setting demo credentials
    setTimeout(() => {
      const form = document.querySelector('form')
      form?.requestSubmit()
    }, 500)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(1200px_600px_at_50%_-20%,theme(colors.primary/0.08),transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md mx-auto p-8 bg-white/80 dark:bg-stone-900/70 backdrop-blur border border-stone-200/70 dark:border-stone-800 rounded-xl shadow-xl">
        <div className="flex flex-col items-center gap-4 mb-6">
          <img 
            src="/logo.png" 
            alt="Connecta Logo" 
            className="h-12 w-auto"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-sm text-stone-500 mt-1">Manage your platform with ease</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-1">Sign in</h2>
        <p className="text-sm text-stone-500 mb-6">Use your admin credentials or try the demo account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="flex items-center gap-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3">
              <Icon name="mail" className="text-stone-500" />
              <input
                type="email"
                className="w-full h-11 bg-transparent outline-none text-sm"
                placeholder="admin@connecta.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="flex items-center gap-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3">
              <Icon name="lock" className="text-stone-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full h-11 bg-transparent outline-none text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-200"
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

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            <Icon name="bolt" />
            Try demo login
          </button>
        </form>

        <p className="mt-6 text-xs text-stone-500">
          Hint: Use <span className="font-medium">{DEMO_ADMINS[0].email}</span> or <span className="font-medium">{DEMO_ADMINS[1].email}</span>
        </p>
      </div>
    </div>
  )
}
