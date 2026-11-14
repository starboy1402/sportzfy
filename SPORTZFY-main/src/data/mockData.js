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
    facilities: ['Floodlights', 'Parking'],
    description:
      'Accessible and budget-friendly turf in GEC. Great turf conditions with open grounds for casual five-a-side friendlies.',
    availableSlots: buildSlots([0, 2]),
    isPopular: false,
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
    reviewCount: 204,
    sport: 'Cricket',
    pricePerHour: 1500,
    facilities: [
      'Floodlights',
      'Changing Room',
      'Parking',
      'Washroom',
      'Equipment Rental',
    ],
    description:
      'Multi-sport facility in scenic Khulshi. High-grade artificial turf suited for box cricket tournaments and football shootouts.',
    availableSlots: buildSlots([]),
    isPopular: true,
    isNearby: true,
    isRecommended: true,
  },
  {
    id: '4',
    name: 'Agrabad Arena',
    location: 'Agrabad, Chattogram',
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    rating: 4.2,
    reviewCount: 71,
    sport: 'Football',
    pricePerHour: 900,
    facilities: ['Floodlights', 'Washroom'],
    description:
      'Located in the commercial hub of Agrabad. Perfect for post-work corporate games and weekend neighborhood tournaments.',
    availableSlots: buildSlots([1, 3]),
    isPopular: false,
    isNearby: false,
    isRecommended: false,
  },
  {
    id: '5',
    name: 'Halishahar Turf Club',
    location: 'Halishahar, Chattogram',
    image:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
    rating: 4.6,
    reviewCount: 142,
    sport: 'Football',
    pricePerHour: 1100,
    facilities: ['Floodlights', 'Changing Room', 'Parking'],
    description:
      'Spacious facility near the coast in Halishahar. Fresh sea breezes, floodlit evening slots, and great viewing gallery for friends.',
    availableSlots: buildSlots([0]),
    isPopular: true,
    isNearby: false,
    isRecommended: true,
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

// Pre-seeded bookings shared across Player Passes & Owner Check-in
export const SEED_BOOKINGS = [
  {
    id: 'SPZ-1024',
    referenceCode: 'SPZ-1024',
    turfId: '1',
    turfName: 'Chittagong Sports Arena',
    turfImage:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    date: 'Today',
    time: '6:00 PM – 7:00 PM',
    price: 1200,
    totalPrice: 1200,
    status: 'upcoming',
    paymentMethod: 'bKash',
    customerName: 'Tanvir Hasan',
    customerInitials: 'TH',
    phone: '+880 1812-345678',
  },
  {
    id: 'SPZ-1025',
    referenceCode: 'SPZ-1025',
    turfId: '1',
    turfName: 'Chittagong Sports Arena',
    turfImage:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    date: 'Today',
    time: '7:00 PM – 8:00 PM',
    price: 1200,
    totalPrice: 1200,
    status: 'upcoming',
    paymentMethod: 'Nagad',
    customerName: 'Sadia Rahman',
    customerInitials: 'SR',
    phone: '+880 1819-876543',
  },
  {
    id: 'SPZ-1026',
    referenceCode: 'SPZ-1026',
    turfId: '1',
    turfName: 'Chittagong Sports Arena',
    turfImage:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    date: 'Tomorrow',
    time: '8:00 PM – 9:00 PM',
    price: 1500,
    totalPrice: 1500,
    status: 'upcoming',
    paymentMethod: 'bKash',
    customerName: 'Imran Chowdhury',
    customerInitials: 'IC',
    phone: '+880 1817-112233',
  },
  {
    id: 'SPZ-1023',
    referenceCode: 'SPZ-1023',
    turfId: '3',
    turfName: 'Khulshi Sports Zone',
    turfImage:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    date: '17 August 2026',
    time: '7:00 PM – 8:00 PM',
    price: 1500,
    totalPrice: 1500,
    status: 'completed',
    paymentMethod: 'bKash',
    customerName: 'Nusrat Jahan',
    customerInitials: 'NJ',
    phone: '+880 1823-456789',
  },
  {
    id: 'SPZ-1018',
    referenceCode: 'SPZ-1018',
    turfId: '1',
    turfName: 'Chittagong Sports Arena',
    turfImage:
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80',
    date: '15 August 2026',
    time: '9:00 PM – 10:00 PM',
    price: 1800,
    totalPrice: 1800,
    status: 'completed',
    paymentMethod: 'Card',
    customerName: 'Arif Mahmud',
    customerInitials: 'AM',
    phone: '+880 1811-223344',
  },
  {
    id: 'SPZ-1011',
    referenceCode: 'SPZ-1011',
    turfId: '1',
    turfName: 'Chittagong Sports Arena',
    turfImage:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    date: '10 August 2026',
    time: '8:00 PM – 9:00 PM',
    price: 1200,
    totalPrice: 1200,
    status: 'cancelled',
    paymentMethod: 'bKash',
    customerName: 'Mehedi Hassan',
    customerInitials: 'MH',
    phone: '+880 1815-556677',
  },
];
