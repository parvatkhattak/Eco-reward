import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Navigation, Phone, QrCode, Scale, CheckCircle2, Loader2, MapPin,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  getPickup, updatePickup, addPoints, addTransaction, pointsForWeight, getProfileById,
} from '../../lib/db'
import { WASTE_TYPES } from '../../lib/constants'
import PickupMap from '../../components/PickupMap'

export default function CollectorPickup() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [pickup, setPickup] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [weight, setWeight] = useState('')
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    getPickup(id).then((p) => {
      setPickup(p)
      if (p?.final_weight_kg) setWeight(String(p.final_weight_kg))
      if (p?.user_id) getProfileById(p.user_id).then(setCustomer)
    })
  }, [id])

  async function advance(updates) {
    const updated = await updatePickup(pickup.id, updates)
    setPickup(updated)
  }

  function startScan() {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setScanned(true)
    }, 2200)
  }

  async function completeJob() {
    const kg = Number(weight)
    const points = pointsForWeight(kg)
    setFinishing(true)
    await advance({ status: 'collected', final_weight_kg: kg, points_earned: points })
    setTimeout(async () => {
      await advance({ status: 'processing' })
      setTimeout(async () => {
        await advance({ status: 'completed' })
        await addPoints(pickup.user_id, points)
        await addTransaction({
          user_id: pickup.user_id,
          type: 'earn',
          points,
          title: 'Waste Pickup Completed',
          subtitle: `${kg} kg collected`,
        })
        setFinishing(false)
      }, 2000)
    }, 1500)
  }

  if (!pickup) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
      </div>
    )
  }

  const typeLabels = (pickup.waste_types || [])
    .map((wid) => WASTE_TYPES.find((w) => w.id === wid))
    .filter(Boolean)
    .map((t) => `${t.emoji} ${t.label}`)
    .join(', ')

  const userPos = { lat: pickup.lat ?? 17.4326, lng: pickup.lng ?? 78.4071 }
  const depotPos = { lat: profile?.lat ?? 17.4108, lng: profile?.lng ?? 78.4294 }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl bg-gray-50 pb-10">
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-sky-600 to-indigo-800 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <button onClick={() => navigate('/collector')} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">Pickup Job</h1>
          <p className="truncate text-xs text-sky-200">{typeLabels} · ~{pickup.approx_weight_kg} kg</p>
        </div>
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-8">
        {/* Completed state */}
        {pickup.status === 'completed' && (
          <div className="rounded-2xl bg-eco-100 p-5 text-center ring-1 ring-eco-300">
            <CheckCircle2 size={40} className="mx-auto text-eco-600" />
            <p className="mt-2 text-sm font-bold text-eco-900">Job complete!</p>
            <p className="text-xs text-eco-700">
              {pickup.final_weight_kg} kg collected · customer earned +{pickup.points_earned} points
            </p>
            <button onClick={() => navigate('/collector')}
              className="mt-4 rounded-xl bg-eco-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-eco-700">
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Map */}
        {pickup.status !== 'completed' && (
          <div className="overflow-hidden rounded-2xl shadow-sm">
            <PickupMap
              userPos={userPos}
              driverPos={['accepted', 'on_the_way'].includes(pickup.status) ? depotPos : null}
            />
          </div>
        )}

        {/* Customer card */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-sky-700">
              {(customer?.name || '??').split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800">{customer?.name || 'Customer'}</p>
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={11} className="shrink-0" /> {pickup.address}
              </p>
              <p className="text-xs text-gray-500">
                {pickup.pickup_date} · {pickup.pickup_time}
                {pickup.instructions && <> · 📝 {pickup.instructions}</>}
              </p>
            </div>
            {customer?.phone && (
              <a href={`tel:${customer.phone}`}
                className="rounded-xl bg-sky-600 p-2.5 text-white hover:bg-sky-700" aria-label="Call customer">
                <Phone size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Action flow */}
        {pickup.status === 'accepted' && (
          <div className="grid grid-cols-2 gap-3">
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${userPos.lat},${userPos.lng}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-white py-3.5 text-sm font-bold text-sky-700 hover:bg-sky-50">
              <Navigation size={16} /> Navigate
            </a>
            <button onClick={() => advance({ status: 'on_the_way' })}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3.5 text-sm font-bold text-white hover:bg-sky-700">
              🚛 Start Trip
            </button>
          </div>
        )}

        {pickup.status === 'on_the_way' && (
          <button onClick={() => advance({ status: 'arrived' })}
            className="w-full rounded-2xl bg-sky-600 py-3.5 text-sm font-bold text-white hover:bg-sky-700">
            📍 I've Arrived
          </button>
        )}

        {pickup.status === 'arrived' && !scanned && (
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
            {scanning ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative h-40 w-40 overflow-hidden rounded-2xl bg-gray-900">
                  <div className="absolute inset-4 rounded-xl border-2 border-sky-400/60" />
                  <div className="absolute inset-x-4 top-4 h-0.5 animate-[scan_1.2s_ease-in-out_infinite] bg-sky-400 shadow-[0_0_12px_2px_rgba(56,189,248,.8)]" />
                  <style>{`@keyframes scan { 0%,100% { transform: translateY(0) } 50% { transform: translateY(128px) } }`}</style>
                </div>
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <Loader2 size={15} className="animate-spin" /> Scanning customer's QR…
                </p>
              </div>
            ) : (
              <>
                <QrCode size={40} className="mx-auto text-sky-600" />
                <p className="mt-2 text-sm font-bold text-gray-800">Verify the pickup</p>
                <p className="mb-4 text-xs text-gray-500">Ask the customer to open their QR code, then scan it.</p>
                <button onClick={startScan}
                  className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white hover:bg-sky-700">
                  📷 Scan QR Code
                </button>
              </>
            )}
          </div>
        )}

        {pickup.status === 'arrived' && scanned && (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-eco-200">
            <p className="flex items-center gap-2 text-sm font-bold text-eco-700">
              <CheckCircle2 size={17} /> QR verified — pickup #{pickup.id.slice(0, 8)}
            </p>
            <p className="mb-3 mt-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Scale size={15} /> Enter weighed amount
            </p>
            <input
              type="number" min="0.5" step="0.5" value={weight} autoFocus
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-xl border border-sky-200 px-4 py-3 text-center text-2xl font-bold text-gray-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="kg"
            />
            <p className="mt-2 text-center text-xs text-gray-500">
              Customer earns <b className="text-eco-700">{weight ? pointsForWeight(weight) : 0} points</b>
            </p>
            <button
              disabled={!weight || Number(weight) <= 0 || finishing}
              onClick={completeJob}
              className="mt-4 w-full rounded-xl bg-eco-600 py-3.5 text-sm font-bold text-white hover:bg-eco-700 disabled:opacity-50"
            >
              {finishing ? 'Completing…' : '✓ Confirm Collection'}
            </button>
          </div>
        )}

        {['collected', 'processing'].includes(pickup.status) && (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-5 text-sm font-semibold text-teal-700 shadow-sm">
            <Loader2 size={16} className="animate-spin" />
            {pickup.status === 'collected' ? 'Heading to processing center…' : 'Delivering to processing center…'}
          </div>
        )}
      </div>
    </div>
  )
}
