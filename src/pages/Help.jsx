import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, MessageSquarePlus, Phone, Mail } from 'lucide-react'

const FAQS = [
  {
    q: 'How do I earn eco points?',
    a: 'Schedule a pickup, upload a photo of your segregated organic waste, and hand it to the collector. Once the pickup is completed and weighed, you earn 14 points per kg. Bonus points come from challenges and referrals.',
  },
  {
    q: 'What waste can I give?',
    a: 'Only organic waste: food scraps, flowers, vegetables, fruits, and garden waste. Plastic, glass, metal, or e-waste will be rejected by the AI photo check and by the collector.',
  },
  {
    q: 'How does the AI photo verification work?',
    a: 'When you upload a waste photo, our AI checks that the waste is organic and properly segregated. If plastics or mixed waste are detected, you\u2019ll be asked to re-segregate and upload a new photo.',
  },
  {
    q: 'What is the QR code for?',
    a: 'When the collector arrives, show the QR code on your tracking screen. Scanning it proves the pickup really happened \u2014 it prevents fake collections and secures your points.',
  },
  {
    q: 'How do I redeem my points?',
    a: 'Open the Rewards tab, choose a reward you can afford, and confirm. You\u2019ll instantly receive a coupon code to use at the partner outlet.',
  },
  {
    q: 'When are points credited?',
    a: 'Points are credited automatically as soon as your waste is weighed and the pickup is marked complete. You\u2019ll see the entry in your Wallet History.',
  },
  {
    q: 'What happens to my waste?',
    a: 'It goes to the nearest processing facility where it\u2019s converted into compost or biogas. Check the Your Impact page to see how much compost and CO\u2082 savings you\u2019ve generated!',
  },
  {
    q: 'Can I cancel a scheduled pickup?',
    a: 'Yes \u2014 contact support before the collector departs. Frequent last-minute cancellations may affect your eco score.',
  },
]

export default function Help() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)

  return (
    <div className="lg:mx-auto lg:max-w-3xl">
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-eco-600 to-eco-800 px-5 pb-8 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white/15 p-2 hover:bg-white/25" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold">💬 Help Center</h1>
          <p className="text-xs text-eco-100">FAQs and support</p>
        </div>
      </header>

      <div className="space-y-5 px-5 py-5 sm:px-8 lg:px-0">
        {/* FAQ accordion */}
        <section className="divide-y divide-gray-100 rounded-2xl bg-white shadow-sm">
          {FAQS.map((f, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-sm font-semibold text-gray-800">{f.q}</span>
                <ChevronDown
                  size={17}
                  className={`shrink-0 text-gray-400 transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <p className="px-4 pb-4 text-sm leading-relaxed text-gray-600">{f.a}</p>
              )}
            </div>
          ))}
        </section>

        {/* Contact + feedback */}
        <section className="space-y-3">
          <button
            onClick={() => navigate('/feedback')}
            className="flex w-full items-center gap-3 rounded-2xl bg-eco-600 p-4 text-left text-white shadow-sm hover:bg-eco-700"
          >
            <MessageSquarePlus size={22} />
            <span>
              <span className="block text-sm font-bold">Send Feedback</span>
              <span className="block text-xs text-eco-100">Rate our service or report an issue</span>
            </span>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <a href="tel:+911800425000"
              className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              <Phone size={16} className="text-eco-600" /> 1800-425-000
            </a>
            <a href="mailto:support@ecoreward.in"
              className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              <Mail size={16} className="text-eco-600" /> Email us
            </a>
          </div>
          <p className="pt-1 text-center text-[11px] text-gray-400">
            Support hours: 8 AM – 8 PM, all days · EcoReward v1.0
          </p>
        </section>
      </div>
    </div>
  )
}
