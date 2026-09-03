// AuthContext — holds the signed-in user and exposes login / register / logout.
//
// Shape:
//   user:  null (guest) | { id, name, phone, email, role }
//   role:  derived from user.role  ('customer' | 'owner' | 'admin')
//
// Both `login` and `register` are mocked — they return a fake user after a
// short delay so the UI can show a loading state. Replace with real API
// calls later.
//
// Logout clears the user; RootNavigator then bounces back to AuthStack.

import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}

// Fake user factory — phone or email + any password "succeeds".
function mockUserFor({ email, phone, name, role }) {
  const id = `u_${Date.now().toString(36)}`;
  return {
    id,
    name: name || deriveName(email, phone),
    phone: phone || '',
    email: email || '',
    role,
  };
}

function deriveName(email, phone) {
  if (email && email.includes('@')) {
    return email.split('@')[0];
  }
  if (phone) return `User ${phone.slice(-4)}`;
  return 'Sportzfy User';
}

export function AuthProvider({ children }) {
  // null = guest (shows AuthStack). Object = signed in (shows role stack).
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Promise-based so screens can await + show spinners.
  async function login({ email, phone, password, role }) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const next = mockUserFor({ email, phone, role: role || 'customer' });
    setUser(next);
    setLoading(false);
    return next;
  }

  async function register({ name, phone, email, password, role }) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const next = mockUserFor({ name, phone, email, role });
    setUser(next);
    setLoading(false);
    return next;
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      role: user ? user.role : 'guest',
      isAuthed: !!user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
