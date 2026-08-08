import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const emojiIcon = (emoji, size = 34) =>
  divIcon({
    html: `<div style="font-size:${size - 8}px;line-height:${size}px;text-align:center;
      width:${size}px;height:${size}px;background:white;border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,.25);border:2px solid #16a34a;">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })

const homeIcon = emojiIcon('🏠')
const truckIcon = emojiIcon('🚛')

export default function PickupMap({ userPos, driverPos, height = 260 }) {
  if (!userPos) return null

  return (
    <MapContainer
      center={[userPos.lat, userPos.lng]}
      zoom={14}
      style={{ height, width: '100%', borderRadius: 16, zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[userPos.lat, userPos.lng]} icon={homeIcon}>
        <Popup>Pickup location</Popup>
      </Marker>
      {driverPos && (
        <>
          <Marker position={[driverPos.lat, driverPos.lng]} icon={truckIcon}>
            <Popup>Your collector</Popup>
          </Marker>
          <Polyline
            positions={[
              [driverPos.lat, driverPos.lng],
              [userPos.lat, userPos.lng],
            ]}
            pathOptions={{ color: '#16a34a', dashArray: '8 10', weight: 3 }}
          />
        </>
      )}
    </MapContainer>
  )
}
