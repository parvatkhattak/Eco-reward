import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, Navigation, Phone, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const facilityIcon = divIcon({
  html: `<div style="font-size:20px;line-height:34px;text-align:center;width:34px;height:34px;
    background:white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.25);border:2px solid #0d9488;">🌱</div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})
const homeIcon = divIcon({
  html: `<div style="font-size:20px;line-height:34px;text-align:center;width:34px;height:34px;
    background:white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.25);border:2px solid #16a34a;">📍</div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

// Mock facilities placed around the user's location
const FACILITY_DEFS = [
  { name: 'GreenCycle Compost Hub', dLat: 0.012, dLng: 0.008, hours: '8 AM – 6 PM', phone: '+914023456701', tags: ['Compost', 'Drop-off'] },
  { name: 'City Organic Processing Center', dLat: -0.018, dLng: 0.015, hours: '7 AM – 8 PM', phone: '+914023456702', tags: ['Biogas', 'Bulk'] },
  { name: 'EcoWorth Recycling Point', dLat: 0.009, dLng: -0.02, hours: '9 AM – 5 PM', phone: '+914023456703', tags: ['Compost', 'Education'] },
  { name: 'Suburban Biogas Plant', dLat: -0.025, dLng: -0.012, hours: '24 hours', phone: '+914023456704', tags: ['Biogas'] },
]

const haversineKm = (a, b) => {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
}

export default function Facilities() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const userPos = useMemo(
    () => ({ lat: profile?.lat ?? 17.4326, lng: profile?.lng ?? 78.4071 }),
    [profile],
  )

  const facilities = useMemo(
    () =>
      FACILITY_DEFS.map((f) => {
        const pos = { lat: userPos.lat + f.dLat, lng: userPos.lng + f.dLng }
        return { ...f, ...pos, km: haversineKm(userPos, pos) }
      }).sort((a, b) => a.km - b.km),
    [userPos],
  )

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-teal-600 to-eco-800 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">🗺️ Nearby Compost Centers</h1>
          <p className="text-xs text-teal-100">Where your waste becomes worth</p>
        </div>
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-8 lg:px-0">
        {/* Map */}
        <div className="overflow-hidden rounded-2xl shadow-sm">
          <MapContainer
            center={[userPos.lat, userPos.lng]}
            zoom={13}
            style={{ height: 280, width: '100%', zIndex: 0 }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[userPos.lat, userPos.lng]} icon={homeIcon}>
              <Popup>You are here</Popup>
            </Marker>
            {facilities.map((f) => (
              <Marker key={f.name} position={[f.lat, f.lng]} icon={facilityIcon}>
                <Popup>
                  <b>{f.name}</b>
                  <br />
                  {f.hours} · {f.km.toFixed(1)} km away
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* List */}
        <div className="space-y-3">
          {facilities.map((f) => (
            <div key={f.name} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-2xl">🌱</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{f.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={11} /> {f.hours} · <b className="text-teal-700">{f.km.toFixed(1)} km</b>
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <span key={t} className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700"
                >
                  <Navigation size={13} /> Directions
                </a>
                <a
                  href={`tel:${f.phone}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-teal-200 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-50"
                >
                  <Phone size={13} /> Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
