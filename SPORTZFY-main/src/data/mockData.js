// Mock data for Sportzfy.
// In the future, these will come from a FastAPI backend.
// For now, this file exposes static arrays and helper getters.

const DEFAULT_SLOT_TIMES = [
  { startTime: '5:00 PM', endTime: '6:00 PM' },
  { startTime: '6:00 PM', endTime: '7:00 PM' },
  { startTime: '7:00 PM', endTime: '8:00 PM' },
  { startTime: '8:00 PM', endTime: '9:00 PM' },
  { id: 's5', startTime: '9:00 PM', endTime: '10:00 PM' },
];

// Build a slot list with mixed available/booked status.
// 'bookedIndexes' lets us vary which slots are booked per turf.
function buildSlots(bookedIndexes = []) {
  return DEFAULT_SLOT_TIMES.map((slot, index) => ({
    id: `s${index + 1}`,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: bookedIndexes.includes(index) ? 'booked' : 'available',
  }));
}

export const TURFS = [
  {
    id: '1',
    name: 'Chittagong Sports Arena',
    location: 'GEC, Chattogram',
    image:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    rating: 4.7,
    reviewCount: 128,
    sport: 'Football',
    pricePerHour: 1200,
    facilities: ['Floodlights', 'Changing Room', 'Parking', 'Washroom'],
    description:
      'A premium 7-a-side turf in the heart of GEC. Well-maintained grass, bright floodlights and easy parking make it a favorite for evening matches.',
    availableSlots: buildSlots([1]), // 6:00 PM booked
    isPopular: true,
    isNearby: true,
    isRecommended: true,
  },
  {
    id: '2',
    name: 'GEC Football Turf',
    location: 'GEC, Chattogram',
    image:
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80',
    rating: 4.4,
    reviewCount: 96,
    sport: 'Football',
    pricePerHour: 1000,
    facilities: ['Floodlights', 'Changing Room', 'Washroom'],
    description:
      'Affordable 5-a-side turf in GEC. Great for quick practice sessions and small-sided games.',
    availableSlots: buildSlots([0, 3]),
    isPopular: true,
    isNearby: true,
    isRecommended: false,
  },
  {
    id: '3',
    name: 'Khulshi Sports Zone',
    location: 'Khulshi, Chattogram',
    image:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    rating: 4.8,
    reviewCount: 210,
    sport: 'Football',
    pricePerHour: 1500,
    facilities: ['Floodlights', 'Changing Room', 'Parking', 'Washroom', 'Cafe'],
    description:
      'Top-rated 7-a-side turf in Khulshi. Professional-grade surface, on-site cafe, and large parking area.',
    availableSlots: buildSlots([2]),
    isPopular: true,
    isNearby: false,
    isRecommended: true,
  },
  {
    id: '4',
    name: 'Agrabad Football Arena',
    location: 'Agrabad, Chattogram',
    image:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
    rating: 4.5,
    reviewCount: 75,
    sport: 'Football',
    pricePerHour: 1300,
    facilities: ['Floodlights', 'Changing Room', 'Parking'],
    description:
      'Centrally located 5-a-side turf near Agrabad. Perfect for after-work matches with colleagues.',
    availableSlots: buildSlots([1, 2]),
    isPopular: false,
    isNearby: false,
    isRecommended: true,
  },
  {
    id: '5',
    name: 'Panchlaish Turf Park',
    location: 'Panchlaish, Chattogram',
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    rating: 4.3,
    reviewCount: 54,
    sport: 'Football',
    pricePerHour: 1100,
    facilities: ['Floodlights', 'Washroom'],
    description:
      'A friendly neighborhood 5-a-side turf in Panchlaish. Ideal for casual games and weekend tournaments.',
    availableSlots: buildSlots([0]),
    isPopular: false,
    isNearby: true,
    isRecommended: false,
  },
  {
    id: '6',
    name: 'Bashundhara Sports Complex',
    location: 'Bashundhara, Dhaka',
    image:
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80',
    rating: 4.9,
    reviewCount: 312,
    sport: 'Football',
    pricePerHour: 1800,
    facilities: [
      'Floodlights',
      'Changing Room',
      'Parking',
      'Washroom',
      'Cafe',
      'Seating',
    ],
    description:
      'A flagship 7-a-side turf in Bashundhara with spectator seating, premium grass, and an on-site cafe.',
    availableSlots: buildSlots([3, 4]),
    isPopular: true,
    isNearby: false,
    isRecommended: true,
  },
];

// Pre-built lists used by Home screen.
export const POPULAR_TURFS = TURFS.filter((t) => t.isPopular);
export const NEARBY_TURFS = TURFS.filter((t) => t.isNearby);
export const RECOMMENDED_TURFS = TURFS.filter((t) => t.isRecommended);

// Helpers
export function getTurfById(id) {
  return TURFS.find((t) => t.id === id);
}

export function getAllLocations() {
  return Array.from(new Set(TURFS.map((t) => t.location)));
}

export function getAllSports() {
  return Array.from(new Set(TURFS.map((t) => t.sport)));
}

// Static price range for filter UI.
export const PRICE_RANGE = { min: 800, max: 2000 };

// Pre-seeded bookings shown in the Bookings tab for demo purposes.
export const SEED_BOOKINGS = [
  {
    id: 'SPZ-1023',
    turfId: '3',
    turfName: 'Khulshi Sports Zone',
    turfImage:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    date: '17 August 2026',
    time: '7:00 PM – 8:00 PM',
    price: 1500,
    status: 'completed',
    paymentMethod: 'bKash',
  },
  {
    id: 'SPZ-1024',
    turfId: '1',
    turfName: 'Chittagong Sports Arena',
    turfImage:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    date: '20 August 2026',
    time: '7:00 PM – 8:00 PM',
    price: 1200,
    status: 'upcoming',
    paymentMethod: 'bKash',
  },
];