import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/login', { replace: true }), 2500)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-eco-600 to-eco-800">
      <div className="animate-splash-pop">
        <Logo size={110} />
      </div>
      <h1 className="animate-fade-up mt-6 text-4xl font-bold tracking-tight text-white" style={{ animationDelay: '0.4s' }}>
        EcoReward
      </h1>
      <p className="animate-fade-up mt-2 text-lg text-eco-100" style={{ animationDelay: '0.7s' }}>
        "Turn Waste into Worth"
      </p>
      <div className="animate-fade-up mt-10 flex gap-1.5" style={{ animationDelay: '1s' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-white/70"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
