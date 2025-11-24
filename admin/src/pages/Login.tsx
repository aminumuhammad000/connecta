import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'

const DEMO_EMAIL = 'admin@connecta.com'
const DEMO_PASSWORD = 'demo1234'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        toast.success('Welcome back! Redirecting...')
        navigate('/dashboard')
      } else {
        toast.error('Invalid credentials')
      }
      setLoading(false)
    }, 700)
  }

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    toast('Using demo account', { icon: '👋' })
    setLoading(true)
    setTimeout(() => {
      toast.success('Signed in as Demo Admin')
      navigate('/dashboard')
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(1200px_600px_at_50%_-20%,theme(colors.primary/0.08),transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md mx-auto p-8 bg-white/80 dark:bg-stone-900/70 backdrop-blur border border-stone-200/70 dark:border-stone-800 rounded-xl shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Icon name="hub" className="text-primary" size={30} />
          <h1 className="text-2xl font-bold">Connecta Admin</h1>
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
          Hint: Demo email <span className="font-medium">{DEMO_EMAIL}</span> & password <span className="font-medium">{DEMO_PASSWORD}</span>
        </p>
      </div>
    </div>
  )
}
