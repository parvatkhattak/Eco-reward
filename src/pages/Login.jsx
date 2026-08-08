import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Mail, Lock, Phone, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import AuthLayout from '../components/AuthLayout'
import { enterDemoMode, enterCollectorDemo, enterAdminDemo } from '../lib/demo'

export default function Login() {
  const { user, signIn, signInWithGoogle, signInWithPhone, verifyPhoneOtp } = useAuth()
  const navigate = useNavigate()

  // Already authenticated (e.g. returning from Google OAuth callback) → go home
  if (user) return <Navigate to="/home" replace />

  const [mode, setMode] = useState('email') // 'email' | 'phone'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleEmailLogin(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await signIn(email, password)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSendOtp(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await signInWithPhone(phone)
      setOtpSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await verifyPhoneOtp(phone, otp)
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
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <Logo size={72} />
          <h1 className="mt-4 text-3xl font-bold text-eco-900">EcoReward</h1>
          <p className="text-sm text-eco-700">"Turn Waste into Worth"</p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-eco-900/5">
          <h2 className="text-xl font-semibold text-gray-800">Welcome back</h2>
          <p className="mb-6 text-sm text-gray-500">Login to continue your eco journey</p>

          {/* Mode toggle */}
          <div className="mb-5 flex rounded-xl bg-eco-50 p-1">
            <button
              onClick={() => { setMode('email'); setError('') }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === 'email' ? 'bg-white text-eco-700 shadow' : 'text-gray-500'}`}
            >
              Email
            </button>
            <button
              onClick={() => { setMode('phone'); setError('') }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === 'phone' ? 'bg-white text-eco-700 shadow' : 'text-gray-500'}`}
            >
              Phone Number
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {mode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input type="email" required placeholder="Email address" value={email}
                  onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input type="password" required placeholder="Password" value={password}
                  onChange={(e) => setPassword(e.target.value)} className={inputCls} />
              </div>
              <button type="submit" disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-eco-600 py-3 font-semibold text-white transition hover:bg-eco-700 disabled:opacity-60">
                {busy && <Loader2 className="animate-spin" size={17} />} Login
              </button>
            </form>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input type="tel" required placeholder="Phone number" value={phone}
                  onChange={(e) => setPhone(e.target.value)} className={inputCls} />
              </div>
              <button type="submit" disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-eco-600 py-3 font-semibold text-white transition hover:bg-eco-700 disabled:opacity-60">
                {busy && <Loader2 className="animate-spin" size={17} />} Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-gray-500">OTP sent to <b>{phone}</b> (demo: enter any 6 digits)</p>
              <input type="text" required maxLength={6} placeholder="6-digit OTP" value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-eco-200 bg-white px-4 py-3 text-center text-lg tracking-[0.5em] outline-none focus:border-eco-500 focus:ring-2 focus:ring-eco-200" />
              <button type="submit" disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-eco-600 py-3 font-semibold text-white transition hover:bg-eco-700 disabled:opacity-60">
                {busy && <Loader2 className="animate-spin" size={17} />} Verify & Login
              </button>
            </form>
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 5.9 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 5.9 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.4-4.9l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.2 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={enterDemoMode}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-eco-400 bg-eco-50 py-3 text-sm font-semibold text-eco-700 transition hover:bg-eco-100"
          >
            🎭 Try Demo Account (no signup needed)
          </button>

          <button
            onClick={enterCollectorDemo}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sky-400 bg-sky-50 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            🚛 Collector Demo (driver app)
          </button>

          <button
            onClick={enterAdminDemo}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-400 bg-slate-50 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            🛡️ Admin Demo (operations panel)
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-eco-600 hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
