import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui'
import { Input } from '../components/ui'
import { GoogleLogo } from '@phosphor-icons/react'

export default function Login() {
  const { isDark } = useTheme()
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: authError } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password)

      if (authError) {
        setError(authError.message)
      } else {
        if (isSignUp) {
          setError('Check your email for a confirmation link!')
        } else {
          navigate(from, { replace: true })
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { error: authError } = await signInWithGoogle()
      if (authError) {
        setError(authError.message)
      }
    } catch (err) {
      setError('Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="block text-center mb-8">
          <span className="font-mono text-sm tracking-wide theme-heading">Resume Tailor</span>
        </Link>

        {/* Card */}
        <div className={`p-8 rounded-2xl ${isDark ? 'bg-white/[0.02]' : 'bg-white'} ${
          isDark ? '' : 'shadow-lg'
        }`}>
          <h1 className="font-satoshi text-2xl font-semibold theme-heading text-center mb-2">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="font-satoshi text-sm theme-body text-center mb-8">
            {isSignUp ? 'Start optimizing your resume' : 'Sign in to continue'}
          </p>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              error.includes('Check your email')
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            }`}>
              {error}
            </div>
          )}

          {/* Google Button */}
          <Button
            variant="secondary"
            className="w-full mb-4"
            icon={<GoogleLogo size={18} weight="bold" />}
            iconPosition="left"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
            <span className="font-mono text-[10px] uppercase tracking-wide theme-muted">or</span>
            <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full mt-6" loading={loading} disabled={loading}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 font-satoshi text-sm theme-body">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="theme-accent font-medium hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
