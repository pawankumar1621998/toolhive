"use client";

import { useMemo } from "react";

/**
 * useDashboard — returns local mock data.
 * No auth / API required — all tools are free.
 */

export interface DashboardStats {
  totalFiles:     number;
  processedFiles: number;
  pendingFiles:   number;
}

export interface UsageSummary {
  daily:   { used: number; limit: number; remaining: number | null };
  monthly: { used: number; limit: number; remaining: number | null; month: string };
  isUnlimited: boolean;
}

export interface ActivityJob {
  _id:             string;
  tool:            string;
  category:        string;
  status:          "pending" | "processing" | "completed" | "failed";
  createdAt:       string;
  completedAt?:    string;
  processingTime?: number;
  error?:          string;
}

export interface DashboardData {
  stats:          DashboardStats;
  recentActivity: ActivityJob[];
  usage:          UsageSummary;
  plan:           string;
}

const DEFAULT_DATA: DashboardData = {
  stats: { totalFiles: 0, processedFiles: 0, pendingFiles: 0 },
  recentActivity: [],
  usage: {
    daily:   { used: 0, limit: 999, remaining: null },
    monthly: { used: 0, limit: 999, remaining: null, month: "" },
    isUnlimited: true,
  },
  plan: "free",
};

export function useDashboard() {
  const data = useMemo<DashboardData>(() => ({
    ...DEFAULT_DATA,
    usage: {
      ...DEFAULT_DATA.usage,
      monthly: {
        ...DEFAULT_DATA.usage.monthly,
        month: new Date().toLocaleString("default", { month: "long" }),
      },
    },
  }), []);

  return {
    data,
    loading: false,
    error:   null,
    refresh: () => {},
  };
}
