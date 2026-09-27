import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { ToastContainer, useToast } from '../components/Toast'
import { User, Building2, Phone, Mail, Lock, Shield, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function Profile() {
  const { user, profile, updateProfile, updatePassword } = useAuth()
  const { toasts, addToast, removeToast } = useToast()

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    company: profile?.company || '',
    phone: profile?.phone || '',
  })
  const [passwordForm, setPasswordForm] = useState({ password: '', confirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleProfileSave(e) {
    e.preventDefault()
    setSavingProfile(true)
    const { error } = await updateProfile(profileForm)
    setSavingProfile(false)
    if (error) addToast('Failed to update profile', 'error')
    else addToast('Profile updated!', 'success')
  }

  async function handlePasswordSave(e) {
    e.preventDefault()
    if (passwordForm.password !== passwordForm.confirm) {
      addToast('Passwords do not match', 'error')
      return
    }
    if (passwordForm.password.length < 8) {
      addToast('Minimum 8 characters', 'warning')
      return
    }
    setSavingPassword(true)
    const { error } = await updatePassword(passwordForm.password)
    setSavingPassword(false)
    if (error) addToast(error.message, 'error')
    else {
      addToast('Password updated!', 'success')
      setPasswordForm({ password: '', confirm: '' })
    }
  }

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  return (
    <div className="flex h-screen bg-fresh-black overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8 max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-fresh-orange" />
              <span className="text-fresh-orange text-sm font-semibold">Profile</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white">Account Settings</h1>
            <p className="text-fresh-muted mt-1">Manage your profile and security settings</p>
          </div>

          {/* Avatar + info */}
          <div className="card mb-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-fresh-orange/20 border-2 border-fresh-orange/40 flex items-center justify-center flex-shrink-0">
              <span className="text-fresh-orange font-display font-bold text-xl">{initials}</span>
            </div>
            <div>
              <p className="text-lg font-display font-bold text-white">{profile?.full_name || 'Client'}</p>
              <p className="text-fresh-muted text-sm flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
              {profile?.created_at && (
                <p className="text-fresh-muted text-xs mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Member since {format(new Date(profile.created_at), 'MMMM yyyy')}
                </p>
              )}
            </div>
            {profile?.role === 'admin' && (
              <div className="ml-auto badge-new flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Admin
              </div>
            )}
          </div>

          {/* Profile Form */}
          <div className="card mb-6">
            <h2 className="font-display font-bold text-white mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-fresh-orange" />
              Personal Info
            </h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fresh-muted" />
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="input-field pl-10"
                    placeholder="John Smith"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fresh-muted" />
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={e => setProfileForm({ ...profileForm, company: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Smith Roofing"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fresh-muted" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="input-field pl-10"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  readOnly
                  className="input-field opacity-60 cursor-not-allowed"
                />
                <p className="text-fresh-muted text-xs mt-1">Contact support to change your email</p>
              </div>
              <button type="submit" disabled={savingProfile} className="btn-primary">
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Password Form */}
          <div className="card">
            <h2 className="font-display font-bold text-white mb-5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-fresh-orange" />
              Change Password
            </h2>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  minLength={8}
                  value={passwordForm.password}
                  onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  className="input-field"
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="input-field"
                  placeholder="Repeat password"
                />
              </div>
              <button type="submit" disabled={savingPassword} className="btn-secondary">
                {savingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
