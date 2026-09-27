import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, AlertCircle, CheckCircle } from 'lucide-react'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Minimum 8 characters'); return }
    setError('')
    setLoading(true)
    const { error: err } = await updatePassword(form.password)
    setLoading(false)
    if (err) setError(err.message)
    else {
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-fresh-black flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-fresh-orange rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg">FreshLeads</p>
            <p className="text-fresh-muted text-xs">CRM Portal</p>
          </div>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold text-white mb-2">Password updated!</h2>
              <p className="text-fresh-muted text-sm">Redirecting to dashboard…</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-white mb-1">Set new password</h1>
              <p className="text-fresh-muted text-sm mb-6">Choose a secure password for your account</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 rounded-lg p-3 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="input-field"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
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
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
