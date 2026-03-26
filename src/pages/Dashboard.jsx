import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Button } from '../components/ui'
import { Textarea } from '../components/ui'
import { Tag } from '../components/ui'
import {
  FileText,
  Plus,
  Upload,
  Moon,
  Sun,
  SignOut,
  MagnifyingGlass,
  CheckCircle,
  Warning,
} from '@phosphor-icons/react'

export default function Dashboard() {
  const { isDark, toggleTheme } = useTheme()
  const [hasResume, setHasResume] = useState(false)
  const [jobDescription, setJobDescription] = useState('')

  // Mock data for demonstration
  const mockAnalysis = {
    matchScore: 72,
    matchedKeywords: ['React', 'TypeScript', 'UI/UX', 'Figma', 'Design Systems'],
    missingKeywords: ['Next.js', 'GraphQL', 'AWS', 'Agile'],
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className={`sticky top-0 z-50 px-6 py-4 border-b ${
        isDark ? 'bg-[#0a0a0a]/80 border-white/[0.06]' : 'bg-[#FAF8F4]/80 border-black/[0.06]'
      } backdrop-blur-md`}>
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
            <Link to="/">
              <Button variant="ghost" size="sm" icon={<SignOut size={16} />}>
                Sign Out
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Resume */}
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-widest theme-muted mb-4">
              Your Resume
            </h2>

            {!hasResume ? (
              /* Upload State */
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
                  isDark
                    ? 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                    : 'border-black/10 hover:border-black/20 hover:bg-black/[0.02]'
                }`}
                onClick={() => setHasResume(true)}
              >
                <Upload size={40} className="mx-auto mb-4 theme-muted" />
                <p className="font-satoshi text-lg font-medium theme-heading mb-2">
                  Upload your resume
                </p>
                <p className="font-satoshi text-sm theme-body mb-4">
                  Drag and drop a PDF, or click to browse
                </p>
                <Button variant="secondary" size="sm">
                  Choose File
                </Button>
              </div>
            ) : (
              /* Resume Preview */
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/[0.02]' : 'bg-white shadow-sm'}`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]'}`}>
                    <FileText size={24} className="theme-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-satoshi font-semibold theme-heading">Grace Guo</h3>
                    <p className="font-satoshi text-sm theme-body">Product Designer</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>

                {/* Skills Preview */}
                <div className="mb-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest theme-muted mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Figma', 'UI/UX', 'Design Systems'].map(skill => (
                      <Tag key={skill}>{skill}</Tag>
                    ))}
                  </div>
                </div>

                {/* Experience Preview */}
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest theme-muted mb-2">
                    Experience
                  </p>
                  <p className="font-satoshi text-sm theme-body">
                    3 positions • 5+ years
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Job Analysis */}
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-widest theme-muted mb-4">
              Job Description
            </h2>

            <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/[0.02]' : 'bg-white shadow-sm'}`}>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                className="mb-4"
              />
              <Button
                className="w-full"
                disabled={!jobDescription || !hasResume}
                icon={<MagnifyingGlass size={16} />}
              >
                Analyze Match
              </Button>
            </div>

            {/* Analysis Results (shown when we have both resume and JD) */}
            {hasResume && jobDescription && (
              <div className={`mt-6 rounded-2xl p-6 ${isDark ? 'bg-white/[0.02]' : 'bg-white shadow-sm'}`}>
                {/* Match Score */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-3 ${
                    isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]'
                  }`}>
                    <span className="font-mono text-2xl font-semibold theme-heading">
                      {mockAnalysis.matchScore}%
                    </span>
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-widest theme-muted">
                    Match Score
                  </p>
                </div>

                {/* Matched Keywords */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-[#22C55E]" />
                    <p className="font-mono text-[10px] uppercase tracking-widest theme-muted">
                      Matched Keywords
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mockAnalysis.matchedKeywords.map(keyword => (
                      <Tag key={keyword} variant="success">{keyword}</Tag>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Warning size={16} className="text-[#F59E0B]" />
                    <p className="font-mono text-[10px] uppercase tracking-widest theme-muted">
                      Missing Keywords
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mockAnalysis.missingKeywords.map(keyword => (
                      <Tag key={keyword} variant="warning">{keyword}</Tag>
                    ))}
                  </div>
                </div>

                <Button variant="secondary" className="w-full">
                  View Suggestions
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
