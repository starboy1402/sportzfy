// Lightweight global state for the booking flow + bookings list.
// Today it holds only what the UI needs; tomorrow it can wrap real API calls.

import React, { createContext, useContext, useMemo, useState } from 'react';
import { SEED_BOOKINGS } from '../data/mockData';

const BookingContext = createContext(null);

// Hook helper — `useBooking()` must be used inside <BookingProvider>.
export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBooking must be used inside a BookingProvider');
  }
  return ctx;
}

export function BookingProvider({ children }) {
  // All bookings the user has made (seeded with 2 demo entries).
  const [bookings, setBookings] = useState(SEED_BOOKINGS);

  // Currently selected user location (used by Home & Explore headers).
  const [userLocation, setUserLocation] = useState('GEC, Chattogram');

  // Adds a confirmed booking to the top of the list.
  function addBooking(booking) {
    setBookings((prev) => [booking, ...prev]);
  }

  const value = useMemo(
    () => ({
      bookings,
      addBooking,
      userLocation,
      setUserLocation,
    }),
    [bookings, userLocation]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}