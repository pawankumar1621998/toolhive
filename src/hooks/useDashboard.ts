"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalFiles: number;
  processedFiles: number;
  pendingFiles: number;
}

export interface UsageSummary {
  daily:   { used: number; limit: number; remaining: number | null };
  monthly: { used: number; limit: number; remaining: number | null; month: string };
  isUnlimited: boolean;
}

export interface ActivityJob {
  _id: string;
  tool: string;
  category: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  processingTime?: number;
  error?: string;
}

export interface DashboardData {
  stats:          DashboardStats;
  recentActivity: ActivityJob[];
  usage:          UsageSummary;
  plan:           string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboard() {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<DashboardData>("/dashboard/overview");
      setData(res.data);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
