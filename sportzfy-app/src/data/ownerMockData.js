// Mock data for the Turf Owner interface.
// In the future, these will come from a FastAPI backend.

export const OWNER_PROFILE = {
  name: 'Rafiq Ahmed',
  turfName: 'Chittagong Sports Arena',
  initials: 'RA',
};

// KPI tiles shown at the top of the Owner Dashboard.
export const OWNER_STATS = [
  {
    id: 'todays_bookings',
    label: "Today's Bookings",
    value: '6',
    icon: 'calendar-outline',
    tint: '#E8F4EC',
    iconColor: '#1B8A3A',
  },
  {
    id: 'todays_revenue',
    label: "Today's Revenue",
    value: '৳ 7,200',
    icon: 'cash-outline',
    tint: '#FFF7E6',
    iconColor: '#F59E0B',
  },
  {
    id: 'total_bookings',
    label: 'Total Bookings',
    value: '128',
    icon: 'receipt-outline',
    tint: '#EEF2FF',
    iconColor: '#4F46E5',
  },
  {
    id: 'active_turf',
    label: 'Active Turf',
    value: '1',
    icon: 'football-outline',
    tint: '#FCE6F4',
    iconColor: '#DB2777',
  },
];

// Bookings the owner needs to act on / see today.
// Status: 'upcoming' | 'completed' | 'cancelled'
export const OWNER_UPCOMING_BOOKINGS = [
  {
    id: 'SPZ-1024',
    customerName: 'Tanvir Hasan',
    customerInitials: 'TH',
    turfName: 'Chittagong Sports Arena',
    date: 'Today',
    time: '6:00 PM – 7:00 PM',
    price: 1200,
    paymentMethod: 'bKash',
    status: 'upcoming',
  },
  {
    id: 'SPZ-1025',
    customerName: 'Sadia Rahman',
    customerInitials: 'SR',
    turfName: 'Chittagong Sports Arena',
    date: 'Today',
    time: '7:00 PM – 8:00 PM',
    price: 1200,
    paymentMethod: 'Nagad',
    status: 'upcoming',
  },
  {
    id: 'SPZ-1026',
    customerName: 'Imran Chowdhury',
    customerInitials: 'IC',
    turfName: 'Chittagong Sports Arena',
    date: 'Tomorrow',
    time: '8:00 PM – 9:00 PM',
    price: 1200,
    paymentMethod: 'Cash',
    status: 'upcoming',
  },
];

// Card shown on the dashboard summarising the owner's turf.
export const OWNER_TURF_CARD = {
  name: 'Chittagong Sports Arena',
  location: 'GEC, Chattogram',
  rating: 4.7,
  reviewCount: 128,
  pricePerHour: 1200,
  bookedSlots: 14,
  totalSlots: 18,
  image:
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
};

// AI insight banner — pure marketing / vibe, hard-coded copy.
export const OWNER_AI_INSIGHT = {
  title: 'Peak hours: 6PM – 9PM',
  body: 'Consider raising your Friday and Saturday rates by 15%. Demand is high and you have 3 unbooked slots tomorrow.',
  cta: 'View Pricing',
  icon: 'sparkles-outline',
};

// Editable copy for the "Edit Turf" modal.
export const OWNER_TURF_FORM = {
  name: 'Chittagong Sports Arena',
  location: 'GEC, Chattogram',
  description:
    'A premium 7-a-side turf in the heart of GEC. Well-maintained grass, bright floodlights and easy parking make it a favorite for evening matches.',
  facilities: ['Floodlights', 'Changing Room', 'Parking', 'Washroom'],
};

// Hourly slots the owner can toggle on/off. Start/end are 24h strings (HH:mm).
// status: 'available' | 'booked'
export const OWNER_SLOTS = [
  { id: 's1', startTime: '16:00', endTime: '17:00', status: 'available' },
  { id: 's2', startTime: '17:00', endTime: '18:00', status: 'booked' },
  { id: 's3', startTime: '18:00', endTime: '19:00', status: 'booked' },
  { id: 's4', startTime: '19:00', endTime: '20:00', status: 'available' },
  { id: 's5', startTime: '20:00', endTime: '21:00', status: 'available' },
  { id: 's6', startTime: '21:00', endTime: '22:00', status: 'available' },
  { id: 's7', startTime: '22:00', endTime: '23:00', status: 'available' },
  { id: 's8', startTime: '23:00', endTime: '00:00', status: 'available' },
];

