// Impact math + badge definitions (Stage 6)

export const CO2_PER_KG = 1.9 // kg CO2e avoided per kg of organic waste diverted from landfill
export const COMPOST_YIELD = 0.3 // kg compost per kg waste
export const CO2_PER_TREE_YEAR = 21 // kg CO2 a tree absorbs per year

export function computeImpact(pickups, transactions = []) {
  const completed = pickups.filter((p) => p.status === 'completed')
  const totalKg = completed.reduce((s, p) => s + Number(p.final_weight_kg || 0), 0)

  const now = new Date()
  const thisMonth = completed.filter((p) => {
    const d = new Date(p.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthKg = thisMonth.reduce((s, p) => s + Number(p.final_weight_kg || 0), 0)

  // Last 6 months of kg for the chart
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const kg = completed
      .filter((p) => {
        const pd = new Date(p.created_at)
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
      })
      .reduce((s, p) => s + Number(p.final_weight_kg || 0), 0)
    months.push({ label: d.toLocaleDateString('en-IN', { month: 'short' }), kg })
  }

  return {
    totalKg,
    monthKg,
    completedCount: completed.length,
    monthCount: thisMonth.length,
    compostKg: totalKg * COMPOST_YIELD,
    co2Kg: totalKg * CO2_PER_KG,
    trees: totalKg * CO2_PER_KG / CO2_PER_TREE_YEAR,
    redemptions: transactions.filter((t) => t.type === 'redeem').length,
    months,
  }
}

export const BADGES = [
  { id: 'first', emoji: '🌱', title: 'First Steps', desc: 'Complete your first pickup', earned: (s) => s.completedCount >= 1 },
  { id: 'regular', emoji: '♻️', title: 'Eco Regular', desc: 'Complete 5 pickups', earned: (s) => s.completedCount >= 5 },
  { id: 'club25', emoji: '💪', title: '25 kg Club', desc: 'Divert 25 kg from landfill', earned: (s) => s.totalKg >= 25 },
  { id: 'king', emoji: '👑', title: 'Compost King', desc: 'Divert 100 kg from landfill', earned: (s) => s.totalKg >= 100 },
  { id: 'redeemer', emoji: '🎁', title: 'Smart Redeemer', desc: 'Redeem your first reward', earned: (s) => s.redemptions >= 1 },
  { id: 'warrior', emoji: '🛡️', title: 'Green Warrior', desc: 'Earn 500 eco points', earned: (s, points) => points >= 500 },
]
