import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyPickups, getMyTransactions } from '../lib/db'
import { PICKUP_STATUSES } from '../lib/constants'

const daysAgoIso = (n) => new Date(Date.now() - n * 86400000).toISOString()

// City-wide announcements (would come from the admin panel in production)
const ANNOUNCEMENTS = [
  {
    id: 'ann-1', emoji: '📢', title: 'New compost center in Jubilee Hills!',
    body: 'A new processing facility is now live — pickups in your area will be even faster.',
    created_at: daysAgoIso(1),
  },
  {
    id: 'ann-2', emoji: '🎉', title: 'Double points weekend',
    body: 'Earn 2× eco points on all pickups this Saturday & Sunday. Schedule now!',
    created_at: daysAgoIso(3),
  },
  {
    id: 'ann-3', emoji: '🌧️', title: 'Monsoon pickup advisory',
    body: 'Keep waste covered and dry — wet contamination may reduce your segregation score.',
    created_at: daysAgoIso(7),
  },
]

const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (mins < 60) return `${Math.max(mins, 1)}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export default function Announcements() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState(ANNOUNCEMENTS)

  useEffect(() => {
    if (!user) return
    Promise.all([getMyPickups(user.id), getMyTransactions(user.id)])
      .then(([pickups, txs]) => {
        const pickupNotifs = pickups
          .filter((p) => p.status !== 'requested')
          .slice(0, 5)
          .map((p) => ({
            id: `pk-${p.id}`,
            emoji: p.status === 'completed' ? '✅' : '🚛',
            title: `Pickup ${PICKUP_STATUSES[p.status]?.label ?? p.status}`,
            body: p.status === 'completed'
              ? `${p.final_weight_kg} kg collected — +${p.points_earned} points credited.`
              : `Your pickup on ${p.pickup_date} at ${p.pickup_time} is ${PICKUP_STATUSES[p.status]?.label?.toLowerCase()}.`,
            created_at: p.created_at,
            personal: true,
          }))
        const txNotifs = txs
          .filter((t) => t.type === 'redeem')
          .slice(0, 3)
          .map((t) => ({
            id: `tx-${t.id}`,
            emoji: '🎁',
            title: `Reward redeemed: ${t.title}`,
            body: `Coupon ${t.coupon_code} — show it at the partner outlet.`,
            created_at: t.created_at,
            personal: true,
          }))
        setItems(
          [...ANNOUNCEMENTS, ...pickupNotifs, ...txNotifs].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at),
          ),
        )
      })
      .catch(() => {})
  }, [user])

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-eco-600 to-eco-800 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">🔔 Notifications</h1>
          <p className="text-xs text-eco-100">Updates, announcements & alerts</p>
        </div>
      </header>

      <div className="space-y-2.5 px-5 py-5 sm:px-8 lg:px-0">
        {items.map((n) => (
          <div key={n.id} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
              n.personal ? 'bg-eco-100' : 'bg-amber-50'
            }`}>
              {n.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-gray-800">{n.title}</p>
                <span className="shrink-0 text-[11px] text-gray-400">{timeAgo(n.created_at)}</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
