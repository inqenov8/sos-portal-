/**
 * SOS Portal — API Client
 * Handles all communication between the frontend and the backend server.
 */

const BASE = '/api';

// Retrieve the stored auth token
function getToken() {
  return localStorage.getItem('sos_token');
}

// Store or clear the auth token
export function setToken(token) {
  if (token) localStorage.setItem('sos_token', token);
  else localStorage.removeItem('sos_token');
}

// Core fetch wrapper
async function request(path, method = 'GET', body = null, requiresAuth = true) {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

export const api = {
  // Authentication
  login:         (email, password)              => request('/auth/login',          'POST', { email, password },                  false),
  signup:        (email, password, name, dept, role) => request('/auth/signup',    'POST', { email, password, name, dept, role }, false),
  forgotPassword:(email)                        => request('/auth/forgot-password', 'POST', { email },                            false),
  resetPassword: (email, token, newPassword)    => request('/auth/reset-password', 'POST', { email, token, newPassword },         false),

  // Portal data
  getData:       ()                             => request('/data'),
  
  // Missions
  submitMission: (payload)                      => request('/missions',             'POST', payload),
  approveMission:(id)                           => request(`/missions/${id}/approve`,'PATCH'),
  rejectMission: (id, reason)                  => request(`/missions/${id}/reject`, 'PATCH', { reason }),

  // Marketplace
  redeem:        (itemId, ipCost)              => request('/redemptions',           'POST', { itemId, ipCost }),

  // Announcements
  addAnnouncement:(title, body)                => request('/announcements',         'POST', { title, body }),

  // Admin
  testEmail:     (email)                        => request('/admin/test-email',     'POST', { email }),
  getStats:      ()                             => request('/admin/stats'),

  // Health check (no auth needed)
  health:        ()                             => request('/health',  'GET', null, false),
};
