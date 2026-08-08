import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Package, Scale, CheckCircle2, MapPin, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getCollectorPickups, getCollectorCompleted, updatePickup } from '../../lib/db'
import { WASTE_TYPES, PICKUP_STATUSES } from '../../lib/constants'

export default function CollectorDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [completed, setCompleted] = useState([])

  const load = () => {
    if (!profile) return
    getCollectorPickups(profile.name).then(setJobs).catch(() => {})
    getCollectorCompleted(profile.name).then(setCompleted).catch(() => {})
  }
  useEffect(load, [profile])

  async function acceptJob(e, job) {
    e.stopPropagation()
    await updatePickup(job.id, {
      status: 'accepted',
      collector_name: profile.name,
      vehicle_number: profile.vehicle_number || 'TS 09 EV 4521',
    })
    load()
  }

  const today = new Date().toDateString()
  const todayDone = completed.filter((p) => new Date(p.created_at).toDateString() === today)
  const todayKg = todayDone.reduce((s, p) => s + Number(p.final_weight_kg || 0), 0)

  const open = jobs.filter((j) => j.status === 'requested')
  const mine = jobs.filter((j) => j.status !== 'requested')

  const typeEmojis = (p) =>
    (p.waste_types || [])
      .map((id) => WASTE_TYPES.find((w) => w.id === id)?.emoji)
      .filter(Boolean)
      .join(' ')

  const JobCard = ({ job, action }) => (
    <button
      onClick={() => job.status !== 'requested' && navigate(`/collector/pickups/${job.id}`)}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition hover:shadow-md"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xl">
        {typeEmojis(job) || '🚛'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-800">
            ~{job.approx_weight_kg} kg · {job.pickup_time}
          </span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${PICKUP_STATUSES[job.status]?.color}`}>
            {PICKUP_STATUSES[job.status]?.label}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
          <MapPin size={11} className="shrink-0" /> {job.address}
        </span>
      </span>
      {action ?? <ChevronRight size={17} className="shrink-0 text-gray-300" />}
    </button>
  )

  return (
    <div className="mx-auto min-h-dvh max-w-3xl bg-gray-50 pb-10">
      {/* Header */}
      <header className="rounded-b-3xl bg-gradient-to-br from-sky-600 to-indigo-800 px-5 pb-16 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-sky-200">🚛 Collection Partner</p>
            <h1 className="text-2xl font-bold">Hi, {profile?.name?.split(' ')[0]}</h1>
            <p className="text-xs text-sky-200">Vehicle: {profile?.vehicle_number || '—'}</p>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/login', { replace: true }) }}
            className="rounded-full bg-white/15 p-2.5 hover:bg-white/25" aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="-mt-10 grid grid-cols-3 gap-3 px-5 sm:px-8">
        {[
          { icon: Package, value: jobs.length, label: 'Active Jobs', color: 'text-sky-600' },
          { icon: CheckCircle2, value: todayDone.length, label: 'Done Today', color: 'text-eco-600' },
          { icon: Scale, value: `${todayKg} kg`, label: 'Collected Today', color: 'text-amber-500' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="rounded-2xl bg-white p-3.5 text-center shadow-lg shadow-sky-900/5">
            <Icon className={`mx-auto mb-1 ${color}`} size={20} />
            <p className="text-lg font-bold text-gray-800">{value}</p>
            <p className="text-[11px] leading-tight text-gray-500">{label}</p>
          </div>
        ))}
      </section>

      {/* New requests */}
      <section className="mt-6 px-5 sm:px-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          📥 New Requests {open.length > 0 && <span className="text-sky-600">({open.length})</span>}
        </h2>
        {open.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-center text-sm text-gray-400 shadow-sm">No new requests right now</p>
        ) : (
          <div className="space-y-3">
            {open.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                action={
                  <span
                    onClick={(e) => acceptJob(e, job)}
                    className="shrink-0 cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700"
                  >
                    Accept
                  </span>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* My route */}
      <section className="mt-6 px-5 sm:px-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">🗺️ My Route</h2>
        {mine.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-center text-sm text-gray-400 shadow-sm">
            Accept a request to start your route
          </p>
        ) : (
          <div className="space-y-3">
            {mine.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </section>
    </div>
  )
}
