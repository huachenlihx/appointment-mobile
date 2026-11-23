/** Django session auth over HTTPS. Requires a custom Expo development build, not Expo Go. */
import CookieManager from '@preeternal/react-native-cookie-manager';
import type { Appointment, Day, Service, Slot, User } from './types';

const ORIGIN = (process.env.EXPO_PUBLIC_API_URL || 'https://api-appointment.founderdesign.com').replace(/\/+$/, '');
if (!ORIGIN.startsWith('https://')) throw new Error('The production API must use HTTPS.');
let csrf: string | null = null;
let generation = 0;
let activeAccount: string | null = null;

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}
function describe(payload: any, defaultText: string): string {
  if (typeof payload === 'string' && payload.length < 200) return payload;
  if (payload && typeof payload === 'object') {
    const message = payload.error ?? payload.detail ?? payload.message;
    if (typeof message === 'string') return message;
    const first = Object.values(payload)[0];
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
    if (typeof first === 'string') return first;
  }
  return defaultText;
}
export function lockAccount(id: string | null) { activeAccount = id; }
export function invalidateCsrf() { csrf = null; generation++; }
export async function clearSessionCookies() {
  invalidateCsrf(); activeAccount = null;
  await CookieManager.clearAll(true);
  await CookieManager.clearAll(false);
}
async function csrfValue(epoch: number, force = false): Promise<string> {
  if (epoch !== generation) throw new Error('Session changed; try again.');
  if (!csrf || force) {
    const response = await fetch(`${ORIGIN}/api/auth/csrf/`, { credentials: 'include', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new ApiError(`Could not initialize session security. (HTTP ${response.status})`, response.status);
    const result: { csrfToken: string } = await response.json();
    if (epoch !== generation) throw new Error('Session changed; try again.');
    csrf = result.csrfToken;
    // Native fetch and native cookie manager share the platform cookie store on Android.
    // On iOS, test session cookie behavior before enabling an iOS release.
  }
  return csrf!;
}
async function request<T>(path: string, method = 'GET', body?: unknown, retry = true): Promise<T> {
  const epoch = generation;
  const mutates = method !== 'GET';
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (mutates) {
    // Native Android requests may omit both Origin and Referer. Django's
    // HTTPS CSRF verification expects a matching Origin or valid Referer.
    headers['Origin'] = ORIGIN;
    headers['Content-Type'] = 'application/json';
    headers['X-CSRFToken'] = await csrfValue(epoch);
  }
  let response: Response;
  try {
    response = await fetch(`${ORIGIN}${path}`, { method, headers, credentials: 'include', body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError('Cannot reach the server. Check internet access. (Network error)', 0);
  }
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    if (response.status === 403 && retry && mutates && /csrf/i.test(JSON.stringify(payload))) {
      await csrfValue(epoch, true);
      return request<T>(path, method, body, false);
    }
    const message = describe(payload, 'Request failed. Please try again.');
    throw new ApiError(`${message} (HTTP ${response.status})`, response.status,
      payload && typeof payload === 'object' ? payload.code : undefined);
  }
  if (epoch !== generation) throw new Error('Session changed during request. Please retry.');
  return payload as T;
}
function query(params: Record<string, string | number | null | undefined>) {
  const q = Object.entries(params).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
  return q ? `?${q}` : '';
}
function expected(params: Record<string, string | number | null | undefined> = {}) { return query({ ...params, expected_account: activeAccount ?? '' }); }
export const api = {
  me: () => request<User>('/api/auth/me/'),
  login: async (email: string, password: string) => {
    const user = await request<User>('/api/auth/login/', 'POST', { email: email.trim().toLowerCase(), password });
    invalidateCsrf(); lockAccount(user.public_id); return user;
  },
  logout: async () => { try { await request('/api/auth/logout/', 'POST', {}); } finally { await clearSessionCookies(); } },
  register: (form: { first_name: string; last_name: string; email: string; password: string; confirm_password: string }) => request<{detail: string}>('/api/auth/register/', 'POST', form),
  resendActivation: (email: string) => request<{detail: string}>('/api/auth/activate/resend/', 'POST', { email }),
  resetRequest: (email: string) => request<{detail: string}>('/api/auth/password-reset/request/', 'POST', { email }),
  changePassword: (current_password: string, new_password: string, confirm_password: string) => request('/api/auth/change-password/', 'POST', { current_password, new_password, confirm_password }),
  services: () => request<Service[]>('/api/appointments/services/'),
  month: (service: string, year: number, month: number) => request<{days: Day[]}>('/api/appointments/availability/month/' + query({ service, year, month })),
  slots: (service: string, date: string) => request<{slots: Slot[]; closed_reason: string}>('/api/appointments/availability/slots/' + query({ service, date })),
  mine: (scope: 'upcoming' | 'past' | 'all' = 'upcoming') => request<Appointment[]>('/api/appointments/mine/' + expected({ scope })),
  book: (data: any) => request<Appointment>('/api/appointments/book/' + expected(), 'POST', data),
  cancel: (id: string, reason: string) => request<Appointment>(`/api/appointments/mine/${encodeURIComponent(id)}/cancel/` + expected(), 'POST', { reason }),
  reschedule: (id: string, data: any) => request<Appointment>(`/api/appointments/mine/${encodeURIComponent(id)}/reschedule/` + expected(), 'POST', data),
};
