import { supabase, isSupabaseConfigured } from './supabase'

// Minimal data layer — pickups (Stage 3 expands this)
const LS_PICKUPS = 'eco_pickups'

export async function getMyPickups(userId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('pickups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }
  const all = JSON.parse(localStorage.getItem(LS_PICKUPS) || '[]')
  return all
    .filter((p) => p.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function createPickup(pickup) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('pickups').insert(pickup).select().single()
    if (error) throw error
    return data
  }
  const all = JSON.parse(localStorage.getItem(LS_PICKUPS) || '[]')
  const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...pickup }
  all.push(row)
  localStorage.setItem(LS_PICKUPS, JSON.stringify(all))
  return row
}

export async function getPickup(id) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('pickups').select('*').eq('id', id).single()
    if (error) throw error
    return data
  }
  const all = JSON.parse(localStorage.getItem(LS_PICKUPS) || '[]')
  return all.find((p) => p.id === id) ?? null
}

export async function updatePickup(id, updates) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('pickups')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = JSON.parse(localStorage.getItem(LS_PICKUPS) || '[]')
  const idx = all.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Pickup not found')
  all[idx] = { ...all[idx], ...updates }
  localStorage.setItem(LS_PICKUPS, JSON.stringify(all))
  return all[idx]
}

// Add (or subtract) eco points on the user's profile
export async function addPoints(userId, delta) {
  if (isSupabaseConfigured) {
    const { data: prof, error } = await supabase
      .from('profiles')
      .select('eco_points')
      .eq('id', userId)
      .single()
    if (error) throw error
    const newTotal = (prof?.eco_points ?? 0) + delta
    const { error: uErr } = await supabase
      .from('profiles')
      .update({ eco_points: newTotal })
      .eq('id', userId)
    if (uErr) throw uErr
    return newTotal
  }
  const users = JSON.parse(localStorage.getItem('eco_users') || '[]')
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) throw new Error('User not found')
  users[idx].eco_points = (users[idx].eco_points ?? 0) + delta
  localStorage.setItem('eco_users', JSON.stringify(users))
  // Keep the active session in sync
  const session = JSON.parse(localStorage.getItem('eco_session') || 'null')
  if (session?.id === userId) {
    session.eco_points = users[idx].eco_points
    localStorage.setItem('eco_session', JSON.stringify(session))
  }
  return users[idx].eco_points
}

// Points formula: 14 points per kg of verified organic waste
export const pointsForWeight = (kg) => Math.round(Number(kg) * 14)

// ---------- Transactions (eco wallet) ----------
const LS_TRANSACTIONS = 'eco_transactions'

export async function getMyTransactions(userId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }
  const all = JSON.parse(localStorage.getItem(LS_TRANSACTIONS) || '[]')
  return all
    .filter((t) => t.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function addTransaction(tx) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('transactions').insert(tx).select().single()
    if (error) throw error
    return data
  }
  const all = JSON.parse(localStorage.getItem(LS_TRANSACTIONS) || '[]')
  const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...tx }
  all.push(row)
  localStorage.setItem(LS_TRANSACTIONS, JSON.stringify(all))
  return row
}

const couponCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `ECO-${code.slice(0, 4)}-${code.slice(4)}`
}

// Redeem a reward: verifies balance, deducts points, logs the transaction.
// Returns the transaction (with coupon_code).
export async function redeemReward(userId, currentPoints, reward) {
  if ((currentPoints ?? 0) < reward.cost) throw new Error('Not enough eco points')
  await addPoints(userId, -reward.cost)
  return addTransaction({
    user_id: userId,
    type: 'redeem',
    points: -reward.cost,
    title: reward.title,
    subtitle: reward.partner,
    coupon_code: couponCode(),
  })
}

// ---------- Feedback (Stage 7) ----------
export async function saveFeedback(feedback) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('feedback').insert(feedback).select().single()
    if (error) throw error
    return data
  }
  const all = JSON.parse(localStorage.getItem('eco_feedback') || '[]')
  const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...feedback }
  all.push(row)
  localStorage.setItem('eco_feedback', JSON.stringify(all))
  return row
}

// ---------- Collector portal (Stage 8) ----------
// All pickups that are open for collection work: unassigned requests plus
// jobs already assigned to this collector (matched by name in this demo).
export async function getCollectorPickups(collectorName) {
  const ACTIVE = ['requested', 'accepted', 'on_the_way', 'arrived', 'collected', 'processing']
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('pickups')
      .select('*')
      .in('status', ACTIVE)
      .order('pickup_date', { ascending: true })
    if (error) throw error
    return data ?? []
  }
  const all = JSON.parse(localStorage.getItem(LS_PICKUPS) || '[]')
  return all
    .filter(
      (p) =>
        ACTIVE.includes(p.status) &&
        (p.status === 'requested' || !p.collector_name || p.collector_name === collectorName),
    )
    .sort((a, b) => (a.pickup_date + a.pickup_time).localeCompare(b.pickup_date + b.pickup_time))
}

// Pickups this collector completed (for daily stats)
export async function getCollectorCompleted(collectorName) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('pickups')
      .select('*')
      .eq('status', 'completed')
      .eq('collector_name', collectorName)
    if (error) throw error
    return data ?? []
  }
  const all = JSON.parse(localStorage.getItem(LS_PICKUPS) || '[]')
  return all.filter((p) => p.status === 'completed' && p.collector_name === collectorName)
}

// Look up the requesting customer's profile (name/phone) for a pickup
export async function getProfileById(id) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (error) return null
    return data
  }
  const users = JSON.parse(localStorage.getItem('eco_users') || '[]')
  const u = users.find((x) => x.id === id)
  if (!u) return null
  const { password: _pw, ...profile } = u
  return profile
}

// ---------- Admin panel (Stage 9) ----------
export async function getAllUsers() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at')
    if (error) throw error
    return data ?? []
  }
  return JSON.parse(localStorage.getItem('eco_users') || '[]').map(({ password: _pw, ...u }) => u)
}

export async function getAllPickups() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('pickups')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }
  return JSON.parse(localStorage.getItem(LS_PICKUPS) || '[]').sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  )
}

export async function getAllTransactions() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }
  return JSON.parse(localStorage.getItem('eco_transactions') || '[]').sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  )
}
