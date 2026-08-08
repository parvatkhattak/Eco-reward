import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, Users, Truck, Scale, Coins, LayoutDashboard, Package, Gift, Search,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers, getAllPickups, getAllTransactions } from '../../lib/db'
import { USER_TYPES, WASTE_TYPES, PICKUP_STATUSES, REWARDS } from '../../lib/constants'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'pickups', label: 'Pickups', icon: Package },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'rewards', label: 'Rewards', icon: Gift },
]

export default function AdminPanel() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [pickups, setPickups] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    getAllUsers().then(setUsers).catch(() => {})
    getAllPickups().then(setPickups).catch(() => {})
    getAllTransactions().then(setTransactions).catch(() => {})
  }, [])

  return (
    <div className="mx-auto min-h-dvh max-w-6xl bg-gray-50 pb-10">
      {/* Header */}
      <header className="rounded-b-3xl bg-gradient-to-br from-slate-700 to-slate-900 px-5 pb-6 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">🛡️ Admin Panel</p>
            <h1 className="text-2xl font-bold">EcoReward Operations</h1>
            <p className="text-xs text-slate-400">{profile?.name}</p>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/login', { replace: true }) }}
            className="rounded-full bg-white/10 p-2.5 hover:bg-white/20" aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
        {/* Tabs */}
        <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl bg-white/10 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                tab === id ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 py-5 sm:px-8">
        {tab === 'overview' && <Overview users={users} pickups={pickups} />}
        {tab === 'pickups' && <PickupsTab pickups={pickups} users={users} />}
        {tab === 'users' && <UsersTab users={users} pickups={pickups} />}
        {tab === 'rewards' && <RewardsTab transactions={transactions} />}
      </div>
    </div>
  )
}

/* ---------------- Overview ---------------- */
function Overview({ users, pickups }) {
  const completed = pickups.filter((p) => p.status === 'completed')
  const totalKg = completed.reduce((s, p) => s + Number(p.final_weight_kg || 0), 0)
  const totalPoints = completed.reduce((s, p) => s + (p.points_earned || 0), 0)
  const collectors = users.filter((u) => u.user_type === 'collector')
  const customers = users.filter((u) => !['collector', 'admin'].includes(u.user_type))

  const stats = [
    { icon: Users, label: 'Registered Users', value: customers.length, color: 'bg-sky-100 text-sky-700' },
    { icon: Truck, label: 'Collectors', value: collectors.length, color: 'bg-indigo-100 text-indigo-700' },
    { icon: Scale, label: 'Waste Collected', value: `${totalKg.toFixed(0)} kg`, color: 'bg-eco-100 text-eco-700' },
    { icon: Coins, label: 'Points Issued', value: totalPoints.toLocaleString(), color: 'bg-amber-100 text-amber-700' },
  ]

  // Waste by type
  const byType = WASTE_TYPES.map((t) => ({
    ...t,
    kg: completed
      .filter((p) => (p.waste_types || []).includes(t.id))
      .reduce((s, p) => s + Number(p.final_weight_kg || 0), 0),
  }))
  const maxType = Math.max(...byType.map((t) => t.kg), 1)

  // Monthly trend (6 months)
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      kg: completed
        .filter((p) => {
          const pd = new Date(p.created_at)
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
        })
        .reduce((s, p) => s + Number(p.final_weight_kg || 0), 0),
    })
  }
  const maxMonth = Math.max(...months.map((m) => m.kg), 1)

  // Status distribution
  const active = pickups.filter((p) => !['completed', 'cancelled'].includes(p.status))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className={`rounded-xl p-2.5 ${color}`}><Icon size={20} /></span>
            <div>
              <p className="text-lg font-extrabold text-gray-800">{value}</p>
              <p className="text-[11px] text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Monthly trend */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Waste Collected — Last 6 Months</h2>
          <div className="flex h-36 items-end justify-between gap-2">
            {months.map((m, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-eco-700">{m.kg > 0 ? `${m.kg.toFixed(0)}` : ''}</span>
                <div
                  className={`w-full max-w-10 rounded-t-lg ${m.kg > 0 ? 'bg-gradient-to-t from-eco-600 to-eco-400' : 'bg-gray-100'}`}
                  style={{ height: `${Math.max((m.kg / maxMonth) * 100, 4)}%` }}
                />
                <span className="text-[10px] text-gray-400">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Waste by type */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Waste by Type</h2>
          <div className="space-y-3">
            {byType.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="w-7 text-lg">{t.emoji}</span>
                <div className="flex-1">
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${(t.kg / maxType) * 100}%` }} />
                  </div>
                </div>
                <span className="w-14 text-right text-xs font-semibold text-gray-600">{t.kg.toFixed(0)} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active pickups snapshot */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Live Operations — {active.length} active pickup{active.length === 1 ? '' : 's'}
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PICKUP_STATUSES)
            .filter(([id]) => !['completed', 'cancelled'].includes(id))
            .map(([id, s]) => {
              const n = pickups.filter((p) => p.status === id).length
              return (
                <span key={id} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${s.color}`}>
                  {s.label}: {n}
                </span>
              )
            })}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Pickups ---------------- */
