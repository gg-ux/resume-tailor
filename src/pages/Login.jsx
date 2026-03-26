import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui'
import { Input } from '../components/ui'
import { GoogleLogo, EnvelopeSimple } from '@phosphor-icons/react'

export default function Login() {
  const { isDark } = useTheme()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement auth
    console.log('Submit:', { email, password, isSignUp })
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

          {/* Google Button */}
          <Button
            variant="secondary"
            className="w-full mb-4"
            icon={<GoogleLogo size={18} weight="bold" />}
            iconPosition="left"
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
            <Button type="submit" className="w-full mt-6">
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
