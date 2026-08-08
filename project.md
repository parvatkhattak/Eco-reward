# 🌱 EcoReward — Turn Waste into Worth

**Product documentation** — everything about the platform, its features, flows, and internals.

---

## 1. What is EcoReward?

EcoReward is a web platform that incentivizes proper disposal of **biodegradable waste**. Instead of food scraps, flowers, and garden waste ending up in landfills, users schedule doorstep pickups and earn **eco points** for every kilogram collected. Points are redeemed for real-world rewards — grocery coupons, saplings, compost, movie tickets, and more. Collected waste is routed to composting facilities, closing the loop.

**Tagline:** *Turn Waste into Worth.*

**The three-sided ecosystem:**

| Side | Who | What they do |
|---|---|---|
| 👤 Users | Households, restaurants, hotels, temples, flower shops, event organizers | Schedule pickups, earn points, redeem rewards, track impact |
| 🚛 Collectors | Collection partners / drivers | Accept jobs, run routes, verify via QR, weigh and collect |
| 🛡️ Admin | City operations team | Monitor city-wide collection, users, and reward economics |

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, React Router |
| Styling | Tailwind CSS v4 (`@theme` custom eco green palette) |
| Backend | Supabase (Postgres + Auth + RLS) **or** localStorage demo mode |
| Maps | Leaflet + react-leaflet + OpenStreetMap (no API key) |
| QR | qrcode.react |
| Icons | lucide-react + emoji |
| Charts | Pure CSS bars (no chart library) |

**Dual-backend architecture:** every data function in `src/lib/db.js` branches on `isSupabaseConfigured` — real Supabase when configured, localStorage otherwise. Demo mode (`eco_demo` flag) forces the localStorage path, so the entire product works with **zero backend setup**.

---

## 3. User portal features

### 3.1 Splash & onboarding
- Animated splash screen with logo pop + tagline fade-up
- Auto-routes to login (or home if already signed in)

### 3.2 Authentication
- Email + password sign up / sign in
- Phone OTP login (Supabase)
- Google OAuth
- **6 user types** at signup: Household, Restaurant, Hotel, Temple, Flower Shop, Event Organizer
- Profile stores name, phone, address, geolocation (lat/lng), user type
- 3 one-click demo accounts (user / collector / admin) — no signup needed

### 3.3 Home dashboard
- Personalized greeting + eco points balance
- Stat cards: total waste given, pickups completed
- Upcoming pickup banner (when one is scheduled)
- 9 quick actions: Request Pickup, My Pickups, Rewards, Wallet, Your Impact, Leaderboard, Challenges, Facilities, Profile
- Daily eco tip

### 3.4 Request pickup
- **Photo upload with AI waste verification** (mock AI): confirms the waste is biodegradable, detects category, rejects plastic/non-bio
- Waste type selection (multi): 🍲 Food, 🌸 Flower, 🥬 Vegetable, 🍎 Fruit, 🌿 Garden
- Estimated weight slider → **live points preview** (14 pts/kg)
- Date + time-slot scheduling
- Address confirmation + pickup instructions ("Blue bin near the gate")

### 3.5 Live pickup tracking (Swiggy-style)
- Status timeline: Requested → Accepted → On the way → Arrived → Collected → Processing → Completed
- **Live Leaflet map** with animated driver marker moving toward the user's home + dashed route line
- ETA countdown (~12 min)
- Driver card: name, vehicle number, tap-to-call
- **QR code handshake**: unique QR (`ecoreward:pickup:<id>`) shown when the collector arrives — collector scans it to verify the right pickup
- Built-in collector simulator (demo) to walk the full lifecycle
- On completion: weight recorded → points credited → wallet transaction logged

### 3.6 Eco wallet & rewards store
- Points balance card with gradient hero
- **Rewards store** (8 items): 2kg Compost (150), Sapling (100), ₹100 Grocery Coupon (200), ₹50 Mobile Recharge (120), Movie Ticket (250), 15% Restaurant Discount (180), Tree Donation (300), Monthly Bus Pass (220)
- Affordability check — unaffordable items show "Need more"
- Redeem flow: confirm modal → points deducted → **coupon code generated** (`ECO-XXXX-XXXX`) with copy button
- **Wallet history**: full transaction ledger (+earn green / −redeem red) with timestamps and coupon codes

### 3.7 Sustainability dashboard (Your Impact)
- Lifetime stats: total kg diverted, pickups completed, compost produced (0.3 kg/kg), CO₂ prevented (1.9 kg/kg), tree-equivalents (21 kg CO₂/tree/yr)
- This-month highlight card
- 6-month collection bar chart
- **6 achievement badges** with earn conditions:
  - 🌱 First Steps — 1 pickup
  - ♻️ Eco Regular — 5 pickups
  - ⚖️ 25kg Club — 25 kg diverted
  - 👑 Compost King — 100 kg diverted
  - 🎁 Smart Redeemer — 1 redemption
  - 🌍 Green Warrior — 500 points earned

### 3.8 Community
- **Leaderboard**: city ranking with 🥇🥈🥉, your position highlighted
- **Monthly challenges** with live progress bars: Monthly Mission (20 kg → +150), Consistency Champ (4 pickups → +100), Flower Power (5 kg flowers → +80)
- **Referral program**: personal code (`ECO<NAME><ID>`) with copy + native share

