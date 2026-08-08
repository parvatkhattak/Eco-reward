import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Target } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyPickups, getMyTransactions } from '../lib/db'
import { computeImpact, BADGES } from '../lib/impact'

export default function Impact() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [pickups, setPickups] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    if (!user) return
    getMyPickups(user.id).then(setPickups).catch(() => {})
    getMyTransactions(user.id).then(setTransactions).catch(() => {})
  }, [user])

  const stats = computeImpact(pickups, transactions)
  const points = profile?.eco_points ?? 0
  const maxKg = Math.max(...stats.months.map((m) => m.kg), 1)
  const earnedBadges = BADGES.filter((b) => b.earned(stats, points))

  const bigStats = [
    { emoji: '♻️', value: `${stats.totalKg.toFixed(1)} kg`, label: 'Waste Recycled' },
    { emoji: '🌱', value: `${stats.compostKg.toFixed(1)} kg`, label: 'Compost Created' },
    { emoji: '☁️', value: `${stats.co2Kg.toFixed(1)} kg`, label: 'CO₂ Emissions Saved' },
    { emoji: '🌳', value: stats.trees.toFixed(1), label: 'Trees Equivalent / yr' },
  ]

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-eco-600 to-eco-800 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <button onClick={() => navigate('/home')} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">🌍 Your Impact</h1>
          <p className="text-xs text-eco-100">Every kilogram counts — see what you've achieved</p>
        </div>
      </header>

      <div className="space-y-6 px-5 py-5 sm:px-8 lg:px-0">
        {/* Big impact numbers */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          {bigStats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <span className="text-3xl">{s.emoji}</span>
              <p className="mt-1 text-xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </section>

        {/* This month */}
        <section className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-eco-600 to-teal-600 p-4 text-white">
          <span className="text-3xl">📅</span>
          <div className="flex-1">
            <p className="text-sm font-bold">{stats.monthKg.toFixed(1)} kg this month</p>
            <p className="text-xs text-eco-100">{stats.monthCount} pickup{stats.monthCount === 1 ? '' : 's'} completed</p>
          </div>
        </section>

        {/* Monthly chart */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Waste Diverted — Last 6 Months</h2>
          <div className="flex h-36 items-end justify-between gap-2">
            {stats.months.map((m, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-eco-700">{m.kg > 0 ? m.kg.toFixed(0) : ''}</span>
                <div
                  className={`w-full max-w-10 rounded-t-lg ${m.kg > 0 ? 'bg-gradient-to-t from-eco-600 to-eco-400' : 'bg-gray-100'}`}
                  style={{ height: `${Math.max((m.kg / maxKg) * 100, 4)}%` }}
                />
                <span className="text-[10px] text-gray-400">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Badges */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">🏅 Badges</h2>
            <span className="text-xs font-semibold text-eco-600">{earnedBadges.length}/{BADGES.length} earned</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {BADGES.map((b) => {
              const got = b.earned(stats, points)
              return (
                <div key={b.id} title={b.desc}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center ${
                    got ? 'bg-eco-50 ring-1 ring-eco-200' : 'bg-gray-50 opacity-45 grayscale'
                  }`}
                >
                  <span className="text-2xl">{b.emoji}</span>
                  <span className="text-[10px] font-semibold leading-tight text-gray-700">{b.title}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Links */}
        <section className="grid grid-cols-2 gap-3 pb-4">
          <button onClick={() => navigate('/leaderboard')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-amber-600">
            <Trophy size={16} /> Leaderboard
          </button>
          <button onClick={() => navigate('/challenges')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-violet-500 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-violet-600">
            <Target size={16} /> Challenges
          </button>
        </section>
      </div>
    </div>
  )
}
