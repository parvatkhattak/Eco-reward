import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Truck, Gift, MapPinned, History, Megaphone, Radar, Bell, Leaf, Coins, CalendarClock,
  Globe2, Trophy, Target,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyPickups } from '../lib/db'
import { USER_TYPES } from '../lib/constants'

const quickActions = [
  { label: 'Request Pickup', icon: Truck, to: '/pickups/new', color: 'bg-eco-600 text-white' },
  { label: 'Redeem Rewards', icon: Gift, to: '/rewards', color: 'bg-amber-500 text-white' },
  { label: 'Track Pickup', icon: Radar, to: '/pickups', color: 'bg-sky-500 text-white' },
  { label: 'History', icon: History, to: '/pickups?tab=history', color: 'bg-violet-500 text-white' },
  { label: 'Compost Centers', icon: MapPinned, to: '/facilities', color: 'bg-teal-500 text-white' },
  { label: 'Announcements', icon: Megaphone, to: '/announcements', color: 'bg-rose-500 text-white' },
  { label: 'Your Impact', icon: Globe2, to: '/impact', color: 'bg-eco-500 text-white' },
  { label: 'Leaderboard', icon: Trophy, to: '/leaderboard', color: 'bg-orange-500 text-white' },
  { label: 'Challenges', icon: Target, to: '/challenges', color: 'bg-indigo-500 text-white' },
]

export default function Home() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [pickups, setPickups] = useState([])

  // Collectors and admins have their own portals
  useEffect(() => {
    if (profile?.user_type === 'collector') navigate('/collector', { replace: true })
    if (profile?.user_type === 'admin') navigate('/admin', { replace: true })
  }, [profile, navigate])

  useEffect(() => {
    if (user) getMyPickups(user.id).then(setPickups).catch(() => {})
  }, [user])

  const firstName = profile?.name?.split(' ')[0] || 'Eco Warrior'
  const type = USER_TYPES.find((t) => t.id === profile?.user_type)

  const today = new Date().toDateString()
  const todaysWaste = pickups
    .filter((p) => new Date(p.created_at).toDateString() === today && p.final_weight_kg)
    .reduce((sum, p) => sum + Number(p.final_weight_kg), 0)

  const upcoming = pickups.find((p) =>
    ['requested', 'accepted', 'on_the_way', 'arrived'].includes(p.status),
  )

  return (
    <div>
      {/* Header */}
      <header className="rounded-b-3xl bg-gradient-to-br from-eco-600 to-eco-800 px-5 pb-16 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl lg:pt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-eco-100">{type ? `${type.emoji} ${type.label}` : 'Welcome'}</p>
            <h1 className="text-2xl font-bold sm:text-3xl">👋 Hello, {firstName}</h1>
          </div>
          <button
            onClick={() => navigate('/announcements')}
            className="rounded-full bg-white/15 p-2.5 transition hover:bg-white/25"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Stat cards — overlapping header */}
      <section className="-mt-10 grid grid-cols-3 gap-3 px-5 sm:gap-4 sm:px-8 lg:px-0">
        <div className="rounded-2xl bg-white p-3.5 text-center shadow-lg shadow-eco-900/5 sm:p-5">
          <Coins className="mx-auto mb-1 text-amber-500" size={20} />
          <p className="text-lg font-bold text-gray-800 sm:text-2xl">{profile?.eco_points ?? 0}</p>
          <p className="text-[11px] leading-tight text-gray-500 sm:text-xs">Eco Points</p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 text-center shadow-lg shadow-eco-900/5 sm:p-5">
          <Leaf className="mx-auto mb-1 text-eco-600" size={20} />
          <p className="text-lg font-bold text-gray-800 sm:text-2xl">{todaysWaste} kg</p>
          <p className="text-[11px] leading-tight text-gray-500 sm:text-xs">Waste Saved Today</p>
        </div>
        <button
          onClick={() => upcoming && navigate(`/pickups/${upcoming.id}`)}
          className="rounded-2xl bg-white p-3.5 text-center shadow-lg shadow-eco-900/5 sm:p-5"
        >
          <CalendarClock className="mx-auto mb-1 text-sky-500" size={20} />
          <p className="text-lg font-bold text-gray-800 sm:text-2xl">
            {upcoming ? (upcoming.pickup_date || 'Scheduled') : '—'}
          </p>
          <p className="text-[11px] leading-tight text-gray-500 sm:text-xs">Upcoming Pickup</p>
        </button>
      </section>

      {/* Quick actions */}
      <section className="mt-6 px-5 sm:px-8 lg:px-0">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {quickActions.map(({ label, icon: Icon, to, color }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={`rounded-xl p-2.5 ${color}`}>
                <Icon size={20} />
              </span>
              <span className="text-center text-xs font-medium leading-tight text-gray-700">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Upcoming pickup banner */}
      {upcoming && (
        <section className="mt-6 px-5 sm:px-8 lg:px-0">
          <button
            onClick={() => navigate(`/pickups/${upcoming.id}`)}
            className="flex w-full items-center gap-3 rounded-2xl border border-eco-200 bg-eco-100/60 p-4 text-left"
          >
            <span className="rounded-xl bg-eco-600 p-2.5 text-white">
              <Truck size={20} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-eco-900">
                Pickup {upcoming.status.replaceAll('_', ' ')}
              </span>
              <span className="block text-xs text-eco-700">
                {upcoming.pickup_date} · {upcoming.pickup_time} — tap to track
              </span>
            </span>
          </button>
        </section>
      )}

      {/* Eco tip */}
      <section className="mt-6 px-5 pb-6 sm:px-8 lg:px-0 lg:pb-10">
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-eco-50 p-4 ring-1 ring-amber-100">
          <p className="text-sm font-semibold text-amber-800">🌱 Eco Tip of the Day</p>
          <p className="mt-1 text-xs text-amber-700">
            Segregate wet and dry waste at source — properly segregated organic waste earns you
            bonus eco points!
          </p>
        </div>
      </section>
    </div>
  )
}
