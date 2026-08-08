// One-click demo account — seeds localStorage and activates demo mode.
// Demo mode forces the local backend (see lib/supabase.js), so no Supabase
// requests (and no rate-limited emails) are made.

const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
const dateStr = (d) => d.toISOString().split('T')[0]

export function enterDemoMode() {
  const session = seedDemoData()
  localStorage.setItem('eco_session', JSON.stringify(session))
  localStorage.setItem('eco_demo', '1')
  // Full reload so the whole app re-initialises with the local backend
  window.location.href = '/home'
}

// Collector (driver) demo — Stage 8
export function enterCollectorDemo() {
  seedDemoData()
  const collector = {
    id: 'demo-collector-0001',
    email: 'ravi@demo.eco',
    name: 'Ravi Kumar',
    phone: '9000012345',
    address: 'EcoReward Depot, Banjara Hills, Hyderabad',
    lat: 17.4108,
    lng: 78.4294,
    user_type: 'collector',
    vehicle_number: 'TS 09 EV 4521',
    eco_points: 0,
    created_at: daysAgo(90).toISOString(),
  }
  const users = JSON.parse(localStorage.getItem('eco_users') || '[]').filter((u) => u.id !== collector.id)
  users.push({ ...collector, password: 'demo123' })
  localStorage.setItem('eco_users', JSON.stringify(users))
  localStorage.setItem('eco_session', JSON.stringify(collector))
  localStorage.setItem('eco_demo', '1')
  window.location.href = '/collector'
}

// Admin demo — Stage 9
export function enterAdminDemo() {
  seedDemoData()
  seedCityData()
  const admin = {
    id: 'demo-admin-0001',
    email: 'admin@ecoreward.in',
    name: 'City Admin',
    phone: '9000000001',
    address: 'EcoReward HQ, Hyderabad',
    user_type: 'admin',
    eco_points: 0,
    created_at: daysAgo(365).toISOString(),
  }
  const users = JSON.parse(localStorage.getItem('eco_users') || '[]').filter((u) => u.id !== admin.id)
  users.push({ ...admin, password: 'demo123' })
  localStorage.setItem('eco_users', JSON.stringify(users))
  localStorage.setItem('eco_session', JSON.stringify(admin))
  localStorage.setItem('eco_demo', '1')
  window.location.href = '/admin'
}

