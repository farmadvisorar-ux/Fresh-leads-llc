import { createContext, useContext, useEffect, useState } from 'react'
import { api, isFirebaseConfigured } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = api.onAuthChange(({ user: u, profile: p }) => {
      setUser(u)
      setProfile(p)
      setLoading(false)
    })
    return () => unsubscribe && unsubscribe()
  }, [])

  async function signUp({ email, password, fullName, company, phone }) {
    try {
      const res = await api.signUp({ email, password, fullName, company, phone })
      setUser(res.user)
      setProfile(res.profile)
      return { data: res, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async function signIn({ email, password }) {
    try {
      const res = await api.signIn({ email, password })
      setUser(res.user)
      setProfile(res.profile)
      return { data: res, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async function signOut() {
    await api.signOut()
    setUser(null)
    setProfile(null)
  }

  async function resetPassword(email) {
    try {
      await api.resetPassword(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  async function updatePassword(newPassword) {
    try {
      await api.updatePassword(newPassword)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  async function updateProfile(updates) {
    if (!user) return { error: new Error('Not authenticated') }
    try {
      const updated = await api.updateProfile(user.uid || user.id, updates)
      setProfile(prev => ({ ...prev, ...updated }))
      return { data: updated, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Switch demo account helper
  function switchAccount(role = 'client') {
    if (role === 'admin') {
      const adminProfile = {
        id: 'admin-user-1',
        email: 'admin@freshleads.llc',
        full_name: 'FreshLeads Admin',
        company: 'FreshLeads HQ',
        phone: '(800) 555-0100',
        role: 'admin',
        created_at: new Date().toISOString(),
      }
      setUser({ uid: adminProfile.id, email: adminProfile.email, displayName: adminProfile.full_name })
      setProfile(adminProfile)
      localStorage.setItem('freshleads_current_user', JSON.stringify({
        user: { uid: adminProfile.id, email: adminProfile.email, displayName: adminProfile.full_name },
        profile: adminProfile,
      }))
    } else {
      const clientProfile = {
        id: 'client-user-1',
        email: 'client@freshleads.llc',
        full_name: 'John Miller',
        company: 'Miller Roofing Solutions',
        phone: '(214) 555-0192',
        role: 'client',
        created_at: new Date().toISOString(),
      }
      setUser({ uid: clientProfile.id, email: clientProfile.email, displayName: clientProfile.full_name })
      setProfile(clientProfile)
      localStorage.setItem('freshleads_current_user', JSON.stringify({
        user: { uid: clientProfile.id, email: clientProfile.email, displayName: clientProfile.full_name },
        profile: clientProfile,
      }))
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isFirebaseLive: isFirebaseConfigured,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      switchAccount,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
