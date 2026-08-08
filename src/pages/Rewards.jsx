import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Coins, Copy, Check, Gift, Wallet, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyTransactions, redeemReward } from '../lib/db'
import { REWARDS } from '../lib/constants'

const timeAgo = (iso) => {
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function Rewards() {
  const { user, profile, refreshProfile } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'wallet' ? 'wallet' : 'store'

  const [transactions, setTransactions] = useState([])
  const [selected, setSelected] = useState(null) // reward being redeemed
  const [redeemed, setRedeemed] = useState(null) // completed tx (shows coupon)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const balance = profile?.eco_points ?? 0

  useEffect(() => {
    if (user) getMyTransactions(user.id).then(setTransactions).catch(() => {})
  }, [user, redeemed])

  async function confirmRedeem() {
    setBusy(true)
    setError('')
    try {
      const tx = await redeemReward(user.id, balance, selected)
      await refreshProfile()
      setRedeemed({ ...tx, reward: selected })
      setSelected(null)
    } catch (e) {
      setError(e.message || 'Redemption failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {/* Header with balance */}
      <header className="rounded-b-3xl bg-gradient-to-br from-eco-600 to-eco-800 px-5 pb-6 pt-6 text-white sm:px-8 lg:mt-6 lg:rounded-3xl">
        <h1 className="text-xl font-bold">Rewards</h1>
        <p className="text-xs text-eco-100">Turn your eco points into real value</p>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/90 text-2xl">🪙</span>
          <div>
            <p className="text-xs text-eco-100">Eco Wallet Balance</p>
            <p className="text-2xl font-extrabold">{balance.toLocaleString()} <span className="text-sm font-semibold text-eco-100">points</span></p>
          </div>
        </div>
      </header>

      <div className="px-5 py-5 sm:px-8 lg:px-0">
        {/* Tabs */}
        <div className="mb-5 flex rounded-xl bg-gray-100 p-1">
          {[
            { id: 'store', label: 'Rewards Store', icon: Gift },
            { id: 'wallet', label: 'Wallet History', icon: Wallet },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setParams(id === 'wallet' ? { tab: 'wallet' } : {})}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition ${
                tab === id ? 'bg-white text-eco-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {tab === 'store' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {REWARDS.map((r) => {
              const affordable = balance >= r.cost
              return (
                <div key={r.id} className="relative flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  {r.tag && (
                    <span className="absolute right-3 top-3 rounded-full bg-eco-100 px-2 py-0.5 text-[10px] font-bold uppercase text-eco-700">
                      {r.tag}
                    </span>
                  )}
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-eco-50 text-3xl">{r.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">{r.title}</p>
                    <p className="truncate text-xs text-gray-500">{r.partner}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-sm font-bold text-eco-700">
                        <Coins size={14} className="text-yellow-500" /> {r.cost}
                      </span>
                      <button
                        disabled={!affordable}
                        onClick={() => setSelected(r)}
                        className="rounded-lg bg-eco-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-eco-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                      >
                        {affordable ? 'Redeem' : 'Need more'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2.5">
            {transactions.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-400">No transactions yet — schedule a pickup to start earning!</p>
            )}
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                    t.points > 0 ? 'bg-eco-100' : 'bg-red-50'
                  }`}
                >
                  {t.points > 0 ? '🌿' : '🎁'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{t.title}</p>
                  <p className="truncate text-xs text-gray-500">
                    {t.subtitle ? `${t.subtitle} · ` : ''}{timeAgo(t.created_at)}
                  </p>
                  {t.coupon_code && <p className="text-xs font-mono text-eco-600">{t.coupon_code}</p>}
                </div>
                <span className={`text-sm font-bold ${t.points > 0 ? 'text-eco-600' : 'text-red-500'}`}>
                  {t.points > 0 ? '+' : ''}{t.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm redeem modal */}
      {selected && (
        <Modal onClose={() => !busy && setSelected(null)}>
          <div className="text-center">
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-eco-50 text-4xl">{selected.emoji}</span>
            <h2 className="text-lg font-bold text-gray-800">{selected.title}</h2>
            <p className="text-xs text-gray-500">{selected.partner}</p>
            <p className="mt-3 text-sm text-gray-600">
              Redeem for <b className="text-eco-700">{selected.cost} points</b>?
              <br />
              <span className="text-xs text-gray-400">Balance after: {balance - selected.cost} points</span>
            </p>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setSelected(null)}
                disabled={busy}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRedeem}
                disabled={busy}
                className="flex-1 rounded-xl bg-eco-600 py-3 text-sm font-bold text-white hover:bg-eco-700 disabled:opacity-60"
              >
                {busy ? 'Redeeming…' : 'Confirm'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success + coupon modal */}
      {redeemed && (
        <Modal onClose={() => setRedeemed(null)}>
          <SuccessCoupon tx={redeemed} onClose={() => setRedeemed(null)} />
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function SuccessCoupon({ tx, onClose }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText(tx.coupon_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="text-center">
      <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-eco-100">
        <Sparkles className="text-eco-600" size={30} />
      </span>
      <h2 className="text-lg font-bold text-gray-800">Redeemed! 🎉</h2>
      <p className="mt-1 text-sm text-gray-600">{tx.reward.emoji} {tx.reward.title}</p>
      <p className="text-xs text-gray-400">{tx.reward.partner}</p>

      <div className="mx-auto mt-4 flex max-w-xs items-center justify-between gap-2 rounded-xl border-2 border-dashed border-eco-300 bg-eco-50 px-4 py-3">
        <span className="font-mono text-base font-bold tracking-wide text-eco-800">{tx.coupon_code}</span>
        <button onClick={copy} className="rounded-lg p-1.5 text-eco-600 hover:bg-eco-100" aria-label="Copy code">
          {copied ? <Check size={17} /> : <Copy size={17} />}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-gray-400">Show this code at the partner outlet to claim.</p>

      <button onClick={onClose} className="mt-5 w-full rounded-xl bg-eco-600 py-3 text-sm font-bold text-white hover:bg-eco-700">
        Done
      </button>
    </div>
  )
}
