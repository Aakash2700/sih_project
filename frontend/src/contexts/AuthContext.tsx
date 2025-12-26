import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken, getMe, loadToken, login as apiLogin, saveToken, signup as apiSignup } from '@/lib/auth';

type User = { username: string; role: 'admin' | 'user'; village?: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<NonNullable<User>>;
  signup: (args: { username: string; password: string; role: 'admin' | 'user'; village?: string }) => Promise<NonNullable<User>>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(loadToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const me = await getMe(token);
        setUser(me);
      } catch {
        setUser(null);
        setToken(null);
        clearToken();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    saveToken(res.access_token);
    setToken(res.access_token);
    const me = await getMe(res.access_token);
    setUser(me);
    return me as NonNullable<User>;
  };

  const signup = async (args: { username: string; password: string; role: 'admin' | 'user'; village?: string }) => {
    await apiSignup(args);
    const me = await login(args.username, args.password);
    return me;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearToken();
  };

  const value = useMemo(() => ({ user, token, loading, login, signup, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};



