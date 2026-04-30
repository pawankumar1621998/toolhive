import { create } from "zustand";

export interface IGAccount {
  id: string;
  name: string;
  username: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerType: "comment_keyword" | "dm_keyword" | "story_reply";
  keywords: string[];
  dmMessage: string;
  enabled: boolean;
  triggeredCount: number;
  lastTriggered: string | null;
  createdAt?: string;
  conditions?: {
    newFollowersOnly?: boolean;
    specificPosts?: string[];
  };
}

export interface IGAnalytics {
  dmsSent: number;
  repliesSent: number;
  leadsCollected: number;
}

export interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  hide_on_media: boolean;
  media: { id: string; caption: string; permalink: string } | null;
}

export interface TriggerResult {
  ruleId: string;
  ruleName: string;
  commentId: string;
  commentText: string;
  username: string;
  matchedKeyword: string;
  dmSent: boolean;
}

interface InstagramStore {
  connected: boolean;
  token: string | null;
  activeAccount: IGAccount | null;
  accounts: IGAccount[];
  rules: AutomationRule[];
  analytics: IGAnalytics;
  recentComments: Comment[];
  triggerResults: TriggerResult[];
  isCheckingComments: boolean;
  isSendingDM: boolean;
  error: string | null;

  setConnected: (v: boolean) => void;
  setToken: (v: string | null) => void;
  setActiveAccount: (v: IGAccount | null) => void;
  setAccounts: (v: IGAccount[]) => void;
  setRules: (v: AutomationRule[]) => void;
  setAnalytics: (v: IGAnalytics) => void;
  setRecentComments: (v: Comment[]) => void;
  setTriggerResults: (v: TriggerResult[]) => void;
  setCheckingComments: (v: boolean) => void;
  setSendingDM: (v: boolean) => void;
  setError: (v: string | null) => void;
  refreshConnection: () => Promise<void>;
  loadRules: () => Promise<void>;
  createRule: (rule: Omit<AutomationRule, "id" | "triggeredCount" | "lastTriggered">) => Promise<void>;
  updateRule: (id: string, updates: Partial<AutomationRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  checkComments: () => Promise<void>;
  sendDM: (recipientId: string, message: string, commentId?: string) => Promise<void>;
  fetchComments: () => Promise<void>;
  updateAnalytics: () => Promise<void>;
}

export const useInstagramStore = create<InstagramStore>((set, get) => ({
  connected: false,
  token: null,
  activeAccount: null,
  accounts: [],
  rules: [],
  analytics: { dmsSent: 0, repliesSent: 0, leadsCollected: 0 },
  recentComments: [],
  triggerResults: [],
  isCheckingComments: false,
  isSendingDM: false,
  error: null,

  setConnected: (v) => set({ connected: v }),
  setToken: (v) => set({ token: v }),
  setActiveAccount: (v) => set({ activeAccount: v }),
  setAccounts: (v) => set({ accounts: v }),
  setRules: (v) => set({ rules: v }),
  setAnalytics: (v) => set({ analytics: v }),
  setRecentComments: (v) => set({ recentComments: v }),
  setTriggerResults: (v) => set({ triggerResults: v }),
  setCheckingComments: (v) => set({ isCheckingComments: v }),
  setSendingDM: (v) => set({ isSendingDM: v }),
  setError: (v) => set({ error: v }),

  refreshConnection: async () => {
    try {
      const res = await fetch("/api/auth/instagram/connect", { method: "PUT" });
      const data = await res.json();
      if (data.connected) {
        set({
          connected: true,
          token: data.token,
          activeAccount: data.accounts.find((a: IGAccount) => a.id === data.activeAccount) ?? null,
          accounts: data.accounts,
        });
      }
    } catch (e) {
      set({ connected: false });
    }
  },

  loadRules: async () => {
    const res = await fetch("/api/instagram/automation");
    if (res.ok) {
      const data = await res.json();
      set({ rules: data.rules });
    }
  },

  createRule: async (rule) => {
    const res = await fetch("/api/instagram/automation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    });
    if (res.ok) {
      const data = await res.json();
      set((s) => ({ rules: [...s.rules, data.rule] }));
    } else {
      const err = await res.json();
      set({ error: err.error });
    }
  },

  updateRule: async (id, updates) => {
    const res = await fetch(`/api/instagram/automation?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      set((s) => ({
        rules: s.rules.map((r) => (r.id === id ? data.rule : r)),
      }));
    }
  },

  deleteRule: async (id) => {
    const res = await fetch(`/api/instagram/automation?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      set((s) => ({ rules: s.rules.filter((r) => r.id !== id) }));
    }
  },

  checkComments: async () => {
    set({ isCheckingComments: true, error: null });
    try {
      const res = await fetch("/api/instagram/automation/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check_comments" }),
      });
      const data = await res.json();
      if (data.error) {
        set({ error: data.error });
      } else {
        set({ triggerResults: data.triggers ?? [] });
      }
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isCheckingComments: false });
    }
  },

  sendDM: async (recipientId, message, commentId) => {
    set({ isSendingDM: true, error: null });
    try {
      const res = await fetch("/api/instagram/automation/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_dm",
          recipientId,
          message,
          commentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) set({ error: data.error });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isSendingDM: false });
    }
  },

  fetchComments: async () => {
    const res = await fetch("/api/instagram/automation/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check_comments" }),
    });
    const data = await res.json();
    if (res.ok) {
      set({ recentComments: [] }); // Comments come from trigger results
    }
  },

  updateAnalytics: async () => {
    // Analytics come from cookie-based tracking, no separate endpoint needed
  },
}));
