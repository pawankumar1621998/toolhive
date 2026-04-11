"use client";

/**
 * AuthContext — Real authentication backed by the ToolHive backend API.
 *
 * Endpoints used:
 *   POST /auth/signup          → register
 *   POST /auth/login           → login (returns accessToken + refreshToken)
 *   POST /auth/logout          → logout
 *   GET  /auth/me              → get current user
 *   POST /auth/refresh-token   → handled automatically by api.ts interceptor
 *
 * Tokens are stored in localStorage via tokenStorage (api.ts).
 * On every mount we call /auth/me to validate the stored token.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { AxiosError } from "axios";
import { apiPost, apiGet, tokenStorage } from "@/lib/api";
import type { AuthState, LoginCredentials, SignupCredentials, User } from "@/types";

// ─── State ────────────────────────────────────────────────────────────────────

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER";    payload: User }
  | { type: "CLEAR_USER" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING": return { ...state, isLoading: action.payload };
    case "SET_USER":    return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case "CLEAR_USER":  return { user: null, isAuthenticated: false, isLoading: false };
    default:            return state;
  }
}

// ─── Backend → App user mapper ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(raw: any): User {
  return {
    id:              raw._id ?? raw.id,
    email:           raw.email,
    name:            raw.name,
    avatarUrl:       raw.avatar ?? undefined,
    plan:            raw.plan ?? "free",
    createdAt:       new Date(raw.createdAt),
    usageThisMonth:  raw.usageThisMonth ?? 0,
    usageLimit:      raw.usageLimit ?? 50,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login:       (credentials: LoginCredentials)  => Promise<void>;
  signup:      (credentials: SignupCredentials) => Promise<void>;
  logout:      () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = "AuthContext";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // On mount — validate stored token by calling /auth/me
  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) {
      dispatch({ type: "CLEAR_USER" });
      return;
    }
    apiGet<{ user: unknown }>("/auth/me")
      .then((res) => dispatch({ type: "SET_USER", payload: mapUser(res.data.user) }))
      .catch(() => {
        tokenStorage.clear();
        dispatch({ type: "CLEAR_USER" });
      });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await apiPost<{ accessToken: string; refreshToken: string; user: unknown }>(
        "/auth/login",
        credentials
      );
      tokenStorage.setAccess(res.data.accessToken);
      // refreshToken is set as httpOnly cookie by the backend automatically
      dispatch({ type: "SET_USER", payload: mapUser(res.data.user) });
    } catch (err) {
      dispatch({ type: "SET_LOADING", payload: false });
      const msg = (err as AxiosError<{ message: string }>).response?.data?.message
        ?? "Login failed. Please try again.";
      throw new Error(msg);
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await apiPost<{ accessToken: string; refreshToken: string; user: unknown }>(
        "/auth/signup",
        credentials
      );
      tokenStorage.setAccess(res.data.accessToken);
      dispatch({ type: "SET_USER", payload: mapUser(res.data.user) });
    } catch (err) {
      dispatch({ type: "SET_LOADING", payload: false });
      const msg = (err as AxiosError<{ message: string }>).response?.data?.message
        ?? "Signup failed. Please try again.";
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // Ignore — clear tokens regardless
    } finally {
      tokenStorage.clear();
      dispatch({ type: "CLEAR_USER" });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiGet<{ user: unknown }>("/auth/me");
      dispatch({ type: "SET_USER", payload: mapUser(res.data.user) });
    } catch {
      tokenStorage.clear();
      dispatch({ type: "CLEAR_USER" });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, signup, logout, refreshUser }),
    [state, login, signup, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
