# 🌱 EcoReward — Turn Waste into worth

A waste pickup rewards platform that turns biodegradable waste into eco points. Households, restaurants, hotels, temples, and flower shops schedule doorstep pickups; collectors run routes with live tracking + QR verification; the city admin monitors everything from an operations panel.

Built with **React 19 + Vite + Tailwind CSS v4 + Supabase** (with a full offline demo mode — no backend needed to try it).

## ✨ Features

**User portal**
- Splash + auth (email, phone OTP, Google) for 6 user types
- Request pickup with photo upload + AI waste verification (mock)
- Swiggy-style live tracking: map, animated driver, ETA, status timeline
- QR code handshake when the collector arrives
- Eco wallet, rewards store, coupon redemption with codes
- Sustainability dashboard: kg diverted, CO₂ saved, compost yield, badges
- Leaderboard, monthly challenges, referral codes
- Nearby composting facilities on a map, notifications, feedback, help/FAQ

**Collector portal** (`/collector`)
- Job queue with new-request acceptance, route list
- Navigate → Start Trip → Arrive → QR scan → weigh → complete flow
- Points credited to the customer automatically

**Admin panel** (`/admin`)
- City-wide stats, 6-month collection trend, waste-type breakdown
- Live operations status, pickups table with filters
- User directory with search, rewards redemption analytics

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 — then just click a demo button on the login page:

| Button | Portal | What you'll see |
|---|---|---|
| 🎭 Try Demo Account | User | Siri Reddy, 450 pts, pickups + wallet history |
| 🚛 Collector Demo | Collector | Ravi Kumar's route with a pending request |
| 🛡️ Admin Demo | Admin | City-wide data: 7 users, 2 collectors, 6 months of pickups |

Demo mode runs entirely on localStorage — no account or backend required.

### Real backend (optional)

1. Create a [Supabase](https://supabase.com) project
2. Copy `.env.example` → `.env` and fill in your project URL + publishable key
3. Run `supabase/schema.sql` in the Supabase SQL editor (idempotent — safe to re-run)
4. `npm run dev` and sign up normally

## 🎬 Suggested demo script (~3 min)

1. **Login page** → 🎭 Try Demo Account
2. **Home** → tap **Request Pickup** → upload any photo → AI verifies it's biodegradable → pick waste types, weight, tomorrow 11:00 → submit
3. Open the new pickup → show the **live map + ETA**, use the amber **Collector Simulator** to advance: On the way → Arrived (**QR code appears**) → enter weight → watch it complete and **points drop into the wallet**
4. **Rewards** → redeem "₹100 Grocery Coupon" → show generated coupon code → Wallet History tab
5. **Impact** → CO₂ / compost stats, badges, 6-month chart; peek at **Leaderboard** + **Challenges**
6. Logout → 🚛 **Collector Demo** → Accept Arjun's request → Start Trip → Arrive → animated **QR scan** → weigh 6 kg → complete
7. Logout → 🛡️ **Admin Demo** → Overview charts → Pickups filters → Users search → Rewards analytics

## 🏗️ Tech notes

- **Dual backend**: every data function branches on Supabase-configured vs localStorage demo (`src/lib/db.js`)
- **Maps**: Leaflet + OpenStreetMap (free, no API key)
- **Charts**: pure CSS bars — no chart library
- **Code-split**: map/QR-heavy pages are lazy-loaded; Leaflet ships in its own chunk
- **Responsive**: desktop sidebar ↔ mobile bottom-nav via Tailwind breakpoints

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## 📦 Deploy

SPA fallbacks are already configured for both platforms:

- **Vercel**: `vercel.json` rewrite included — `npx vercel` and go
- **Netlify**: `public/_redirects` included — drag `dist/` into Netlify Drop or connect the repo

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on the platform if you want the real backend (demo mode works without them).