### 3.9 Utilities
- **Nearby facilities**: Leaflet map of composting centers with distances (haversine), open hours, Directions (Google Maps) + Call buttons
- **Notifications**: announcements + auto-generated personal notifs (pickup status changes, redemptions)
- **Feedback**: category + 5-star rating + message
- **Help center**: 8-question FAQ accordion, phone + email support links
- **Profile**: edit details, view type badge, logout

---

## 4. Collector portal (`/collector`)

Sky/indigo-themed driver app, separate from the user shell.

- **Dashboard**: Active Jobs / Done Today / kg Today stats
- **New Requests** feed — unassigned pickups with an Accept button (assigns collector + vehicle)
- **My Route** — accepted jobs list
- **Job flow** per pickup:
  1. Map with depot → customer route, customer card (address, instructions, tap-to-call)
  2. **Navigate** (opens Google Maps) + **Start Trip** → status *On the way*
  3. **I've Arrived** → status *Arrived* (user's QR appears on their phone)
  4. **Animated QR scanner** (laser-line effect) verifies the pickup
  5. Weight entry with live points preview
  6. Complete → Collected → Processing → **Completed**; points + transaction credited to the customer automatically

---

## 5. Admin panel (`/admin`)

Slate-themed city operations console with 4 tabs:

- **Overview**: stat cards (registered users, active collectors, total kg collected, points issued), 6-month collection trend chart, waste-by-type breakdown bars, live operations status chips (count per pickup status)
- **Pickups**: full table (customer, waste types, date, weight, collector, status) with status filter pills
- **Users**: searchable directory of customers + collectors with waste contributed and point balances
- **Rewards**: redemption analytics — total redemptions, points spent, per-reward redemption counts across the catalog

---

## 6. Points & rewards economy

| Rule | Value |
|---|---|
| Earning rate | **14 points per kg** of verified biodegradable waste |
| Welcome bonus | +50 points at signup |
| Challenge bonuses | +80 to +150 points |
| Redemption range | 100–300 points per reward |
| Coupon format | `ECO-XXXX-XXXX` |

Environmental conversion factors: **1.9 kg CO₂ prevented / kg** composted vs landfilled, **0.3 kg compost yield / kg**, **21 kg CO₂ = 1 tree-year**.

---

## 7. Pickup lifecycle

```
requested → accepted → on_the_way → arrived → collected → processing → completed
                                                                (cancelled possible pre-collection)
```

Each transition is visible in real time to the user (tracking page) and drives notifications. Points are only credited at `completed`, based on the **actual weighed amount**, not the estimate.

---

## 8. Data model (Supabase / localStorage)

| Table / key | Contents |
|---|---|
| `profiles` / `eco_users` | id, name, email, phone, user_type, address, lat/lng, eco_points |
| `pickups` / `eco_pickups` | user_id, waste_types[], est/actual weight, photo, date, slot, status, collector_name, vehicle, instructions, points_awarded |
| `transactions` / `eco_transactions` | user_id, type (earn/redeem), points, title, subtitle, coupon_code, created_at |
| `feedback` / `eco_feedback` | user_id, category, rating, message |

Supabase tables have **row-level security** (users only see their own data) and a trigger that auto-creates a profile on signup. Schema in `supabase/schema.sql` (idempotent).

---

## 9. Demo mode

Three one-click personas on the login page (all localStorage, no backend):

| Persona | Account | Seeded data |
|---|---|---|
| 🎭 User | Siri Reddy, Hyderabad, 450 pts | 4 pickups (2 done, 1 scheduled, 1 neighbour request), 6 wallet transactions incl. a redeemed coupon |
| 🚛 Collector | Ravi Kumar, vehicle TS 09 EV 4521 | Assigned route + a pending request to accept |
| 🛡️ Admin | City Admin | 7 users (restaurant, hotel, temple, flower shop, households), 2 collectors, 12 pickups across 6 months |

An amber banner indicates demo mode; logout exits it cleanly.

---

## 10. Design & UX principles

- **Fully responsive**: desktop sidebar navigation ⇄ mobile bottom-nav; every page adapts from phone to widescreen
- Eco-green identity (`--color-eco-50…900`), portal-specific themes (green = user, sky = collector, slate = admin)
- Gradient hero headers, rounded-3xl cards, emoji-forward iconography
- Micro-animations: splash pop, driver movement, QR scan laser, progress bars
- Code-split bundles: map/QR-heavy pages lazy-load; Leaflet ships as its own chunk

---

## 11. Project structure

```
├── index.html
├── vercel.json / public/_redirects   # SPA fallbacks for deploy
├── supabase/schema.sql               # tables + RLS + trigger (idempotent)
└── src/
    ├── main.jsx / App.jsx            # router, lazy routes, scroll restore
    ├── styles.css                    # Tailwind v4 theme + animations
    ├── context/AuthContext.jsx       # auth + profile state
    ├── lib/
    │   ├── supabase.js               # client + isSupabaseConfigured
    │   ├── db.js                     # ALL data access (dual-backend)
    │   ├── demo.js                   # demo seeding (user/collector/admin)
    │   ├── constants.js              # user types, waste types, statuses, rewards
    │   ├── impact.js                 # impact math + badges
    │   └── ai.js                     # mock AI waste verification
    ├── components/                   # AppShell, AuthLayout, Logo, PickupMap
    └── pages/                        # user pages + collector/ + admin/
```

---

## 12. Roadmap ideas (beyond MVP)

- Real AI waste classification (vision model)
- Real-time collector GPS via Supabase Realtime
- Payment-gateway reward fulfilment
- Route optimization for collectors
- Municipal reporting exports (CSV/PDF)
- Push notifications (PWA)
- Multi-language support
