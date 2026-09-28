import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'

export default function Login() {
  const { signIn, switchAccount } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(form)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      // If logging in with admin email, route directly to admin dashboard
      if (form.email.toLowerCase().includes('admin')) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }
  }

  function handleDemoClientLogin() {
    switchAccount('client')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-fresh-black flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-fresh-orange rounded-xl flex items-center justify-center shadow-lg shadow-fresh-orange/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-tight">FreshLeads</p>
            <p className="text-fresh-muted text-xs">Client CRM Portal</p>
          </div>
        </div>

        <div className="card">
          <h1 className="text-2xl font-display font-bold text-white mb-1">Contractor Sign In</h1>
          <p className="text-fresh-muted text-sm mb-6">Access your verified roofing leads and call recordings</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 rounded-lg p-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Work Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="contractor@roofingcompany.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-fresh-orange hover:text-fresh-orange-light text-xs transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="••••••••"
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

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Signing in…' : 'Sign In to CRM'}
            </button>
          </form>

          {/* 1-Click Client Demo */}
          <div className="mt-5 pt-4 border-t border-fresh-border">
            <button
              type="button"
              onClick={handleDemoClientLogin}
              className="w-full btn-secondary text-xs py-2 justify-center text-slate-300 hover:text-white"
            >
              <span>1-Click Contractor Demo Access</span>
            </button>
          </div>
        </div>

        {/* Client signup */}
        <p className="text-center text-fresh-muted text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-fresh-orange hover:text-fresh-orange-light font-medium transition-colors">
            Sign up for FreshLeads CRM
          </Link>
        </p>

        {/* Separate Admin Portal Link */}
        <div className="text-center mt-6 pt-4 border-t border-fresh-border/40">
          <Link
            to="/admin/login"
            className="text-xs text-fresh-muted hover:text-fresh-orange inline-flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FreshLeads Staff & Operations? Access Admin Portal →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