function PickupsTab({ pickups, users }) {
  const [filter, setFilter] = useState('all')
  const nameOf = (id) => users.find((u) => u.id === id)?.name || '—'

  const filtered = filter === 'all' ? pickups : pickups.filter((p) => p.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'requested', 'accepted', 'on_the_way', 'processing', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
              filter === f ? 'bg-slate-800 text-white' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-100'
            }`}
          >
            {f === 'all' ? `All (${pickups.length})` : PICKUP_STATUSES[f]?.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Waste</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Weight</th>
              <th className="px-4 py-3">Collector</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{nameOf(p.user_id)}</td>
                <td className="px-4 py-3">
                  {(p.waste_types || []).map((id) => WASTE_TYPES.find((w) => w.id === id)?.emoji).join(' ')}
                </td>
                <td className="px-4 py-3 text-gray-500">{p.pickup_date}</td>
                <td className="px-4 py-3 text-gray-500">
                  {p.final_weight_kg ? `${p.final_weight_kg} kg` : `~${p.approx_weight_kg} kg`}
                </td>
                <td className="px-4 py-3 text-gray-500">{p.collector_name || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${PICKUP_STATUSES[p.status]?.color}`}>
                    {PICKUP_STATUSES[p.status]?.label}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No pickups</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------- Users ---------------- */
function UsersTab({ users, pickups }) {
  const [q, setQ] = useState('')
  const rows = users
    .filter((u) => u.user_type !== 'admin')
    .filter((u) => (u.name || '').toLowerCase().includes(q.toLowerCase()))

  const kgOf = (uid) =>
    pickups
      .filter((p) => p.user_id === uid && p.status === 'completed')
      .reduce((s, p) => s + Number(p.final_weight_kg || 0), 0)

  const typeLabel = (t) => {
    if (t === 'collector') return '🚛 Collector'
    const ut = USER_TYPES.find((x) => x.id === t)
    return ut ? `${ut.emoji} ${ut.label}` : t
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
        <Search size={16} className="text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Waste Given</th>
              <th className="px-4 py-3">Eco Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-800">{u.name}</span>
                  <span className="block text-[11px] text-gray-400">{u.email}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{typeLabel(u.user_type)}</td>
                <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{kgOf(u.id).toFixed(0)} kg</td>
                <td className="px-4 py-3 font-semibold text-eco-700">{(u.eco_points ?? 0).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------- Rewards ---------------- */
function RewardsTab({ transactions }) {
  const redemptions = transactions.filter((t) => t.type === 'redeem')
  const countFor = (title) => redemptions.filter((t) => t.title === title).length
  const totalSpent = redemptions.reduce((s, t) => s + Math.abs(t.points), 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-xl font-extrabold text-gray-800">{redemptions.length}</p>
          <p className="text-xs text-gray-500">Total Redemptions</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-xl font-extrabold text-gray-800">{totalSpent.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Points Redeemed</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3">Reward</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Redemptions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {REWARDS.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{r.emoji} {r.title}</td>
                <td className="px-4 py-3 text-gray-500">{r.partner}</td>
                <td className="px-4 py-3 font-semibold text-amber-600">{r.cost} pts</td>
                <td className="px-4 py-3 text-gray-600">{countFor(r.title)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-[11px] text-gray-400">
        Reward catalog is configured in code for this demo — a production build would let admins add/edit rewards here.
      </p>
    </div>
  )
}
