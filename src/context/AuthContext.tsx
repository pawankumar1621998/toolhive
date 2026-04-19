"use client";

/**
 * AuthContext — Stubbed (auth system removed).
 * All tools are free, no login required.
 */

import React, { createContext, useContext, useMemo } from "react";
import type { AuthState, LoginCredentials, SignupCredentials } from "@/types";

interface AuthContextValue extends AuthState {
  login:       (credentials: LoginCredentials)  => Promise<void>;
  signup:      (credentials: SignupCredentials) => Promise<void>;
  logout:      () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = "AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user:            null,
      isAuthenticated: false,
      isLoading:       false,
      login:           async () => {},
      signup:          async () => {},
      logout:          async () => {},
      refreshUser:     async () => {},
    }),
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