// Extra city-wide users & pickups so admin charts look real
function seedCityData() {
  const cityUsers = [
    { id: 'demo-user-1001', name: 'Spice Garden Restaurant', user_type: 'restaurant', eco_points: 1230, phone: '9812300001', email: 'spice@demo.eco', address: 'Road No 2, Banjara Hills', created_at: daysAgo(150).toISOString() },
    { id: 'demo-user-1002', name: 'Hotel Suvarna', user_type: 'hotel', eco_points: 1975, phone: '9812300002', email: 'suvarna@demo.eco', address: 'Begumpet Main Rd', created_at: daysAgo(140).toISOString() },
    { id: 'demo-user-1003', name: 'Meenakshi Temple Trust', user_type: 'temple', eco_points: 1540, phone: '9812300003', email: 'temple@demo.eco', address: 'Old City', created_at: daysAgo(120).toISOString() },
    { id: 'demo-user-1004', name: 'Lakshmi Flower Depot', user_type: 'flower_shop', eco_points: 860, phone: '9812300004', email: 'flowers@demo.eco', address: 'Gudimalkapur Market', created_at: daysAgo(90).toISOString() },
    { id: 'demo-user-1005', name: 'Priya Sharma', user_type: 'household', eco_points: 610, phone: '9812300005', email: 'priya@demo.eco', address: 'Madhapur', created_at: daysAgo(60).toISOString() },
  ]
  const collectors = [
    { id: 'demo-collector-0002', name: 'Anjali Verma', user_type: 'collector', vehicle_number: 'TS 10 EV 7788', eco_points: 0, phone: '9000067890', email: 'anjali@demo.eco', address: 'Depot 2, Kukatpally', created_at: daysAgo(200).toISOString() },
  ]
  const mk = (i, userIdx, dAgo, types, kg, status, collector) => ({
    id: `demo-city-pk-${String(i).padStart(3, '0')}`,
    user_id: cityUsers[userIdx].id,
    waste_types: types,
    approx_weight_kg: kg,
    final_weight_kg: status === 'completed' ? kg : null,
    pickup_date: dateStr(daysAgo(dAgo)),
    pickup_time: ['09:00', '11:30', '15:00', '17:30'][i % 4],
    lat: 17.4 + (i % 7) * 0.01,
    lng: 78.4 + (i % 5) * 0.012,
    address: cityUsers[userIdx].address,
    status,
    points_earned: status === 'completed' ? Math.round(kg * 14) : 0,
    collector_name: collector,
    vehicle_number: collector === 'Ravi Kumar' ? 'TS 09 EV 4521' : collector ? 'TS 10 EV 7788' : null,
    created_at: daysAgo(dAgo).toISOString(),
  })
  const cityPickups = [
    mk(1, 0, 160, ['food'], 22, 'completed', 'Ravi Kumar'),
    mk(2, 1, 130, ['food', 'vegetable'], 35, 'completed', 'Anjali Verma'),
    mk(3, 2, 110, ['flower'], 12, 'completed', 'Ravi Kumar'),
    mk(4, 1, 95, ['food'], 28, 'completed', 'Anjali Verma'),
    mk(5, 3, 75, ['flower', 'garden'], 9, 'completed', 'Ravi Kumar'),
    mk(6, 0, 55, ['food', 'fruit'], 18, 'completed', 'Anjali Verma'),
    mk(7, 4, 40, ['vegetable'], 6, 'completed', 'Ravi Kumar'),
    mk(8, 2, 28, ['flower'], 14, 'completed', 'Anjali Verma'),
    mk(9, 1, 12, ['food'], 31, 'completed', 'Ravi Kumar'),
    mk(10, 3, 4, ['flower'], 7, 'completed', 'Anjali Verma'),
    mk(11, 4, 1, ['garden', 'vegetable'], 5, 'processing', 'Ravi Kumar'),
    mk(12, 0, 0, ['food'], 20, 'requested', null),
  ]

  const users = JSON.parse(localStorage.getItem('eco_users') || '[]')
  const keep = users.filter((u) => !u.id.startsWith('demo-user-10') && u.id !== 'demo-collector-0002')
  localStorage.setItem('eco_users', JSON.stringify([...keep, ...cityUsers, ...collectors]))

  const pickups = JSON.parse(localStorage.getItem('eco_pickups') || '[]')
  const keepPk = pickups.filter((p) => !p.id.startsWith('demo-city-pk-'))
  localStorage.setItem('eco_pickups', JSON.stringify([...keepPk, ...cityPickups]))
}

