import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  ArrowLeft, Phone, CheckCircle2, Circle, Loader2, QrCode, Truck, PartyPopper, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getPickup, updatePickup, addPoints, pointsForWeight, addTransaction } from '../lib/db'
import { WASTE_TYPES } from '../lib/constants'
import PickupMap from '../components/PickupMap'

const STEPS = [
  { id: 'accepted', label: 'Collector Accepted' },
  { id: 'on_the_way', label: 'Collector on the Way' },
  { id: 'arrived', label: 'Collector Arrived' },
  { id: 'collected', label: 'Waste Collected' },
  { id: 'processing', label: 'Processing Center' },
]
const ORDER = ['requested', 'accepted', 'on_the_way', 'arrived', 'collected', 'processing', 'completed']

const DRIVERS = [
  { name: 'Ravi Kumar', vehicle: 'TS 09 EV 4521', phone: '+919000012345' },
  { name: 'Anjali Verma', vehicle: 'TS 10 EV 7788', phone: '+919000067890' },
]

export default function TrackPickup() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()

  const [pickup, setPickup] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [weightModal, setWeightModal] = useState(false)
  const [driverProgress, setDriverProgress] = useState(0) // 0..1 while on_the_way
  const timerRef = useRef(null)

  useEffect(() => {
    getPickup(id)
      .then((p) => (p ? setPickup(p) : setNotFound(true)))
      .catch(() => setNotFound(true))
  }, [id])

  // Animate driver towards home while "on the way"
  useEffect(() => {
    clearInterval(timerRef.current)
    if (pickup?.status === 'on_the_way') {
      setDriverProgress(0)
      timerRef.current = setInterval(() => {
        setDriverProgress((p) => Math.min(1, p + 0.02))
      }, 600)
    }
    return () => clearInterval(timerRef.current)
  }, [pickup?.status])

  const userPos = pickup?.lat ? { lat: pickup.lat, lng: pickup.lng } : { lat: 17.4326, lng: 78.4071 }

  // Driver starts ~2.5km north-east and approaches as progress → 1
  const driverPos = useMemo(() => {
    if (!pickup) return null
    if (pickup.status === 'on_the_way') {
      const remain = 1 - driverProgress
      return { lat: userPos.lat + 0.02 * remain, lng: userPos.lng + 0.02 * remain }
    }
    if (['arrived', 'collected'].includes(pickup.status)) return userPos
    return null
  }, [pickup, driverProgress, userPos.lat, userPos.lng])

  const etaMin = pickup?.status === 'on_the_way' ? Math.max(1, Math.ceil((1 - driverProgress) * 12)) : null
  const statusIdx = pickup ? ORDER.indexOf(pickup.status) : 0
  const driver = pickup?.collector_name
    ? { name: pickup.collector_name, vehicle: pickup.vehicle_number, phone: DRIVERS[0].phone }
    : null

  async function advance(updates) {
    const updated = await updatePickup(pickup.id, updates)
    setPickup(updated)
  }

  // ---- Collector simulator actions (until Stage 8 builds the real collector app) ----
  async function simulateNext() {
    const s = pickup.status
    if (s === 'requested') {
      const d = DRIVERS[Math.floor(Math.random() * DRIVERS.length)]
      await advance({ status: 'accepted', collector_name: d.name, vehicle_number: d.vehicle })
    } else if (s === 'accepted') await advance({ status: 'on_the_way' })
    else if (s === 'on_the_way') await advance({ status: 'arrived' })
    else if (s === 'arrived') setWeightModal(true) // collector "scans QR" + enters weight
  }

  async function completeCollection(weightKg) {
    const points = pointsForWeight(weightKg)
    await advance({ status: 'collected', final_weight_kg: weightKg, points_earned: points })
    setWeightModal(false)
    setShowQr(false)
    // Waste travels to processing, then completes + points credited
    setTimeout(async () => {
      await advance({ status: 'processing' })
      setTimeout(async () => {
        await advance({ status: 'completed' })
        await addPoints(user.id, points)
        await addTransaction({
          user_id: user.id,
          type: 'earn',
          points,
          title: 'Waste Pickup Completed',
          subtitle: `${weightKg} kg collected`,
        })
        await refreshProfile()
      }, 3500)
    }, 2500)
  }

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-gray-600">Pickup not found.</p>
        <button onClick={() => navigate('/pickups')} className="text-sm font-semibold text-eco-600 underline">
          Back to pickups
        </button>
      </div>
    )
  }

  if (!pickup) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-eco-200 border-t-eco-600" />
      </div>
    )
  }

  const typeLabels = (pickup.waste_types ?? [])
    .map((wid) => WASTE_TYPES.find((w) => w.id === wid))
    .filter(Boolean)
    .map((t) => `${t.emoji} ${t.label}`)
    .join(', ')

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      {/* Header */}
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-eco-600 to-eco-800 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <button onClick={() => navigate('/pickups')} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">Track Pickup</h1>
          <p className="truncate text-xs text-eco-100">{typeLabels || 'Waste pickup'} · {pickup.pickup_date} {pickup.pickup_time}</p>
        </div>
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-8 lg:px-0">
        {/* Completed banner */}
        {pickup.status === 'completed' && (
          <div className="flex items-center gap-3 rounded-2xl bg-eco-100 p-4 ring-1 ring-eco-300">
            <PartyPopper className="text-eco-700" size={26} />
            <div>
              <p className="text-sm font-bold text-eco-900">Pickup completed!</p>
              <p className="text-xs text-eco-700">
                {pickup.final_weight_kg} kg collected · <b>+{pickup.points_earned} eco points</b> credited 🎉
              </p>
            </div>
          </div>
        )}

        {/* Live map */}
        {pickup.status !== 'completed' && (
          <div className="overflow-hidden rounded-2xl shadow-sm">
            <PickupMap userPos={userPos} driverPos={driverPos} />
          </div>
        )}

        {/* Driver card */}
        {driver && !['completed', 'cancelled'].includes(pickup.status) && (
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-eco-100 text-xl">🧑‍🌾</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800">{driver.name}</p>
              <p className="text-xs text-gray-500">Vehicle: {driver.vehicle}</p>
              {etaMin && <p className="text-xs font-semibold text-eco-600">Arriving in ~{etaMin} min</p>}
            </div>
            <a href={`tel:${driver.phone}`}
              className="flex items-center gap-1.5 rounded-xl bg-eco-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-eco-700">
              <Phone size={14} /> Call
            </a>
          </div>
        )}

        {/* QR verification */}
        {pickup.status === 'arrived' && (
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-eco-200">
            <p className="mb-1 flex items-center justify-center gap-2 text-sm font-bold text-gray-800">
              <QrCode size={17} className="text-eco-600" /> Collector arrived — show this QR
            </p>
            <p className="mb-3 text-xs text-gray-500">The collector scans it to verify the pickup. No fake collections!</p>
            {showQr ? (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-200">
                  <QRCodeSVG value={`ecoreward:pickup:${pickup.id}`} size={170} fgColor="#14532d" />
                </div>
                <p className="text-[11px] text-gray-400">Pickup ID: {pickup.id.slice(0, 8)}…</p>
              </div>
            ) : (
              <button onClick={() => setShowQr(true)}
                className="rounded-xl bg-eco-600 px-5 py-3 text-sm font-bold text-white hover:bg-eco-700">
                Open My QR Code
              </button>
            )}
          </div>
        )}

        {/* Status timeline */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Pickup Status</h2>
          <ol className="space-y-0">
            {STEPS.map((step, i) => {
              const stepIdx = ORDER.indexOf(step.id)
              const isDone = statusIdx > stepIdx || pickup.status === 'completed'
              const isCurrent = pickup.status === step.id
              return (
                <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
                  {i < STEPS.length - 1 && (
                    <span className={`absolute left-[11px] top-6 h-full w-0.5 ${isDone ? 'bg-eco-500' : 'bg-gray-200'}`} />
                  )}
                  {isDone ? (
                    <CheckCircle2 size={23} className="relative z-10 shrink-0 text-eco-600" />
                  ) : isCurrent ? (
                    <span className="relative z-10 flex h-[23px] w-[23px] shrink-0 items-center justify-center">
                      <span className="absolute h-full w-full animate-ping rounded-full bg-eco-400 opacity-40" />
                      <Circle size={23} className="fill-eco-100 text-eco-600" />
                    </span>
                  ) : (
                    <Circle size={23} className="relative z-10 shrink-0 text-gray-300" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${isDone || isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {isCurrent && pickup.status === 'on_the_way' && etaMin && (
                      <p className="text-xs text-eco-600">ETA ~{etaMin} min</p>
                    )}
                    {isCurrent && pickup.status === 'processing' && (
                      <p className="flex items-center gap-1 text-xs text-teal-600">
                        <Loader2 size={11} className="animate-spin" /> Converting your waste into compost…
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Collector simulator (until the real collector app in Stage 8) */}
        {!['collected', 'processing', 'completed', 'cancelled'].includes(pickup.status) && (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
              🎛️ Collector Simulator (demo)
            </p>
            <button onClick={simulateNext}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600">
              <Truck size={16} />
              {pickup.status === 'requested' && 'Simulate: Collector Accepts'}
              {pickup.status === 'accepted' && 'Simulate: Collector Departs'}
              {pickup.status === 'on_the_way' && 'Simulate: Collector Arrives'}
              {pickup.status === 'arrived' && 'Simulate: Scan QR & Weigh'}
            </button>
          </div>
        )}
      </div>

      {weightModal && (
        <WeightModal
          defaultWeight={pickup.approx_weight_kg}
          onCancel={() => setWeightModal(false)}
          onConfirm={completeCollection}
        />
      )}
    </div>
  )
}

function WeightModal({ defaultWeight, onCancel, onConfirm }) {
  const [weight, setWeight] = useState(defaultWeight || '')
  const points = weight ? pointsForWeight(weight) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">QR Scanned ✓ — Enter Weight</h2>
          <button onClick={onCancel} className="rounded-full p-1.5 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-xs text-gray-500">The collector verifies the actual weight on their scale.</p>
        <input
          type="number" min="0.5" step="0.5" autoFocus value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full rounded-xl border border-eco-200 px-4 py-3 text-center text-2xl font-bold text-gray-800 outline-none focus:border-eco-500 focus:ring-2 focus:ring-eco-200"
          placeholder="kg"
        />
        <p className="mt-2 text-center text-sm text-eco-700">
          = <b>{points}</b> eco points (14 pts/kg)
        </p>
        <button
          disabled={!weight || Number(weight) <= 0}
          onClick={() => onConfirm(Number(weight))}
          className="mt-4 w-full rounded-xl bg-eco-600 py-3 font-semibold text-white transition hover:bg-eco-700 disabled:opacity-50"
        >
          Confirm & Complete Pickup
        </button>
      </div>
    </div>
  )
}
