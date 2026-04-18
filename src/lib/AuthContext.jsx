import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext(null);
const STORAGE_KEY = "cpdals-auth";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function authRequest(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Authentication failed");
  }
  return payload;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState({ type: "auth_required" });

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setIsLoadingAuth(false);
      return;
    }

    try {
      const session = JSON.parse(raw);
      if (!session?.token) {
        throw new Error("Missing token");
      }

      base44.auth.me()
        .then((currentUser) => {
          setUser(currentUser);
          setIsAuthenticated(true);
          setAuthError(null);
        })
        .catch(() => {
          window.localStorage.removeItem(STORAGE_KEY);
          setUser(null);
          setIsAuthenticated(false);
          setAuthError({ type: "auth_required" });
        })
        .finally(() => {
          setIsLoadingAuth(false);
        });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      setIsLoadingAuth(false);
    }
  }, []);

  async function login(email, password) {
    const payload = await authRequest("/api/auth/login", { email, password });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setUser(payload.user);
    setIsAuthenticated(true);
    setAuthError(null);
    return payload;
  }

  async function register(name, email, password) {
    const payload = await authRequest("/api/auth/register", { name, email, password });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setUser(payload.user);
    setIsAuthenticated(true);
    setAuthError(null);
    return payload;
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError({ type: "auth_required" });
  }

  function navigateToLogin() {
    setAuthError({ type: "auth_required" });
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      login,
      register,
      checkAppState: () => Promise.resolve()
    }),
    [user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
