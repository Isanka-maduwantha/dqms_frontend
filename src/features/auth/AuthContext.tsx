import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { clearSession, getStoredUser, saveSession, type AuthUser } from "./services/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  role: AuthUser["role"] | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = useCallback((token: string, nextUser: AuthUser) => {
    saveSession(token, nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, role: user?.role ?? null, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
