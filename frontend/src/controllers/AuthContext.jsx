import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../models/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dplosokk_user")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("dplosokk_token");

    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch("/auth/me")
      .then((result) => {
        const saved = JSON.parse(localStorage.getItem("dplosokk_user") || "null");
        setUser(saved || result.user);
      })
      .catch(() => {
        localStorage.removeItem("dplosokk_token");
        localStorage.removeItem("dplosokk_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(result) {
    localStorage.setItem("dplosokk_token", result.token);
    localStorage.setItem("dplosokk_user", JSON.stringify(result.user));
    setUser(result.user);
  }

  function updateUser(nextUser) {
    setUser(nextUser);
    localStorage.setItem("dplosokk_user", JSON.stringify(nextUser));
  }

  function logout() {
    localStorage.removeItem("dplosokk_token");
    localStorage.removeItem("dplosokk_user");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, updateUser, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
