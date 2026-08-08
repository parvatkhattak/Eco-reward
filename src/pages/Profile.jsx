import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Pencil, MapPin, Globe, Moon, HelpCircle, LogOut, ChevronRight, X, Loader2, Award,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { USER_TYPES } from '../lib/constants'

export default function Profile() {
  const { profile, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const type = USER_TYPES.find((t) => t.id === profile?.user_type)
  const initials = (profile?.name || 'EW')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const rows = [
    { icon: MapPin, label: 'Saved Addresses', sub: profile?.address || 'No address saved', onClick: () => setEditing(true) },
    { icon: Globe, label: 'Language', sub: 'English', onClick: () => {} },
    { icon: HelpCircle, label: 'Help', sub: 'FAQs & support', onClick: () => navigate('/help') },
  ]

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      {/* Header */}
      <header className="rounded-b-3xl bg-gradient-to-br from-eco-600 to-eco-800 px-5 pb-14 pt-8 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold ring-2 ring-white/40">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile?.name}</h1>
            <p className="text-sm text-eco-100">
              {type ? `${type.emoji} ${type.label}` : ''} · {profile?.phone}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="rounded-full bg-white/15 p-2.5 transition hover:bg-white/25"
            aria-label="Edit profile"
          >
            <Pencil size={17} />
          </button>
        </div>
      </header>

      {/* Eco score card */}
      <section className="-mt-8 px-5 sm:px-8 lg:px-0">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lg shadow-eco-900/5">
          <span className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
            <Award size={22} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Eco Score</p>
            <p className="text-xs text-gray-500">Based on your pickups & activity</p>
          </div>
          <p className="text-2xl font-bold text-eco-600">{profile?.eco_points ?? 0}</p>
        </div>
      </section>

      {/* Details */}
      <section className="mt-5 px-5 sm:px-8 lg:px-0">
        <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm font-medium text-gray-800">{profile?.email}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400">Address</p>
            <p className="text-sm font-medium text-gray-800">{profile?.address || '—'}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400">Account Type</p>
            <p className="text-sm font-medium text-gray-800">
              {type ? `${type.emoji} ${type.label}` : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Settings rows */}
      <section className="mt-5 px-5 pb-8 sm:px-8 lg:px-0 lg:pb-12">
        <div className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
          {rows.map(({ icon: Icon, label, sub, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-gray-50"
            >
              <Icon size={18} className="text-eco-600" />
              <span className="flex-1">
                <span className="block text-sm font-medium text-gray-800">{label}</span>
                <span className="block truncate text-xs text-gray-400">{sub}</span>
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}

          {/* Dark mode toggle */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Moon size={18} className="text-eco-600" />
            <span className="flex-1 text-sm font-medium text-gray-800">Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`h-6 w-11 rounded-full p-0.5 transition ${darkMode ? 'bg-eco-600' : 'bg-gray-200'}`}
              aria-label="Toggle dark mode"
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white shadow transition ${darkMode ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </section>

      {editing && <EditProfileModal onClose={() => setEditing(false)} profile={profile} updateProfile={updateProfile} />}
    </div>
  )
}

function EditProfileModal({ onClose, profile, updateProfile }) {
  const [form, setForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await updateProfile(form)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border border-eco-200 bg-white px-4 py-3 text-sm outline-none focus:border-eco-500 focus:ring-2 focus:ring-eco-200'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <form
        onSubmit={handleSave}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Edit Profile</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {error && <div className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}

        <div className="space-y-3">
          <input required placeholder="Full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          <input required placeholder="Phone" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          <textarea required rows={2} placeholder="Address" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={`${inputCls} resize-none`} />
        </div>

        <button type="submit" disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-eco-600 py-3 font-semibold text-white transition hover:bg-eco-700 disabled:opacity-60">
          {busy && <Loader2 className="animate-spin" size={17} />} Save Changes
        </button>
      </form>
    </div>
  )
}
