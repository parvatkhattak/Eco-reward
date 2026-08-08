import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Mock community — a real backend would aggregate this server-side
const COMMUNITY = [
  { name: 'Green Valley Apartments', type: '🏢 Community', points: 2840 },
  { name: 'Hotel Suvarna', type: '🏨 Hotel', points: 1975 },
  { name: 'Meenakshi Temple Trust', type: '⛪ Temple', points: 1540 },
  { name: 'Spice Garden Restaurant', type: '🍴 Restaurant', points: 1230 },
  { name: 'Lakshmi Flower Depot', type: '🌸 Flower Shop', points: 860 },
  { name: 'Arjun Mehta', type: '🏠 Household', points: 720 },
  { name: 'Priya Sharma', type: '🏠 Household', points: 610 },
  { name: 'Kiran Rao', type: '🏠 Household', points: 380 },
  { name: 'Deepa Nair', type: '🏠 Household', points: 265 },
]

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const rows = useMemo(() => {
    const me = {
      name: profile?.name || 'You',
      type: '🏠 You',
      points: profile?.eco_points ?? 0,
      isMe: true,
    }
    return [...COMMUNITY, me].sort((a, b) => b.points - a.points)
  }, [profile])

  const myRank = rows.findIndex((r) => r.isMe) + 1

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      <header className="rounded-b-3xl bg-gradient-to-br from-amber-500 to-orange-600 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold">🏆 Leaderboard</h1>
            <p className="text-xs text-amber-100">Top eco warriors in your area</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
          <span className="text-3xl">🎖️</span>
          <div>
            <p className="text-xs text-amber-100">Your rank</p>
            <p className="text-xl font-extrabold">#{myRank} <span className="text-sm font-semibold text-amber-100">of {rows.length}</span></p>
          </div>
        </div>
      </header>

      <div className="space-y-2.5 px-5 py-5 sm:px-8 lg:px-0">
        {rows.map((r, i) => (
          <div
            key={r.name}
            className={`flex items-center gap-3 rounded-2xl p-4 ${
              r.isMe ? 'bg-eco-600 text-white shadow-md' : 'bg-white shadow-sm'
            }`}
          >
            <span className={`w-8 text-center text-lg font-bold ${r.isMe ? 'text-white' : 'text-gray-400'}`}>
              {MEDALS[i] || `#${i + 1}`}
            </span>
            <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
              r.isMe ? 'bg-white/20' : 'bg-eco-100 text-eco-700'
            }`}>
              {r.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${r.isMe ? 'text-white' : 'text-gray-800'}`}>
                {r.name} {r.isMe && '(You)'}
              </p>
              <p className={`text-xs ${r.isMe ? 'text-eco-100' : 'text-gray-500'}`}>{r.type}</p>
            </div>
            <span className={`text-sm font-bold ${r.isMe ? 'text-white' : 'text-eco-700'}`}>
              {r.points.toLocaleString()} pts
            </span>
          </div>
        ))}
        <p className="pt-2 text-center text-[11px] text-gray-400">
          Rankings refresh weekly · Keep recycling to climb! 🌿
        </p>
      </div>
    </div>
  )
}
