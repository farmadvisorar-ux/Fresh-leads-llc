import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Zap, ShieldCheck, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AdminLogin() {
  const { signIn, switchAccount } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn({ email, password })
    setLoading(false)

    if (err) {
      setError(err.message)
    } else {
      navigate('/admin/dashboard')
    }
  }

  function handleQuickAdminLogin() {
    switchAccount('admin')
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#06070A] flex items-center justify-center p-4 selection:bg-fresh-orange selection:text-white">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-fresh-orange rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-fresh-orange/25">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="font-display font-bold text-white text-xl tracking-tight">FreshLeads</h1>
            <span className="text-[10px] font-black uppercase tracking-wider bg-fresh-orange/20 text-fresh-orange px-2 py-0.5 rounded border border-fresh-orange/40">
              OPS CONSOLE
            </span>
          </div>
          <p className="text-fresh-muted text-xs">
            Restricted Internal Dispatch & CRM Administration Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="card border-fresh-border/80 bg-[#0C0E14] shadow-2xl p-7">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-fresh-border">
            <ShieldCheck className="w-5 h-5 text-fresh-orange" />
            <div>
              <p className="text-sm font-bold text-white">Administrator Authentication</p>
              <p className="text-[11px] text-fresh-muted">Authorized FreshLeads personnel only</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-950/30 border border-red-800/40 rounded-lg p-3 mb-5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field text-xs py-2.5"
                placeholder="admin@freshleads.llc"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field text-xs py-2.5 pr-10"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fresh-muted hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-xs shadow-lg shadow-fresh-orange/20"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating…' : 'Access Ops Portal'}</span>
            </button>
          </form>

          {/* 1-Click Demo Login Button for team verification */}
          <div className="mt-5 pt-4 border-t border-fresh-border">
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              className="w-full btn-secondary text-xs py-2 justify-center text-slate-300 hover:text-white border-fresh-border hover:border-fresh-orange/40"
            >
              <Zap className="w-3.5 h-3.5 text-fresh-orange" />
              <span>1-Click Team Access (admin@freshleads.llc)</span>
            </button>
          </div>
        </div>

        {/* Back to Client CRM */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-xs text-fresh-muted hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Client CRM Portal</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
