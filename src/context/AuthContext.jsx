import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setProfile(data)
    } catch (err) {
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function signUp({ email, password, fullName, company, phone }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company, phone },
        emailRedirectTo: 'https://crm.freshleads.llc',
      },
    })
    return { data, error }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function resetPassword(email) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://crm.freshleads.llc/reset-password',
    })
  }

  async function updatePassword(newPassword) {
    return supabase.auth.updateUser({ password: newPassword })
  }

  async function updateProfile(updates) {
    if (!user) return { error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      fetchProfile,
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
