import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError, clearSessionCookies, lockAccount } from './api';
import type { User } from './types';

type Session = { user: User | null; ready: boolean; signin: (email: string, password: string) => Promise<void>; signout: () => Promise<void>; refresh: () => Promise<void> };
const Context = createContext<Session | null>(null);
export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => {
    try { const u = await api.me(); lockAccount(u.public_id); setUser(u); }
    catch (e) { if (e instanceof ApiError && [401,403].includes(e.status)) { lockAccount(null); setUser(null); } else { throw e; } }
  }, []);
  useEffect(() => { refresh().catch(() => {}).finally(() => setReady(true)); }, [refresh]);
  const signin = async (email: string, password: string) => { await clearSessionCookies(); const u = await api.login(email, password); setUser(u); };
  const signout = async () => { try { await api.logout(); } finally { setUser(null); lockAccount(null); } };
  return <Context.Provider value={{user,ready,signin,signout,refresh}}>{children}</Context.Provider>;
}
export function useAuth() {const x = useContext(Context); if (!x) throw new Error('Missing AuthProvider'); return x;}
