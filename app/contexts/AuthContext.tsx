"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/app/lib/api";
import { User, AuthState, LoginCredentials, RegisterData } from "@/app/lib/types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Always start with loading state to avoid hydration mismatch
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  // Check localStorage only after mount to avoid hydration mismatch
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        api.setToken(token);
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { access_token } = await api.login(credentials);

    // Decode JWT to get user info
    const payload = JSON.parse(atob(access_token.split(".")[1]));
    const user: User = {
      id: payload.sub,
      username: payload.username,
      email: payload.email || "",
    };

    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));
    api.setToken(access_token);

    setState({
      user,
      token: access_token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (data: RegisterData) => {
    await api.register(data);
    // After registration, auto-login
    await login({ username: data.username, password: data.password });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    api.setToken(null);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

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
