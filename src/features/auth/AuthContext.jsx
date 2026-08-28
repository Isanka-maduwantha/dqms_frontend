import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { clearSession, getStoredUser, saveSession } from "./services/authApi";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getStoredUser());
    const login = useCallback((token, nextUser) => {
        saveSession(token, nextUser);
        setUser(nextUser);
    }, []);
    const logout = useCallback(() => {
        clearSession();
        setUser(null);
    }, []);
    const value = useMemo(() => ({ user, role: user?.role ?? null, login, logout }), [user, login, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
