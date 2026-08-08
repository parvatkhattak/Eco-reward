import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Phone, Mail, Lock, MapPin, Crosshair, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { USER_TYPES } from '../lib/constants'
import Logo from '../components/Logo'
import AuthLayout from '../components/AuthLayout'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', address: '', userType: 'household',
  })
  const [gps, setGps] = useState(null) // { lat, lng }
  const [gpsBusy, setGpsBusy] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  function captureGps() {
    setError(''); setGpsBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsBusy(false)
      },
      () => {
        setError('Could not get GPS location. Please allow location access.')
        setGpsBusy(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        address: form.address,
        lat: gps?.lat ?? null,
        lng: gps?.lng ?? null,
        userType: form.userType,
      })
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border border-eco-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-eco-500 focus:ring-2 focus:ring-eco-200'

  return (
    <AuthLayout>
      <div className="w-full max-w-md lg:max-w-lg">
        <div className="mb-6 flex flex-col items-center lg:hidden">
          <Logo size={60} />
          <h1 className="mt-3 text-2xl font-bold text-eco-900">Create your account</h1>
          <p className="text-sm text-eco-700">Join the movement — turn waste into worth</p>
        </div>

        <h1 className="mb-4 hidden text-2xl font-bold text-eco-900 lg:block">Create your account</h1>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-xl shadow-eco-900/5">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input required placeholder="Full name" value={form.name} onChange={set('name')} className={inputCls} />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input required type="tel" placeholder="Phone number" value={form.phone} onChange={set('phone')} className={inputCls} />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input required type="email" placeholder="Email address" value={form.email} onChange={set('email')} className={inputCls} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input required type="password" minLength={6} placeholder="Password (min 6 characters)" value={form.password} onChange={set('password')} className={inputCls} />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-gray-400" size={17} />
              <textarea required rows={2} placeholder="Address" value={form.address} onChange={set('address')}
                className="w-full resize-none rounded-xl border border-eco-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-eco-500 focus:ring-2 focus:ring-eco-200" />
            </div>

            {/* GPS */}
            <button type="button" onClick={captureGps}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition ${
                gps ? 'border-eco-300 bg-eco-50 text-eco-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {gpsBusy ? <Loader2 className="animate-spin" size={17} />
                : gps ? <CheckCircle2 size={17} className="text-eco-600" />
                : <Crosshair size={17} />}
              {gps
                ? `Location captured (${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)})`
                : 'Use my current GPS location'}
            </button>

            {/* User type */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">I am a…</p>
              <div className="grid grid-cols-2 gap-2">
                {USER_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setForm({ ...form, userType: t.id })}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                      form.userType === t.id
                        ? 'border-eco-500 bg-eco-50 font-semibold text-eco-800 ring-1 ring-eco-500'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-eco-600 py-3 font-semibold text-white transition hover:bg-eco-700 disabled:opacity-60">
              {busy && <Loader2 className="animate-spin" size={17} />} Sign Up
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-eco-600 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}
