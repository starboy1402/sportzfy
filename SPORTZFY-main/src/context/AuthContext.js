import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    async function restoreSession() {
      try {
        const savedUser = await api.getSavedUser();
        const token = await api.getToken();

        if (savedUser && token) {
          // Normalize role to lowercase for local navigation stacks ('customer' | 'owner' | 'admin')
          const normalizedRole = (savedUser.role || 'customer').toLowerCase();
          setUser({ ...savedUser, role: normalizedRole });

          // Background verification with backend
          api.getMe()
            .then((freshUser) => {
              if (freshUser) {
                const freshRole = (freshUser.role || 'customer').toLowerCase();
                setUser({ ...freshUser, role: freshRole });
                api.setSavedUser(freshUser);
              }
            })
            .catch(() => {
              // If network is offline, keep cached user session
            });
        }
      } catch (e) {
        console.warn('Error restoring session:', e);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login({ email, phone, password, role }) {
    setLoading(true);
    try {
      const loginEmail = email || (phone && phone.includes('@') ? phone : `${phone || 'player'}@sportzfy.com`);
      const { user: remoteUser } = await api.login({
        email: loginEmail,
        password,
        role,
      });

      const normalizedRole = (remoteUser.role || role || 'customer').toLowerCase();
      const finalUser = { ...remoteUser, role: normalizedRole };
      setUser(finalUser);
      return finalUser;
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register({ name, phone, email, password, role }) {
    setLoading(true);
    try {
      const { user: remoteUser } = await api.register({
        name,
        email,
        phone,
        password,
        role,
      });

      const normalizedRole = (remoteUser.role || role || 'customer').toLowerCase();
      const finalUser = { ...remoteUser, role: normalizedRole };
      setUser(finalUser);
      return finalUser;
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
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
