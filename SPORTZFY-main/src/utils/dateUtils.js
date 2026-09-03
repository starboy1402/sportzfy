// Lightweight date helpers used by the Turf Details screen and
// Booking/Confirmation flow. Keeping them centralized so swapping
// for a real API later is easy.

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Format like "20 August 2026"
export function formatLongDate(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// Format like "20 Aug"
export function formatShortDate(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

// Format like "Thu, 20 Aug"
export function formatDayWithDate(date) {
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

// Build a list of N upcoming dates starting from today.
export function getUpcomingDates(count = 4) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const list = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    list.push(d);
  }
  return list;
}