// Pricing tiers the owner can pick from in the "Edit Pricing" modal.
export const PRICING_TIERS = [
  { id: 'weekday', label: 'Weekday', price: 1200, hint: 'Mon – Thu' },
  { id: 'weekend', label: 'Weekend', price: 1500, hint: 'Fri – Sun' },
  { id: 'peak', label: 'Peak hours', price: 1800, hint: '6 PM – 10 PM' },
];

// Tabs on the Bookings & Earnings screen.
export const BOOKINGS_TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

// One row per booking across all three statuses. Reuses the booking shape
// from OWNER_UPCOMING_BOOKINGS plus extras for completed/cancelled states.
export const OWNER_ALL_BOOKINGS = {
  upcoming: [
    {
      id: 'SPZ-1024',
      customerName: 'Tanvir Hasan',
      customerInitials: 'TH',
      turfName: 'Chittagong Sports Arena',
      date: 'Today',
      time: '6:00 PM – 7:00 PM',
      price: 1200,
      paymentMethod: 'bKash',
      status: 'upcoming',
    },
    {
      id: 'SPZ-1025',
      customerName: 'Sadia Rahman',
      customerInitials: 'SR',
      turfName: 'Chittagong Sports Arena',
      date: 'Today',
      time: '7:00 PM – 8:00 PM',
      price: 1200,
      paymentMethod: 'Nagad',
      status: 'upcoming',
    },
    {
      id: 'SPZ-1026',
      customerName: 'Imran Chowdhury',
      customerInitials: 'IC',
      turfName: 'Chittagong Sports Arena',
      date: 'Tomorrow',
      time: '8:00 PM – 9:00 PM',
      price: 1500,
      paymentMethod: 'Cash',
      status: 'upcoming',
    },
  ],
  completed: [
    {
      id: 'SPZ-1023',
      customerName: 'Nusrat Jahan',
      customerInitials: 'NJ',
      turfName: 'Chittagong Sports Arena',
      date: '17 Aug 2026',
      time: '7:00 PM – 8:00 PM',
      price: 1500,
      paymentMethod: 'bKash',
      status: 'completed',
    },
    {
      id: 'SPZ-1018',
      customerName: 'Arif Mahmud',
      customerInitials: 'AM',
      turfName: 'Chittagong Sports Arena',
      date: '15 Aug 2026',
      time: '9:00 PM – 10:00 PM',
      price: 1800,
      paymentMethod: 'Card',
      status: 'completed',
    },
    {
      id: 'SPZ-1014',
      customerName: 'Sabbir Rahman',
      customerInitials: 'SR',
      turfName: 'Chittagong Sports Arena',
      date: '12 Aug 2026',
      time: '6:00 PM – 7:00 PM',
      price: 1200,
      paymentMethod: 'Nagad',
      status: 'completed',
    },
  ],
  cancelled: [
    {
      id: 'SPZ-1011',
      customerName: 'Mehedi Hassan',
      customerInitials: 'MH',
      turfName: 'Chittagong Sports Arena',
      date: '10 Aug 2026',
      time: '8:00 PM – 9:00 PM',
      price: 1200,
      paymentMethod: 'bKash',
      status: 'cancelled',
    },
  ],
};

// Revenue summary tiles (top of the Bookings & Earnings screen).
export const OWNER_REVENUE = {
  total: { label: 'Total Revenue', value: '৳ 48,200', icon: 'wallet-outline', tint: '#E8F4EC', iconColor: '#1B8A3A' },
  thisWeek: { label: 'This Week', value: '৳ 12,400', icon: 'trending-up-outline', tint: '#FFF7E6', iconColor: '#F59E0B' },
  avgPerBooking: { label: 'Avg / Booking', value: '৳ 1,310', icon: 'stats-chart-outline', tint: '#EEF2FF', iconColor: '#4F46E5' },
};

// 7-day revenue series for the mini bar chart (oldest → today).
export const OWNER_WEEKLY_REVENUE = [
  { day: 'Mon', value: 2400 },
  { day: 'Tue', value: 3600 },
  { day: 'Wed', value: 1200 },
  { day: 'Thu', value: 4800 },
  { day: 'Fri', value: 6000 },
  { day: 'Sat', value: 5400 },
  { day: 'Sun', value: 1200 },
];
