"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { api } from "@/app/lib/api";
import {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
} from "@/app/lib/types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage event listeners for cross-tab sync and local updates
let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners.push(callback);

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "token" || e.key === "user" || e.key === null) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorageChange);

  return () => {
    listeners = listeners.filter((l) => l !== callback);
    window.removeEventListener("storage", handleStorageChange);
  };
}

function emitChange() {
  // Invalidate cache when state changes
  cachedSnapshot = null;
  listeners.forEach((listener) => listener());
}

// Cached snapshot to avoid infinite loops with useSyncExternalStore
let cachedSnapshot: AuthState | null = null;

// Unauthenticated state constant
const UNAUTHENTICATED_STATE: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

// Read auth state from localStorage
function getSnapshot(): AuthState {
  // Return cached snapshot if available
  if (cachedSnapshot !== null) {
    return cachedSnapshot;
  }

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      api.setToken(token);
      cachedSnapshot = { user, token, isAuthenticated: true, isLoading: false };
      return cachedSnapshot;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  api.setToken(null);
  cachedSnapshot = UNAUTHENTICATED_STATE;
  return cachedSnapshot;
}

// Server snapshot always returns loading state to avoid hydration mismatch
// Must be cached to avoid infinite loops with useSyncExternalStore
const SERVER_SNAPSHOT: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function getServerSnapshot(): AuthState {
  return SERVER_SNAPSHOT;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { access_token } = await api.login(credentials);

    // Decode JWT to get user info
    const payload = JSON.parse(atob(access_token.split(".")[1]));
    const user: User = {
      id: payload.sub,
      username: payload.username,
      email: payload.email || "",
      stripeCustomerId: null,
      isSeller: payload.isSeller || false,
      stripeConnectAccountId: payload.stripeConnectAccountId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));
    api.setToken(access_token);
    emitChange();
  }, []);

  const register = useCallback(
    async (data: RegisterData) => {
      await api.register(data);
      // After registration, auto-login
      await login({ username: data.username, password: data.password });
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    api.setToken(null);
    emitChange();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
