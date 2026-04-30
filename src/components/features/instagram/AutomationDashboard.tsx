"use client";

import { useState, useEffect } from "react";
import { useInstagramStore, type IGAccount, type AutomationRule, type TriggerResult, type IGAnalytics } from "@/lib/store/instagramStore";
import { Loader2, Zap, MessageSquare, BarChart3, Settings, Plus, ToggleLeft, ToggleRight, Send, RefreshCw, AlertCircle, CheckCircle2, Camera } from "lucide-react";

type Tab = "dashboard" | "rules" | "comments" | "analytics";

export default function AutomationDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [authUrl, setAuthUrl] = useState<string>("");
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);

  const {
    connected, activeAccount, accounts, rules, analytics, recentComments, triggerResults,
    isCheckingComments, isSendingDM, error, setError,
    refreshConnection, loadRules, checkComments, sendDM,
  } = useInstagramStore();

  useEffect(() => {
    refreshConnection();
  }, []);

  useEffect(() => {
    if (!connected) {
      fetch("/api/auth/instagram/connect")
        .then((r) => r.json())
        .then((d) => { if (d.authUrl) setAuthUrl(d.authUrl); })
        .catch(() => {});
    }
  }, [connected]);

  useEffect(() => {
    if (connected) loadRules();
  }, [connected]);

  async function handleConnect() {
    setLoadingAuth(true);
    window.location.href = authUrl || "/api/auth/instagram/connect";
  }

  async function handleDisconnect() {
    await fetch("/api/auth/instagram/connect?action=disconnect");
    refreshConnection();
  }

  async function handleCheckComments() {
    await checkComments();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm">Instagram Automation</h1>
                <p className="text-white/50 text-xs">Auto-reply & DM leads</p>
              </div>
            </div>

            {connected && activeAccount && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-white/60 text-xs">
                  <img src={activeAccount.profile_picture_url} className="w-6 h-6 rounded-full" alt="" />
                  <span>@{activeAccount.username}</span>
                  <span className="text-white/40">·</span>
                  <span>{activeAccount.followers_count?.toLocaleString() ?? 0} followers</span>
                </div>
                <button onClick={handleDisconnect} className="text-xs text-red-400 hover:text-red-300 transition">
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px">
            {([
              ["dashboard", "Dashboard", BarChart3],
              ["rules", "Rules", Settings],
              ["comments", "Comments", MessageSquare],
              ["analytics", "Analytics", Zap],
            ] as [Tab, string, typeof BarChart3][]).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition relative ${
                  tab === key
                    ? "text-white border-purple-400"
                    : "text-white/50 border-transparent hover:text-white/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {key === "rules" && rules.length > 0 && (
                  <span className="bg-purple-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {rules.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-950/50 border border-red-800/50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-300 text-sm font-medium">Error</p>
              <p className="text-red-400/80 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300 text-sm">Dismiss</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Not Connected */}
        {!connected ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
              <Camera className="w-10 h-10 text-purple-400" />
            </div>
            <div className="text-center">
              <h2 className="text-white text-xl font-semibold">Connect Instagram</h2>
              <p className="text-white/50 mt-1 text-sm max-w-sm">
                Connect your Instagram Business account to automate comments, send DMs, and collect leads automatically.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left text-sm text-white/60 max-w-md w-full">
              <p className="font-medium text-white/80 mb-2">What you need:</p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> Meta Developer app with Instagram API</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> Instagram Business or Creator account</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> Facebook Page linked to IG account</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> HTTPS redirect URI configured</li>
              </ul>
            </div>
            <button
              onClick={handleConnect}
              disabled={loadingAuth}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition disabled:opacity-60"
            >
              {loadingAuth ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              Connect with Instagram
            </button>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {tab === "dashboard" && <DashboardTab onCheck={handleCheckComments} isChecking={isCheckingComments} onNewRule={() => { setShowCreateRule(true); setTab("rules"); }} />}

            {/* Rules Tab */}
            {tab === "rules" && (
              <RulesTab
                rules={rules}
                onToggle={async (id, enabled) => {
                  const store = useInstagramStore.getState();
                  await store.updateRule(id, { enabled });
                }}
                onDelete={async (id) => {
                  const store = useInstagramStore.getState();
                  await store.deleteRule(id);
                }}
                onCreate={() => setShowCreateRule(true)}
                showCreate={showCreateRule}
                onCloseCreate={() => setShowCreateRule(false)}
              />
            )}

            {/* Comments Tab */}
            {tab === "comments" && <CommentsTab onRefresh={handleCheckComments} isRefreshing={isCheckingComments} results={triggerResults} />}

            {/* Analytics Tab */}
            {tab === "analytics" && <AnalyticsTab analytics={analytics} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Tab ──────────────────────────────────────────────────────────────

function DashboardTab({ onCheck, isChecking, onNewRule }: { onCheck: () => void; isChecking: boolean; onNewRule: () => void }) {
  const { rules, analytics, activeAccount } = useInstagramStore();
  const activeRules = rules.filter((r) => r.enabled);
  const totalTriggers = rules.reduce((sum, r) => sum + (r.triggeredCount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Rules", value: activeRules.length, icon: Settings, color: "from-purple-500 to-indigo-500" },
          { label: "Triggers Today", value: totalTriggers, icon: Zap, color: "from-amber-500 to-orange-500" },
          { label: "DMs Sent", value: analytics.dmsSent, icon: Send, color: "from-blue-500 to-cyan-500" },
          { label: "Replies Sent", value: analytics.repliesSent, icon: MessageSquare, color: "from-green-500 to-emerald-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/50 text-xs">{label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-white text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
              <RefreshCw className={`w-5 h-5 text-purple-400 ${isChecking ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Check Comments</h3>
              <p className="text-white/50 text-xs">Scan recent comments and auto-reply to matched keywords</p>
            </div>
          </div>
          <button
            onClick={onCheck}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-60"
          >
            {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isChecking ? "Checking..." : "Run Check Now"}
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Create New Rule</h3>
              <p className="text-white/50 text-xs">Set up keyword triggers for automatic DMs</p>
            </div>
          </div>
          <button
            onClick={onNewRule}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition border border-white/10"
          >
            <Plus className="w-4 h-4" />
            New Automation Rule
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Active Rules Overview</h3>
        {rules.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No rules yet. Create your first rule to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.slice(0, 5).map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white text-sm font-medium">{rule.name}</p>
                  <p className="text-white/40 text-xs">{rule.keywords.join(", ")}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 text-sm font-medium">{rule.triggeredCount ?? 0} triggers</p>
                  <p className="text-white/30 text-xs">{rule.triggerType.replace("_", " ")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rules Tab ─────────────────────────────────────────────────────────────────

function RulesTab({ rules, onToggle, onDelete, onCreate, showCreate, onCloseCreate }: {
  rules: AutomationRule[];
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreate: () => void;
  showCreate: boolean;
  onCloseCreate: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", keywords: "", dmMessage: "" });

  function startEdit(rule: typeof rules[0]) {
    setEditingId(rule.id);
    setEditForm({ name: rule.name, keywords: rule.keywords.join(", "), dmMessage: rule.dmMessage });
  }

  async function saveEdit(id: string) {
    const store = useInstagramStore.getState();
    await store.updateRule(id, {
      name: editForm.name,
      keywords: editForm.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      dmMessage: editForm.dmMessage,
    });
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-semibold">Automation Rules</h2>
        <button onClick={onCreate} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      {showCreate && <CreateRuleForm onClose={onCloseCreate} />}

      {rules.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Settings className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-1">No automation rules yet</h3>
          <p className="text-white/50 text-sm mb-4">Create rules to auto-reply to comments and send DMs when keywords are detected.</p>
          <button onClick={onCreate} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            Create your first rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className={`bg-white/5 border rounded-2xl p-5 ${rule.enabled ? "border-purple-500/30" : "border-white/10 opacity-60"}`}>
              {editingId === rule.id ? (
                <div className="space-y-3">
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm" placeholder="Rule name" />
                  <input value={editForm.keywords} onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm" placeholder="Keywords (comma separated)" />
                  <textarea value={editForm.dmMessage} onChange={(e) => setEditForm({ ...editForm, dmMessage: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm h-20" placeholder="DM message to send" />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(rule.id)} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">Save</button>
                    <button onClick={() => setEditingId(null)} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs transition border border-white/20">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-semibold text-sm">{rule.name}</p>
                        <span className="bg-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full">{rule.triggerType.replace("_", " ")}</span>
                        {rule.enabled ? (
                          <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Active
                          </span>
                        ) : (
                          <span className="bg-white/10 text-white/40 text-[10px] px-2 py-0.5 rounded-full">Paused</span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs mb-2">
                        Keywords: <span className="text-purple-300">{rule.keywords.join(", ")}</span>
                      </p>
                      <p className="text-white/60 text-xs bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                        DM: {rule.dmMessage.length > 80 ? rule.dmMessage.slice(0, 80) + "..." : rule.dmMessage}
                      </p>
                    </div>
                    <button
                      onClick={() => onToggle(rule.id, !rule.enabled)}
                      className="text-white/40 hover:text-white transition ml-3"
                      title={rule.enabled ? "Pause rule" : "Enable rule"}
                    >
                      {rule.enabled ? <ToggleRight className="w-6 h-6 text-green-400" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <span className="text-white/30 text-xs">{rule.triggeredCount ?? 0} total triggers</span>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(rule)} className="text-white/40 hover:text-white text-xs transition">Edit</button>
                      <button onClick={() => onDelete(rule.id)} className="text-red-400/60 hover:text-red-300 text-xs transition">Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create Rule Form ──────────────────────────────────────────────────────────

function CreateRuleForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", triggerType: "comment_keyword" as const, keywords: "", dmMessage: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { createRule } = useInstagramStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createRule({
        name: form.name,
        triggerType: form.triggerType,
        keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        dmMessage: form.dmMessage,
        enabled: true,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-semibold">Create New Automation Rule</h3>

      <div>
        <label className="text-white/60 text-xs mb-1 block">Rule Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm" placeholder="e.g. Product Inquiry Auto-Reply" />
      </div>

      <div>
        <label className="text-white/60 text-xs mb-1 block">Trigger Type</label>
        <select value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value as typeof form.triggerType })} className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm">
          <option value="comment_keyword">Comment Keyword</option>
          <option value="dm_keyword">DM Keyword</option>
          <option value="story_reply">Story Reply</option>
        </select>
      </div>

      <div>
        <label className="text-white/60 text-xs mb-1 block">Keywords <span className="text-white/30">(comma separated)</span></label>
        <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} required className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm" placeholder="price, buy, purchase, order" />
        <p className="text-white/30 text-[10px] mt-1">Auto-reply triggers when any of these words appear in comments</p>
      </div>

      <div>
        <label className="text-white/60 text-xs mb-1 block">Auto-Reply DM Message</label>
        <textarea value={form.dmMessage} onChange={(e) => setForm({ ...form, dmMessage: e.target.value })} required className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm h-24 resize-none" placeholder="Hi! Thanks for your interest. Here's the link to our catalog..." />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Create Rule
        </button>
        <button type="button" onClick={onClose} className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl text-sm transition border border-white/20">Cancel</button>
      </div>
    </form>
  );
}

// ─── Comments Tab ──────────────────────────────────────────────────────────────

function CommentsTab({ onRefresh, isRefreshing, results }: { onRefresh: () => void; isRefreshing: boolean; results: TriggerResult[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-semibold">Comment Monitor</h2>
        <button onClick={onRefresh} disabled={isRefreshing} className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl text-sm font-medium transition border border-white/10 disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Checking..." : "Refresh Comments"}
        </button>
      </div>

      {results.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-1">No triggers yet</h3>
          <p className="text-white/50 text-sm">Run a check to scan recent comments for keyword matches. Triggers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result, i) => (
            <div key={i} className="bg-white/5 border border-purple-500/20 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">@{result.username}</p>
                  <p className="text-white/40 text-xs">{result.commentText}</p>
                </div>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-1 rounded-full flex-shrink-0 ml-2">
                  Matched: {result.matchedKeyword}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <span className={`text-xs px-2 py-0.5 rounded-full ${result.dmSent ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {result.dmSent ? "DM Sent ✓" : "DM Failed"}
                </span>
                <span className="text-white/30 text-xs">Rule: {result.ruleName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ analytics }: { analytics: IGAnalytics }) {
  return (
    <div className="space-y-4">
      <h2 className="text-white text-lg font-semibold">Performance Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "DMs Sent", value: analytics.dmsSent, icon: Send, color: "from-blue-500 to-cyan-500", desc: "Direct messages delivered via automation" },
          { label: "Replies Sent", value: analytics.repliesSent, icon: MessageSquare, color: "from-green-500 to-emerald-500", desc: "Comment replies sent automatically" },
          { label: "Leads Collected", value: analytics.leadsCollected, icon: BarChart3, color: "from-amber-500 to-orange-500", desc: "Qualified leads from keyword matches" },
        ].map(({ label, value, icon: Icon, color, desc }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-white text-3xl font-bold mb-1">{value}</p>
            <p className="text-white/80 text-sm font-medium">{label}</p>
            <p className="text-white/40 text-xs mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Integration Stats</h3>
        <div className="space-y-3">
          {[
            { label: "API Rate Limit", value: "100 req/min" },
            { label: "Token Expiry", value: "~60 days" },
            { label: "Storage", value: "HTTP-Only Cookies" },
            { label: "Auto-Fix Engine", value: "10 error patterns" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-white/50 text-sm">{label}</span>
              <span className="text-white/80 text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
