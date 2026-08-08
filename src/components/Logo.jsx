import { Leaf } from 'lucide-react'

export default function Logo({ size = 64 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-eco-600 shadow-lg shadow-eco-600/40"
      style={{ width: size, height: size }}
    >
      <Leaf color="white" size={size * 0.55} strokeWidth={2.2} />
    </div>
  )
}
