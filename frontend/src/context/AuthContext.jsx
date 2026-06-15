import { createContext, useContext, useState } from "react";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { pushToast } = useToast();
  const [token, setToken] = useState(() => localStorage.getItem("tg_token") || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tg_user")); } catch { return null; }
  });

  const login = (tok, userData) => {
    localStorage.setItem("tg_token", tok);
    localStorage.setItem("tg_user", JSON.stringify(userData));
    setToken(tok);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("tg_token");
    localStorage.removeItem("tg_user");
    setToken(null);
    setUser(null);
  };

  const authFetch = async (url, options = {}) => {
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    // For FormData, remove Content-Type so browser sets it with boundary
    if (options.body instanceof FormData) delete headers["Content-Type"];
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) { logout(); throw new Error("Session expired. Please log in again."); }
    if (res.status === 429) {
      let message = "Too many requests. Please wait a moment before trying again.";
      try {
        const data = await res.clone().json();
        if (data?.error) message = data.error;
      } catch { /* ignore parse errors */ }
      pushToast?.(message);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
