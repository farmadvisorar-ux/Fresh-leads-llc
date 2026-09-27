import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sendWelcomeEmail } from '../emailService'
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    company: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const { data, error: err } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      company: form.company,
      phone: form.phone,
    })
    setLoading(false)

    if (err) {
      setError(err.message)
      return
    }

    // Send welcome email
    try {
      await sendWelcomeEmail({ toName: form.fullName, toEmail: form.email })
    } catch (emailErr) {
      console.warn('Welcome email failed:', emailErr)
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-fresh-black flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in text-center">
          <div className="w-16 h-16 bg-green-900/30 border border-green-800/40 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Check your email</h2>
          <p className="text-fresh-muted mb-6">
            We've sent a confirmation link to <span className="text-slate-300 font-medium">{form.email}</span>.
            Click it to activate your account, then sign in.
          </p>
          <Link to="/login" className="btn-primary inline-flex">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fresh-black flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-fresh-orange rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-tight">FreshLeads</p>
            <p className="text-fresh-muted text-xs">CRM Portal</p>
          </div>
        </div>

        <div className="card">
          <h1 className="text-2xl font-display font-bold text-white mb-1">Create your account</h1>
          <p className="text-fresh-muted text-sm mb-6">Start managing your leads today</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 rounded-lg p-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className="input-field"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  className="input-field"
                  placeholder="Smith Roofing"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fresh-muted hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password *</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                className="input-field"
                placeholder="Repeat password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-fresh-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-fresh-orange hover:text-fresh-orange-light font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
