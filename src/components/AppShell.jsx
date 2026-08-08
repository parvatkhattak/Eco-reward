import { NavLink, Outlet } from 'react-router-dom'
import { Home, Truck, Gift, User } from 'lucide-react'
import Logo from './Logo'
import { isDemoActive } from '../lib/supabase'
import { exitDemoMode } from '../lib/demo'

const tabs = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/pickups', label: 'Pickups', icon: Truck },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function AppShell() {
  return (
    <div className="flex h-full bg-eco-50">
      {/* Desktop sidebar (hidden on mobile) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-eco-100 bg-white lg:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <Logo size={40} />
          <div>
            <p className="font-bold leading-tight text-eco-900">EcoReward</p>
            <p className="text-[11px] text-eco-600">Turn Waste into Worth</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-eco-600 text-white shadow-md shadow-eco-600/25'
                    : 'text-gray-500 hover:bg-eco-50 hover:text-eco-700'
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="px-5 py-4 text-[11px] text-gray-400">© 2026 EcoReward</p>
      </aside>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {isDemoActive && (
          <div className="flex items-center justify-center gap-3 bg-amber-100 px-4 py-1.5 text-xs font-medium text-amber-800">
            🎭 Demo mode — data is stored locally in your browser
            <button onClick={exitDemoMode} className="font-bold underline">Exit</button>
          </div>
        )}
        <div className="mx-auto w-full max-w-5xl lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation (hidden on desktop) */}
      <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-eco-100 bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                  isActive ? 'text-eco-600' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={21} strokeWidth={isActive ? 2.4 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
