import { createContext, useContext, useState } from "react";
import { useToast } from "./ToastContext";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const { pushToast } = useToast();
  const [token, setToken] = useState(() => localStorage.getItem("tg_admin_token") || null);

  const login = (tok) => {
    localStorage.setItem("tg_admin_token", tok);
    setToken(tok);
  };

  const logout = () => {
    localStorage.removeItem("tg_admin_token");
    setToken(null);
  };

  const adminFetch = async (url, options = {}) => {
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (options.body instanceof FormData) delete headers["Content-Type"];
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) { logout(); throw new Error("Session expired. Please log in again."); }
    if (res.status === 429) {
      let message = "Too many requests. Please wait a moment before trying again.";
      try {
        const data = await res.clone().json();
        if (data?.error) message = data.error;
      } catch { /* ignore */ }
      pushToast?.(message);
    }
    return res;
  };

  return (
    <AdminAuthContext.Provider value={{ token, login, logout, adminFetch }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
