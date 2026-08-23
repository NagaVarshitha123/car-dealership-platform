import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../api/client';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'car-dealership-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  function persist(nextUser: User, nextToken: string) {
    setUser(nextUser);
    setToken(nextToken);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
  }

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await api.login(email, password);
      persist(result.user, result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await api.register(email, password);
      persist(result.user, result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
