import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui'
import { FileText, MagnifyingGlass, Download, Moon, Sun } from '@phosphor-icons/react'

export default function Landing() {
  const { isDark, toggleTheme } = useTheme()

  const steps = [
    {
      icon: FileText,
      title: 'Upload Your Resume',
      description: 'Upload your PDF or paste your resume text. Our AI parses it into editable sections.',
    },
    {
      icon: MagnifyingGlass,
      title: 'Paste Job Description',
      description: 'Add any job listing. We analyze keywords and identify gaps in your resume.',
    },
    {
      icon: Download,
      title: 'Download Tailored Resume',
      description: 'Accept suggestions, preview changes, and export an ATS-optimized PDF.',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-mono text-sm tracking-wide theme-heading">
            Resume Tailor
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login">
              <Button variant="secondary" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-silk text-4xl md:text-5xl lg:text-6xl theme-heading mb-6 leading-tight">
            Tailor your resume<br />in seconds
          </h1>
          <p className="font-satoshi text-lg md:text-xl theme-body mb-10 max-w-xl mx-auto">
            Upload once, optimize for every job. AI-powered keyword matching and suggestions to help you land more interviews.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Button variant="ghost" size="lg">See How It Works</Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-center theme-muted mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`p-6 rounded-2xl ${
                  isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]'
                }`}>
                  <step.icon size={24} className="theme-accent" />
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest theme-muted mb-2">
                  Step {index + 1}
                </div>
                <h3 className="font-satoshi text-lg font-semibold theme-heading mb-2">
                  {step.title}
                </h3>
                <p className="font-satoshi text-sm theme-body">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className={`max-w-3xl mx-auto text-center p-12 rounded-3xl ${
          isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'
        }`}>
          <h2 className="font-silk text-2xl md:text-3xl theme-heading mb-4">
            Ready to land your dream job?
          </h2>
          <p className="font-satoshi theme-body mb-8">
            Start optimizing your resume today. It's free.
          </p>
          <Link to="/login">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 px-6 border-t ${isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="font-mono text-[11px] theme-muted">
            Built by Grace Guo
          </p>
          <p className="font-mono text-[11px] theme-muted">
            2025
          </p>
        </div>
      </footer>
    </div>
  )
}
