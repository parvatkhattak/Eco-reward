import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { saveFeedback } from '../lib/db'

const CATEGORIES = [
  { id: 'pickup', label: '🚛 Pickup Service' },
  { id: 'app', label: '📱 App Experience' },
  { id: 'rewards', label: '🎁 Rewards' },
  { id: 'other', label: '💬 Other' },
]

export default function Feedback() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [category, setCategory] = useState('pickup')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await saveFeedback({ user_id: user.id, category, rating, message })
      setDone(true)
      setTimeout(() => navigate(-1), 2200)
    } catch (err) {
      setError(err.message || 'Could not submit feedback')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <CheckCircle2 size={56} className="text-eco-600" />
        <h1 className="text-xl font-bold text-gray-800">Thank you! 💚</h1>
        <p className="text-sm text-gray-500">Your feedback helps us make waste worth more.</p>
      </div>
    )
  }

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-eco-600 to-eco-800 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">💬 Feedback</h1>
          <p className="text-xs text-eco-100">Tell us how we're doing</p>
        </div>
      </header>

      <form onSubmit={submit} className="space-y-5 px-5 py-5 sm:px-8 lg:px-0">
        {/* Category */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">What's this about?</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id} type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-xl border-2 py-2.5 text-sm font-medium transition ${
                  category === c.id
                    ? 'border-eco-500 bg-eco-50 text-eco-800'
                    : 'border-gray-100 text-gray-600 hover:border-eco-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Rate your experience</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n} type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star
                  size={34}
                  className={
                    (hover || rating) >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  }
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-2 text-xs font-semibold text-eco-600">
              {['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😃', 'Excellent! 🤩'][rating]}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-gray-700">Comments (optional)</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="What went well? What can we improve?"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-eco-500 focus:ring-2 focus:ring-eco-100"
          />
        </div>

        {error && <p className="text-center text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={busy || rating === 0}
          className="w-full rounded-xl bg-eco-600 py-3.5 font-semibold text-white transition hover:bg-eco-700 disabled:opacity-50"
        >
          {busy ? 'Submitting…' : 'Submit Feedback'}
        </button>
        {rating === 0 && <p className="text-center text-[11px] text-gray-400">Select a star rating to submit</p>}
      </form>
    </div>
  )
}
