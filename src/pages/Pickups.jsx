import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Truck, ChevronRight, PackageOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyPickups } from '../lib/db'
import { WASTE_TYPES, PICKUP_STATUSES } from '../lib/constants'

const ACTIVE = ['requested', 'accepted', 'on_the_way', 'arrived', 'collected', 'processing']

export default function Pickups() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'history' ? 'history' : 'active'

  const [pickups, setPickups] = useState(null)

  useEffect(() => {
    if (user) getMyPickups(user.id).then(setPickups).catch(() => setPickups([]))
  }, [user])

  const list = (pickups ?? []).filter((p) =>
    tab === 'active' ? ACTIVE.includes(p.status) : ['completed', 'cancelled'].includes(p.status),
  )

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      {/* Header */}
      <header className="rounded-b-3xl bg-gradient-to-br from-eco-600 to-eco-800 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <h1 className="text-xl font-bold">My Pickups</h1>
        <p className="text-xs text-eco-100">Track and manage your waste pickups</p>
      </header>

      <div className="px-5 py-5 sm:px-8 lg:px-0">
        {/* Big green schedule button */}
        <button
          onClick={() => navigate('/pickups/new')}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-eco-600 py-4 text-base font-bold text-white shadow-lg shadow-eco-600/30 transition hover:bg-eco-700"
        >
          <Plus size={20} /> Schedule Pickup
        </button>

        {/* Tabs */}
        <div className="mb-4 flex rounded-xl bg-eco-100/70 p-1">
          {['active', 'history'].map((t) => (
            <button
              key={t}
              onClick={() => setParams(t === 'history' ? { tab: 'history' } : {})}
              className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition ${
                tab === t ? 'bg-white text-eco-700 shadow' : 'text-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        {pickups === null ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-eco-200 border-t-eco-600" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <PackageOpen size={40} className="text-eco-300" />
            <p className="text-sm font-medium text-gray-600">
              {tab === 'active' ? 'No active pickups' : 'No past pickups yet'}
            </p>
            <p className="text-xs text-gray-400">
              {tab === 'active' ? 'Schedule one with the green button above!' : 'Completed pickups appear here.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((p) => {
              const status = PICKUP_STATUSES[p.status] ?? PICKUP_STATUSES.requested
              const typeLabels = (p.waste_types ?? [])
                .map((id) => WASTE_TYPES.find((w) => w.id === id))
                .filter(Boolean)
              return (
                <li key={p.id}>
                  <button
                    onClick={() => navigate(`/pickups/${p.id}`)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition hover:shadow-md"
                  >
                    {p.photo_url ? (
                      <img src={p.photo_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-eco-100 text-eco-600">
                        <Truck size={22} />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-800">
                        {typeLabels.map((t) => `${t.emoji} ${t.label}`).join(', ') || 'Waste pickup'}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {p.pickup_date} · {p.pickup_time} · ~{p.approx_weight_kg} kg
                      </span>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </span>
                    <ChevronRight size={17} className="shrink-0 text-gray-300" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
