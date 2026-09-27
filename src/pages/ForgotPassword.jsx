import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await resetPassword(email)
    setLoading(false)
    if (err) setError(err.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen bg-fresh-black flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-900/30 border border-green-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-fresh-muted text-sm">
                We've sent a reset link to <span className="text-slate-300 font-medium">{email}</span>.
                It expires in 1 hour.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-white mb-1">Reset password</h1>
              <p className="text-fresh-muted text-sm mb-6">Enter your email and we'll send a reset link</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 rounded-lg p-3 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@company.com"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <Link to="/login" className="flex items-center gap-2 justify-center text-fresh-muted hover:text-slate-300 text-sm mt-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  )
}
