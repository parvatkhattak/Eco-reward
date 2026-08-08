import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Camera, Crosshair, CheckCircle2, AlertTriangle, Loader2, Scan, X, CalendarDays, Clock, MessageSquareText, Weight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { WASTE_TYPES } from '../lib/constants'
import { createPickup } from '../lib/db'
import { analyzeWastePhoto, fileToThumbnail } from '../lib/ai'

export default function RequestPickup() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [types, setTypes] = useState([])
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [instructions, setInstructions] = useState('')
  const [gps, setGps] = useState(profile?.lat ? { lat: profile.lat, lng: profile.lng } : null)
  const [gpsBusy, setGpsBusy] = useState(false)

  const [photo, setPhoto] = useState(null) // data URL
  const [aiState, setAiState] = useState('idle') // idle | analyzing | passed | failed
  const [aiResult, setAiResult] = useState(null)

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const toggleType = (id) =>
    setTypes((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))

  function captureGps() {
    setGpsBusy(true)
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

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setAiState('analyzing')
    setAiResult(null)
    try {
      const [thumb, result] = await Promise.all([
        fileToThumbnail(file),
        analyzeWastePhoto(file, types, weight),
      ])
      setPhoto(thumb)
      setAiResult(result)
      setAiState(result.ok ? 'passed' : 'failed')
    } catch {
      setError('Could not read that image. Try another photo.')
      setAiState('idle')
    } finally {
      e.target.value = ''
    }
  }

  function clearPhoto() {
    setPhoto(null)
    setAiResult(null)
    setAiState('idle')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (types.length === 0) return setError('Select at least one waste type.')
    if (!photo || aiState !== 'passed')
      return setError('Upload a photo and pass AI verification before submitting.')
    if (!gps) return setError('Please set your pickup location (GPS).')

    setBusy(true)
    try {
      await createPickup({
        user_id: user.id,
        waste_types: types,
        approx_weight_kg: Number(weight) || aiResult?.estimatedWeight || null,
        pickup_date: date,
        pickup_time: time,
        photo_url: photo,
        lat: gps.lat,
        lng: gps.lng,
        address: profile?.address ?? '',
        instructions,
        status: 'requested',
      })
      setDone(true)
      setTimeout(() => navigate('/pickups'), 1800)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-eco-100">
          <CheckCircle2 size={44} className="text-eco-600" />
        </span>
        <h1 className="text-xl font-bold text-gray-800">Pickup Scheduled!</h1>
        <p className="text-sm text-gray-500">We're finding a collector near you…</p>
      </div>
    )
  }

  const inputCls =
    'w-full rounded-xl border border-eco-200 bg-white px-4 py-3 text-sm outline-none focus:border-eco-500 focus:ring-2 focus:ring-eco-200'

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      {/* Header */}
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-eco-600 to-eco-800 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Schedule Pickup</h1>
          <p className="text-xs text-eco-100">Tell us what you're disposing</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 px-5 py-6 sm:px-8 lg:px-0">
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        {/* Waste types */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">What are you disposing?</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {WASTE_TYPES.map((t) => {
              const checked = types.includes(t.id)
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => toggleType(t.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                    checked
                      ? 'border-eco-500 bg-eco-50 font-semibold text-eco-800 ring-1 ring-eco-500'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border text-white ${
                      checked ? 'border-eco-600 bg-eco-600' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {checked && '✓'}
                  </span>
                  {t.emoji} {t.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* Weight */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Weight size={15} /> Approximate Weight (kg)
          </h2>
          <div className="flex gap-2">
            {[3, 15, 50].map((w) => (
              <button key={w} type="button" onClick={() => setWeight(String(w))}
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  weight === String(w)
                    ? 'border-eco-500 bg-eco-50 font-semibold text-eco-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}>
                {w} kg
              </button>
            ))}
            <input
              type="number" min="0.5" step="0.5" placeholder="Custom"
              value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-eco-500 focus:ring-2 focus:ring-eco-200"
            />
          </div>
        </section>

        {/* Date & time */}
        <section className="grid grid-cols-2 gap-3">
          <div>
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <CalendarDays size={15} /> Pickup Date
            </h2>
            <input required type="date" value={date} min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Clock size={15} /> Pickup Time
            </h2>
            <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
          </div>
        </section>

        {/* Photo + AI verification */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Camera size={15} /> Photo of Waste
          </h2>

          {!photo && aiState !== 'analyzing' && (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-eco-300 bg-eco-50/50 py-8 text-eco-700 transition hover:bg-eco-50">
              <Camera size={28} />
              <span className="text-sm font-medium">Tap to upload a photo</span>
              <span className="text-xs text-eco-600">AI will verify your waste automatically</span>
            </button>
          )}

          {aiState === 'analyzing' && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-eco-200 bg-white py-8">
              <span className="relative">
                <Scan size={34} className="text-eco-600" />
                <Loader2 size={50} className="absolute -left-2 -top-2 animate-spin text-eco-300" />
              </span>
              <p className="text-sm font-medium text-gray-700">AI analysing your waste…</p>
              <p className="text-xs text-gray-400">Checking type, weight & segregation quality</p>
            </div>
          )}

          {photo && aiState !== 'analyzing' && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="relative">
                <img src={photo} alt="Waste" className="h-44 w-full object-cover sm:h-56" />
                <button type="button" onClick={clearPhoto}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70" aria-label="Remove photo">
                  <X size={15} />
                </button>
              </div>

              {aiState === 'passed' && aiResult && (
                <div className="space-y-1 bg-eco-50 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-eco-800">
                    <CheckCircle2 size={16} className="text-eco-600" /> ✔ {aiResult.title}
                  </p>
                  <p className="text-xs text-eco-700">Estimated Weight: <b>{aiResult.estimatedWeight} kg</b></p>
                  <p className="text-xs text-eco-700">Quality: <b>{aiResult.quality}</b> · Confidence {aiResult.confidence}%</p>
                </div>
              )}

              {aiState === 'failed' && aiResult && (
                <div className="space-y-1.5 bg-amber-50 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <AlertTriangle size={16} /> ⚠ {aiResult.title}
                  </p>
                  <p className="text-xs text-amber-700">{aiResult.message}</p>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="mt-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">
                    Upload new photo
                  </button>
                </div>
              )}
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </section>

        {/* Location */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Pickup Location</h2>
          <button type="button" onClick={captureGps}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition ${
              gps ? 'border-eco-300 bg-eco-50 text-eco-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}>
            {gpsBusy ? <Loader2 className="animate-spin" size={17} />
              : gps ? <CheckCircle2 size={17} className="text-eco-600" />
              : <Crosshair size={17} />}
            {gps ? `Location set (${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)})` : 'Use my current GPS location'}
          </button>
        </section>

        {/* Instructions */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <MessageSquareText size={15} /> Special Instructions
          </h2>
          <textarea rows={2} placeholder='e.g. "Ring the bell", "Gate code 4321"'
            value={instructions} onChange={(e) => setInstructions(e.target.value)}
            className={`${inputCls} resize-none`} />
        </section>

        <button type="submit" disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-eco-600 py-4 text-base font-bold text-white shadow-lg shadow-eco-600/30 transition hover:bg-eco-700 disabled:opacity-60">
          {busy && <Loader2 className="animate-spin" size={18} />} Schedule Pickup
        </button>
      </form>
    </div>
  )
}
