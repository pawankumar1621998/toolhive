import { NextResponse } from "next/server";
import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProviderHealth {
  key: string;
  label: string;
  status: "ok" | "error" | "missing";
  latencyMs?: number;
  error?: string;
  checkedAt: string;
}

export interface ToolHealth {
  toolId: string;
  toolName: string;
  category: string;
  status: "ok" | "degraded" | "down";
  error?: string;
  checkedAt: string;
}

export interface AgentHealth {
  checkedAt: string;
  nextCheckIn: number; // seconds
  providers: ProviderHealth[];
  tools: ToolHealth[];
  summary: string;
  criticalIssues: string[];
  degradedCount: number;
  downCount: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

let cachedHealth: AgentHealth | null = null;
let lastCheck = 0;
const CACHE_TTL = 120_000; // 2 min cache

export const useAgentStore = create<{
  health: AgentHealth | null;
  isChecking: boolean;
  lastError: string | null;
  setHealth: (h: AgentHealth) => void;
  setChecking: (v: boolean) => void;
  setError: (e: string) => void;
}>()((set) => ({
  health: null,
  isChecking: false,
  lastError: null,
  setHealth: (h) => set({ health: h }),
  setChecking: (v) => set({ isChecking: v }),
  setError: (e) => set({ lastError: e }),
}));

// ─── Get cached ───────────────────────────────────────────────────────────────

export function getCachedHealth(): AgentHealth | null {
  if (!cachedHealth) return null;
  if (Date.now() - lastCheck > CACHE_TTL) return null;
  return cachedHealth;
}

// ─── Update cache ─────────────────────────────────────────────────────────────

export function setCachedHealth(health: AgentHealth) {
  cachedHealth = health;
  lastCheck = Date.now();
}