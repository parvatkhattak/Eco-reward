import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, isDemoActive } from '../lib/supabase'

const AuthContext = createContext(null)

// ---------- localStorage fallback (demo mode, no Supabase keys needed) ----------
const LS_USERS = 'eco_users'
const LS_SESSION = 'eco_session'

const getLocalUsers = () => JSON.parse(localStorage.getItem(LS_USERS) || '[]')
const saveLocalUsers = (users) => localStorage.setItem(LS_USERS, JSON.stringify(users))

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on load
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user)
        setLoading(false)
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user)
        else setProfile(null)
      })
      return () => subscription.unsubscribe()
    } else {
      const session = JSON.parse(localStorage.getItem(LS_SESSION) || 'null')
      if (session) {
        setUser({ id: session.id, email: session.email })
        setProfile(session)
      }
      setLoading(false)
    }
  }, [])

  async function fetchProfile(authUser) {
    const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
    if (data) {
      setProfile(data)
      return
    }
    // Self-heal: account predates the profile trigger — create the row now from auth metadata
    const meta = authUser.user_metadata ?? {}
    const row = {
      id: authUser.id,
      name: meta.name ?? authUser.email?.split('@')[0] ?? 'Eco User',
      phone: meta.phone ?? null,
      email: authUser.email,
      address: meta.address ?? null,
      lat: meta.lat ?? null,
      lng: meta.lng ?? null,
      user_type: meta.user_type ?? 'household',
      eco_points: 0,
    }
    const { data: created, error } = await supabase
      .from('profiles')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single()
    if (!error && created) setProfile(created)
    else setProfile(row)
  }

  // ---------- Sign up ----------
  async function signUp({ email, password, name, phone, address, lat, lng, userType }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, address, lat, lng, user_type: userType },
        },
      })
      if (error) throw error
      // Profile row is auto-created by a DB trigger from the metadata above.
      // Set it optimistically so the UI has it immediately.
      setProfile({
        id: data.user?.id,
        name, phone, email, address, lat, lng,
        user_type: userType,
        eco_points: 0,
      })
      return data.user
    } else {
      const users = getLocalUsers()
      if (users.some((u) => u.email === email)) throw new Error('An account with this email already exists.')
      const newUser = {
        id: crypto.randomUUID(),
        email, password, name, phone, address, lat, lng,
        user_type: userType,
        eco_points: 0,
        created_at: new Date().toISOString(),
      }
      users.push(newUser)
      saveLocalUsers(users)
      const { password: _pw, ...session } = newUser
      localStorage.setItem(LS_SESSION, JSON.stringify(session))
      setUser({ id: newUser.id, email })
      setProfile(session)
      return newUser
    }
  }

  // ---------- Sign in ----------
  async function signIn(email, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data.user
    } else {
      const found = getLocalUsers().find((u) => u.email === email && u.password === password)
      if (!found) throw new Error('Invalid email or password.')
      const { password: _pw, ...session } = found
      localStorage.setItem(LS_SESSION, JSON.stringify(session))
      setUser({ id: found.id, email })
      setProfile(session)
      return found
    }
  }

  // ---------- Google ----------
  async function signInWithGoogle() {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      })
      if (error) throw error
    } else {
      throw new Error('Google sign-in requires Supabase to be configured. Add your keys to .env')
    }
  }

  // ---------- Phone (demo: mock OTP flow) ----------
  async function signInWithPhone(phone) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
      return { otpSent: true }
    } else {
      const found = getLocalUsers().find((u) => u.phone === phone)
      if (!found) throw new Error('No account found with this phone number. Please sign up first.')
      return { otpSent: true, demoUser: found }
    }
  }

  async function verifyPhoneOtp(phone, token) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
      if (error) throw error
      return data.user
    } else {
      // Demo mode: any 6-digit code works
      if (!/^\d{6}$/.test(token)) throw new Error('Enter the 6-digit code (demo: any 6 digits).')
      const found = getLocalUsers().find((u) => u.phone === phone)
      if (!found) throw new Error('No account found.')
      const { password: _pw, ...session } = found
      localStorage.setItem(LS_SESSION, JSON.stringify(session))
      setUser({ id: found.id, email: found.email })
      setProfile(session)
      return found
    }
  }

  // ---------- Update profile ----------
  async function updateProfile(updates) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (error) throw error
      setProfile((p) => ({ ...p, ...updates }))
    } else {
      const users = getLocalUsers()
      const idx = users.findIndex((u) => u.id === user.id)
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates }
        saveLocalUsers(users)
        const { password: _pw, ...session } = users[idx]
        localStorage.setItem(LS_SESSION, JSON.stringify(session))
        setProfile(session)
      }
    }
  }

  // ---------- Sign out ----------
  async function signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem(LS_SESSION)
      if (isDemoActive) {
        // Leaving the demo returns the app to real Supabase mode
        localStorage.removeItem('eco_demo')
        window.location.href = '/login'
        return
      }
    }
    setUser(null)
    setProfile(null)
  }

  // ---------- Refresh profile (e.g. after earning points) ----------
  async function refreshProfile() {
    if (isSupabaseConfigured) {
      if (user) await fetchProfile(user)
    } else {
      const session = JSON.parse(localStorage.getItem(LS_SESSION) || 'null')
      if (session) setProfile(session)
    }
  }

  const value = {
    user, profile, loading,
    signUp, signIn, signInWithGoogle, signInWithPhone, verifyPhoneOtp, signOut, updateProfile, refreshProfile,
    isSupabaseConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
