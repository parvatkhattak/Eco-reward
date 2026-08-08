import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check, Share2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyPickups } from '../lib/db'

export default function Challenges() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [pickups, setPickups] = useState([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) getMyPickups(user.id).then(setPickups).catch(() => {})
  }, [user])

  const now = new Date()
  const monthPickups = pickups.filter((p) => {
    const d = new Date(p.created_at)
    return p.status === 'completed' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthKg = monthPickups.reduce((s, p) => s + Number(p.final_weight_kg || 0), 0)
  const flowerKg = monthPickups
    .filter((p) => (p.waste_types || []).includes('flower'))
    .reduce((s, p) => s + Number(p.final_weight_kg || 0), 0)

  const challenges = useMemo(() => [
    {
      emoji: '🔥', title: 'Monthly Mission', reward: 150,
      desc: 'Recycle 20 kg of organic waste this month',
      progress: monthKg, goal: 20, unit: 'kg',
    },
    {
      emoji: '📆', title: 'Consistency Champ', reward: 100,
      desc: 'Complete 4 pickups this month',
      progress: monthPickups.length, goal: 4, unit: 'pickups',
    },
    {
      emoji: '🌸', title: 'Flower Power', reward: 80,
      desc: 'Recycle 5 kg of flower waste this month',
      progress: flowerKg, goal: 5, unit: 'kg',
    },
  ], [monthKg, monthPickups.length, flowerKg])

  const referralCode = `ECO${(profile?.name || 'USER').replaceAll(' ', '').toUpperCase().slice(0, 4)}${(user?.id || '0000').slice(-4).toUpperCase()}`

  const copyCode = () => {
    navigator.clipboard?.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const share = () => {
    const text = `Join me on EcoReward — turn your waste into worth! Use my code ${referralCode} and we both get 50 eco points 🌱`
    if (navigator.share) navigator.share({ title: 'EcoReward', text }).catch(() => {})
    else {
      navigator.clipboard?.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-violet-600 to-purple-800 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">🎯 Challenges</h1>
          <p className="text-xs text-violet-200">Complete missions, earn bonus points</p>
        </div>
      </header>

      <div className="space-y-6 px-5 py-5 sm:px-8 lg:px-0">
        {/* Active challenges */}
        <section className="space-y-3">
          {challenges.map((c) => {
            const pct = Math.min(100, (c.progress / c.goal) * 100)
            const done = pct >= 100
            return (
              <div key={c.title} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-2xl">{c.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800">{c.title}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        done ? 'bg-eco-100 text-eco-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {done ? '✓ Done! ' : ''}+{c.reward} pts
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{c.desc}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${done ? 'bg-eco-500' : 'bg-violet-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] font-semibold text-gray-500">
                    {Number(c.progress.toFixed(1))} / {c.goal} {c.unit}
                  </p>
                </div>
              </div>
            )
          })}
        </section>

        {/* Referral */}
        <section className="rounded-2xl bg-gradient-to-br from-eco-600 to-teal-700 p-5 text-white">
          <h2 className="text-base font-bold">🤝 Refer & Earn</h2>
          <p className="mt-1 text-xs text-eco-100">
            Invite friends — you both get <b>50 eco points</b> when they complete their first pickup.
          </p>
          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border-2 border-dashed border-white/40 bg-white/10 px-4 py-3">
            <span className="font-mono text-lg font-bold tracking-widest">{referralCode}</span>
            <button onClick={copyCode} className="rounded-lg p-1.5 hover:bg-white/15" aria-label="Copy referral code">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <button onClick={share}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-eco-700 hover:bg-eco-50">
            <Share2 size={16} /> Share Invite
          </button>
        </section>
      </div>
    </div>
  )
}
