export const USER_TYPES = [
  { id: 'household', label: 'Household', emoji: '🏠' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍴' },
  { id: 'hotel', label: 'Hotel', emoji: '🏨' },
  { id: 'temple', label: 'Temple', emoji: '⛪' },
  { id: 'event_hall', label: 'Event Hall', emoji: '🎉' },
  { id: 'flower_shop', label: 'Flower Shop', emoji: '🌸' },
]

export const WASTE_TYPES = [
  { id: 'food', label: 'Food Waste', emoji: '🍛' },
  { id: 'flower', label: 'Flower Waste', emoji: '🌸' },
  { id: 'vegetable', label: 'Vegetable Waste', emoji: '🥬' },
  { id: 'fruit', label: 'Fruit Waste', emoji: '🍎' },
  { id: 'garden', label: 'Garden Waste', emoji: '🌿' },
]

export const PICKUP_STATUSES = {
  requested: { label: 'Requested', color: 'bg-gray-100 text-gray-700' },
  accepted: { label: 'Collector Accepted', color: 'bg-sky-100 text-sky-700' },
  on_the_way: { label: 'On the Way', color: 'bg-amber-100 text-amber-700' },
  arrived: { label: 'Collector Arrived', color: 'bg-violet-100 text-violet-700' },
  collected: { label: 'Waste Collected', color: 'bg-eco-100 text-eco-700' },
  processing: { label: 'Processing Center', color: 'bg-teal-100 text-teal-700' },
  completed: { label: 'Completed', color: 'bg-eco-100 text-eco-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
}

// Rewards store catalog (Stage 5)
export const REWARDS = [
  { id: 'compost-2kg', emoji: '🌱', title: '2 kg Organic Compost', partner: 'EcoReward Compost Hub', cost: 150, tag: 'Popular' },
  { id: 'sapling', emoji: '🌳', title: 'Free Plant Sapling', partner: 'City Nursery', cost: 100, tag: 'Popular' },
  { id: 'grocery-100', emoji: '🛒', title: '₹100 Grocery Coupon', partner: 'FreshMart', cost: 200 },
  { id: 'recharge-50', emoji: '📱', title: '₹50 Mobile Recharge', partner: 'Any operator', cost: 120 },
  { id: 'movie-ticket', emoji: '🎬', title: '₹150 Off Movie Ticket', partner: 'CineMax', cost: 250 },
  { id: 'restaurant-15', emoji: '🍽️', title: '15% Off Dining', partner: 'GreenLeaf Restaurants', cost: 180 },
  { id: 'tree-donation', emoji: '🌍', title: 'Plant a Tree in Your Name', partner: 'Green Earth NGO', cost: 300, tag: 'Impact' },
  { id: 'bus-pass', emoji: '🚌', title: '1-Day Metro/Bus Pass', partner: 'City Transport', cost: 220 },
]
