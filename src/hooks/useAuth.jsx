import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id, session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id, session.user)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId, sessionUser) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error || !data) {
      const email = sessionUser?.email || ''
      const name = sessionUser?.user_metadata?.name || email.split('@')[0] || 'Volunteer'
      const newProfile = {
        id: userId,
        name: name,
        role: 'volunteer'
      }
      
      const { data: insertedData } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()
      
      setProfile(insertedData || newProfile)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  async function signIn(email, password) {
    let loginEmail = email === 'admin' ? 'admin@example.com' : email
    let loginPassword = email === 'admin' && password === 'admin' ? 'admin_password' : password

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
      if (error) {
        // If login failed because user doesn't exist, attempt to auto-signup for the admin user
        if (email === 'admin' && password === 'admin' && (error.status === 400 || error.message.includes('Invalid login credentials'))) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: loginEmail,
            password: loginPassword,
            options: {
              data: { name: 'Admin User' }
            }
          })
          if (signUpError) throw signUpError
          
          if (signUpData?.session) {
            setUser(signUpData.session.user)
            return
          } else {
            throw new Error("Admin account was created, but email confirmation is required. Please check your email or disable 'Confirm email' in Supabase Auth settings.")
          }
        }
        throw error
      }
    } catch (err) {
      throw err
    }
  }

  async function signUp(email, password, name) {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } }
    })
    if (error) throw error
  }

  async function signOut() {
    setUser(null)
    setProfile(null)
    await supabase.auth.signOut()
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, signUp, signOut, refetchProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
