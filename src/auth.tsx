import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, ApiError, clearSessionCookies, lockAccount } from './api';
import type { User } from './types';

type Session = {
  user: User | null;
  ready: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Context = createContext<Session | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const currentUser = await api.me();
      lockAccount(currentUser.public_id);
      setUser(currentUser);
    } catch (e) {
      if (e instanceof ApiError && [401, 403].includes(e.status)) {
        lockAccount(null);
        setUser(null);
      } else {
        throw e;
      }
    }
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => {})
      .finally(() => setReady(true));
  }, [refresh]);

  const signin = useCallback(async (email: string, password: string) => {
    await clearSessionCookies();
    const currentUser = await api.login(email, password);
    setUser(currentUser);
  }, []);

  const signout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      lockAccount(null);
    }
  }, []);

  const contextValue = useMemo<Session>(
    () => ({
      user,
      ready,
      signin,
      signout,
      refresh,
    }),
    [user, ready, signin, signout, refresh],
  );

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
}

export function useAuth() {
  const x = useContext(Context);
  if (!x) throw new Error('Missing AuthProvider');
  return x;
}