function seedDemoData() {
  const userId = 'demo-user-0001'

  const demoUser = {
    id: userId,
    email: 'siri@demo.eco',
    password: 'demo123',
    name: 'Siri Reddy',
    phone: '9876543210',
    address: '12, Green Park Colony, Jubilee Hills, Hyderabad',
    lat: 17.4326,
    lng: 78.4071,
    user_type: 'household',
    eco_points: 450,
    created_at: daysAgo(40).toISOString(),
  }

  // A second household nearby with an open request (for the collector demo)
  const neighbour = {
    id: 'demo-user-0002',
    email: 'arjun@demo.eco',
    password: 'demo123',
    name: 'Arjun Mehta',
    phone: '9876500011',
    address: '45, Rose Villa, Banjara Hills, Hyderabad',
    lat: 17.4189,
    lng: 78.4488,
    user_type: 'household',
    eco_points: 120,
    created_at: daysAgo(25).toISOString(),
  }

  const pickups = [
    {
      id: 'demo-pickup-0001',
      user_id: userId,
      waste_types: ['food', 'vegetable'],
      approx_weight_kg: 8,
      final_weight_kg: 8.5,
      pickup_date: dateStr(daysAgo(6)),
      pickup_time: '10:30',
      photo_url: null,
      lat: 17.4326,
      lng: 78.4071,
      address: demoUser.address,
      instructions: 'Ring the bell',
      status: 'completed',
      points_earned: 120,
      collector_name: 'Ravi Kumar',
      vehicle_number: 'TS 09 EV 4521',
      created_at: daysAgo(6).toISOString(),
    },
    {
      id: 'demo-pickup-0002',
      user_id: userId,
      waste_types: ['flower', 'garden'],
      approx_weight_kg: 5,
      final_weight_kg: 4.5,
      pickup_date: dateStr(daysAgo(2)),
      pickup_time: '09:00',
      photo_url: null,
      lat: 17.4326,
      lng: 78.4071,
      address: demoUser.address,
      instructions: '',
      status: 'completed',
      points_earned: 85,
      collector_name: 'Anjali Verma',
      vehicle_number: 'TS 10 EV 7788',
      created_at: daysAgo(2).toISOString(),
    },
    {
      id: 'demo-pickup-0003',
      user_id: userId,
      waste_types: ['food'],
      approx_weight_kg: 3,
      final_weight_kg: null,
      pickup_date: dateStr(daysAgo(-1)), // tomorrow
      pickup_time: '11:00',
      photo_url: null,
      lat: 17.4326,
      lng: 78.4071,
      address: demoUser.address,
      instructions: 'Gate code 4321',
      status: 'accepted',
      points_earned: 0,
      collector_name: 'Ravi Kumar',
      vehicle_number: 'TS 09 EV 4521',
      created_at: daysAgo(0).toISOString(),
    },
    {
      id: 'demo-pickup-0004',
      user_id: neighbour.id,
      waste_types: ['vegetable', 'fruit'],
      approx_weight_kg: 6,
      final_weight_kg: null,
      pickup_date: dateStr(daysAgo(0)),
      pickup_time: '17:30',
      photo_url: null,
      lat: neighbour.lat,
      lng: neighbour.lng,
      address: neighbour.address,
      instructions: 'Blue bin near the gate',
      status: 'requested',
      points_earned: 0,
      collector_name: null,
      vehicle_number: null,
      created_at: daysAgo(0).toISOString(),
    },
  ]

  // Wallet transaction history (sums to the 450-point balance)
  const transactions = [
    { id: 'demo-tx-0001', user_id: userId, type: 'earn', points: 50, title: 'Welcome Bonus', subtitle: 'Thanks for joining EcoReward!', created_at: daysAgo(40).toISOString() },
    { id: 'demo-tx-0002', user_id: userId, type: 'earn', points: 230, title: 'Food Waste Pickup', subtitle: '16.4 kg collected', created_at: daysAgo(20).toISOString() },
    { id: 'demo-tx-0003', user_id: userId, type: 'earn', points: 165, title: 'Garden Waste Pickup', subtitle: '11.8 kg collected', created_at: daysAgo(12).toISOString() },
    { id: 'demo-tx-0004', user_id: userId, type: 'redeem', points: -200, title: '₹100 Grocery Coupon', subtitle: 'FreshMart', coupon_code: 'ECO-7K2M-9QRT', created_at: daysAgo(8).toISOString() },
    { id: 'demo-tx-0005', user_id: userId, type: 'earn', points: 120, title: 'Food & Vegetable Waste Pickup', subtitle: '8.5 kg collected', created_at: daysAgo(6).toISOString() },
    { id: 'demo-tx-0006', user_id: userId, type: 'earn', points: 85, title: 'Flower & Garden Waste Pickup', subtitle: '4.5 kg collected', created_at: daysAgo(2).toISOString() },
  ]

  // Seed (merge-safe: replaces previous demo data)
  const users = JSON.parse(localStorage.getItem('eco_users') || '[]').filter(
    (u) => u.id !== userId && u.id !== neighbour.id,
  )
  users.push(demoUser, neighbour)
  localStorage.setItem('eco_users', JSON.stringify(users))

  const existing = JSON.parse(localStorage.getItem('eco_pickups') || '[]').filter(
    (p) => p.user_id !== userId && p.user_id !== neighbour.id,
  )
  localStorage.setItem('eco_pickups', JSON.stringify([...existing, ...pickups]))

  const existingTx = JSON.parse(localStorage.getItem('eco_transactions') || '[]').filter(
    (t) => t.user_id !== userId,
  )
  localStorage.setItem('eco_transactions', JSON.stringify([...existingTx, ...transactions]))

  const { password: _pw, ...session } = demoUser
  return session
}

export function exitDemoMode() {
  localStorage.removeItem('eco_demo')
  localStorage.removeItem('eco_session')
  window.location.href = '/login'
}
