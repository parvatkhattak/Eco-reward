import Logo from './Logo'
import { Truck, Coins, Sprout } from 'lucide-react'

const highlights = [
  { icon: Truck, text: 'Doorstep pickup of food, flower & garden waste' },
  { icon: Coins, text: 'Earn eco points for every kilogram you recycle' },
  { icon: Sprout, text: 'Redeem compost, plants, seeds & eco products' },
]

// Split-screen auth layout: branding panel on desktop, form always on the right
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-full">
      {/* Branding panel — desktop only */}
      <aside className="hidden w-[45%] flex-col justify-between bg-gradient-to-br from-eco-600 to-eco-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <Logo size={48} />
          <div>
            <p className="text-xl font-bold leading-tight">EcoReward</p>
            <p className="text-xs text-eco-200">Turn Waste into Worth</p>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Your waste is
            <br />
            someone's <span className="text-eco-300">resource.</span>
          </h1>
          <p className="mt-4 max-w-md text-eco-100">
            Join thousands of households, restaurants, hotels and temples turning organic waste
            into rewards — and a greener city.
          </p>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-eco-100">
                <span className="rounded-xl bg-white/10 p-2.5">
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-eco-300">© 2026 EcoReward · Making cities compost-positive</p>
      </aside>

      {/* Form side */}
      <main className="flex flex-1 items-center justify-center overflow-y-auto bg-gradient-to-b from-eco-50 to-eco-100 px-4 py-10">
        {children}
      </main>
    </div>
  )
}
