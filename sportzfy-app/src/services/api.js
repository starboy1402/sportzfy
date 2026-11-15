import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const TOKEN_STORAGE_KEY = '@sportzfy_session_token';
const USER_STORAGE_KEY = '@sportzfy_session_user';

let inMemoryToken = null;

export const api = {
  // Token management
  async getToken() {
    if (inMemoryToken) return inMemoryToken;
    try {
      inMemoryToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      return inMemoryToken;
    } catch {
      return null;
    }
  },

  async setToken(token) {
    inMemoryToken = token;
    try {
      if (token) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save session token:', e);
    }
  },

  async getSavedUser() {
    try {
      const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async setSavedUser(user) {
    try {
      if (user) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save session user:', e);
    }
  },

  // Base HTTP requester
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.status !== 405) {
        console.warn(`API [${endpoint}]:`, err.message);
      }
      throw err;
    }
  },

  // 1. Auth Endpoints
  async login({ email, password, role }) {
    const roleParam = role === 'owner' ? 'OWNER' : role === 'admin' ? 'ADMIN' : undefined;
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        requestedRole: roleParam,
      }),
    });

    const user = res?.data?.user;
    const token = res?.data?.token;

    if (token) {
      await this.setToken(token);
    }
    if (user) {
      await this.setSavedUser(user);
    }

    return { user, token };
  },

  async register({ name, email, password, phone, role }) {
    const assignedRole = role === 'owner' ? 'OWNER' : 'CUSTOMER';
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        role: assignedRole,
      }),
    });

    const user = res?.data?.user;
    const token = res?.data?.token;

    if (token) {
      await this.setToken(token);
    }
    if (user) {
      await this.setSavedUser(user);
    }

    return { user, token };
  },

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      await this.setToken(null);
      await this.setSavedUser(null);
    }
  },

  async getMe() {
    const res = await this.request('/auth/me');
    return res?.data?.user;
  },

  // 2. Turfs & Shelves
  async getTurfs(params = {}) {
    const query = new URLSearchParams();
    if (params.city && params.city !== 'All') query.set('city', params.city);
    if (params.area && params.area !== 'All') query.set('area', params.area);
    if (params.format && params.format !== 'All') query.set('format', params.format);
    if (params.q) query.set('q', params.q);
    if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));

    const qs = query.toString();
    const endpoint = `/turfs${qs ? `?${qs}` : ''}`;
    const res = await this.request(endpoint);
    return res?.data || [];
  },

  async getTurfShelves(lat, lng) {
    let endpoint = '/turfs/shelves';
    if (lat && lng) {
      endpoint += `?lat=${lat}&lng=${lng}`;
    }
    const res = await this.request(endpoint);
    return res?.shelves || res?.data || [];
  },

  async getTurfById(turfId) {
    const res = await this.request(`/turfs/${turfId}`);
    return res?.data || null;
  },

  async getTurfAvailability(turfId, dateStr) {
    const res = await this.request(`/turfs/${turfId}/availability?date=${dateStr}`);
    return res?.data || null;
  },

  // 3. Holds & Bookings
  async createHold({ turfId, startTime, endTime }) {
    const res = await this.request('/holds', {
      method: 'POST',
      body: JSON.stringify({ turfId, startTime, endTime }),
    });
    return res?.data?.hold;
  },

  async releaseHold(holdId) {
    return await this.request(`/holds/${holdId}`, { method: 'DELETE' });
  },

  async confirmBooking({ holdId, paymentMethod }) {
    const sanitizedMethod = (paymentMethod || 'BKASH').toUpperCase();
    const res = await this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        holdId,
        paymentMethod: sanitizedMethod,
      }),
    });
    return res?.data?.booking || res?.data;
  },

  async getMyBookings() {
    const res = await this.request('/bookings');
    return res?.data || [];
  },

  // 4. Matches & Squad Recruitment
  async getMatches(params = {}) {
    const query = new URLSearchParams();
    if (params.role && params.role !== 'All') query.set('role', params.role);
    if (params.format && params.format !== 'All') query.set('format', params.format);
    if (params.area && params.area !== 'All') query.set('area', params.area);

    const qs = query.toString();
    const endpoint = `/matches${qs ? `?${qs}` : ''}`;
    const res = await this.request(endpoint);
    return res?.data || [];
  },

  async getMyMatches() {
    const res = await this.request('/matches/my');
    return res?.data || { hosting: [], joined: [] };
  },

  async getMatchById(matchId) {
    const res = await this.request(`/matches/${matchId}`);
    return res?.data || null;
  },

  async createMatch(data) {
    const res = await this.request('/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  async joinMatch(matchId, preferredRole = 'Any') {
    const res = await this.request(`/matches/${matchId}/join`, {
      method: 'POST',
      body: JSON.stringify({ preferredRole }),
    });
    return res?.data;
  },

  async decideJoinRequest(matchId, requestId, decision) {
    const res = await this.request(`/matches/${matchId}/requests/${requestId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    });
    return res?.data;
  },

  // 5. AI Concierge
  async sendAiChat(message, history = []) {
    const formattedMessages = [
      ...history.map((h) => ({
        role: h.role === 'bot' || h.role === 'assistant' ? 'assistant' : 'user',
        content: h.text || h.content || '',
      })),
      { role: 'user', content: message },
    ];
    const res = await this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: formattedMessages }),
    });
    return res;
  },

  // 6. Turf Owner Tools
  async createOwnerTurf(turfData) {
    const res = await this.request('/owner/turfs', {
      method: 'POST',
      body: JSON.stringify(turfData),
    });
    return res?.data;
  },

  async blockInterval({ turfId, startTime, endTime, reason }) {
    const res = await this.request('/owner/blocked-intervals', {
      method: 'POST',
      body: JSON.stringify({ turfId, startTime, endTime, reason }),
    });
    return res?.data;
  },

  async checkInBooking(referenceCode) {
    const res = await this.request('/owner/checkin', {
      method: 'POST',
      body: JSON.stringify({ referenceCode }),
    });
    return res?.data;
  },

  async getOwnerStats() {
    const res = await this.request('/owner/stats');
    return res?.data;
  },
};

// Helper: Maps backend Turf model to Mobile UI Turf shape
export function formatTurfForMobile(t) {
  if (!t) return null;
  const facilities = [];
  if (t.hasFloodlights) facilities.push('Floodlights');
  if (t.hasWashroom) facilities.push('Washroom');
  if (t.hasChangingRoom) facilities.push('Changing Room');
  if (t.hasParking) facilities.push('Parking');
  if (t.hasWater) facilities.push('Drinking Water');

  return {
    id: t.id,
    name: t.name,
    location: `${t.area}, ${t.city}`,
    area: t.area,
    city: t.city,
    image: t.coverImage || (t.images && t.images[0]?.url) || 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    images: t.images?.map((img) => img.url) || [],
    rating: t.rating || 4.8,
    reviewCount: t.reviewCount || 12,
    sport: 'Football',
    formats: t.pitchFormats || '5v5, 7v7',
    pricePerHour: t.basePricePerHour || 1200,
    facilities,
    description: t.description || 'Verified football pitch on Sportzfy.',
  };
}
