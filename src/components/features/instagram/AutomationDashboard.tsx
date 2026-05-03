"use client";

import { useState, useEffect } from "react";
import { useInstagramStore, type IGAccount, type AutomationRule, type TriggerResult } from "@/lib/store/instagramStore";
import {
  MessageCircle, Zap, Users, BarChart3, Settings, Plus, RefreshCw,
  Send, Bell, Shield, TrendingUp, Eye, Clock, CheckCircle2, AlertCircle,
  ToggleLeft, ToggleRight, Trash2, Edit3, Copy, Download, ArrowRight,
  Camera, Star, Globe, ChevronRight, Sparkles, Filter, Search,
  MoreHorizontal, UserPlus, Heart, Bookmark, Share2, MessageSquare
} from "lucide-react";

// ─── Theme Colors ───────────────────────────────────────────────────────────
const ACCENT = "from-orange-500 to-rose-500";
const ACCENT_SOLID = "bg-gradient-to-r from-orange-500 to-rose-500";
const TEXT_PRIMARY = "text-slate-900";
const TEXT_SECONDARY = "text-slate-500";
const BG_CARD = "bg-white";
const BORDER = "border-slate-200";

// ─── Stats Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, trend }: { label: string; value: string | number; icon: any; trend?: string }) {
  return (
    <div className={`${BG_CARD} rounded-2xl p-5 border ${BORDER} shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-orange-500" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

// ─── Nav Item ────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active, onClick, badge }: {
  icon: any; label: string; active?: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          active ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Rule Card ────────────────────────────────────────────────────────────────
function RuleCard({ rule, onToggle, onEdit, onDelete }: {
  rule: AutomationRule;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (rule: AutomationRule) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`${BG_CARD} rounded-2xl p-5 border ${BORDER} shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{rule.name}</h3>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              rule.triggerType === "comment_keyword"
                ? "bg-blue-100 text-blue-600"
                : rule.triggerType === "dm_keyword"
                ? "bg-purple-100 text-purple-600"
                : "bg-green-100 text-green-600"
            }`}>
              {rule.triggerType === "comment_keyword" ? "💬 Comment" : rule.triggerType === "dm_keyword" ? "📩 DM" : "📖 Story"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {rule.keywords.slice(0, 4).map((kw) => (
              <span key={kw} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                {kw}
              </span>
            ))}
            {rule.keywords.length > 4 && (
              <span className="text-[11px] text-slate-400">+{rule.keywords.length - 4}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => onToggle(rule.id, !rule.enabled)}
          className="flex-shrink-0 ml-2"
        >
          {rule.enabled ? (
            <ToggleRight className="w-8 h-8 text-green-500" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-slate-300" />
          )}
        </button>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
        <p className="text-xs text-slate-400 mb-1">Auto-Reply Message:</p>
        <p className="text-sm text-slate-700 line-clamp-2">
          {rule.dmMessage || <span className="text-slate-400 italic">No message set</span>}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {rule.triggeredCount ?? 0} triggers
          </span>
          {rule.lastTriggered && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(rule.lastTriggered).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(rule)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(rule.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({ lead }: { lead: { username: string; comment: string; keyword: string; time: string; sent: boolean } }) {
  return (
    <div className={`${BG_CARD} rounded-xl p-4 border ${BORDER} hover:shadow-sm transition-all`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {lead.username[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900">@{lead.username}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium">
              {lead.keyword}
            </span>
            {lead.sent && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-600">
                <CheckCircle2 className="w-3 h-3" /> DM Sent
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-1 line-clamp-1">"{lead.comment}"</p>
          <span className="text-[10px] text-slate-400">{lead.time}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Create Rule Form ─────────────────────────────────────────────────────────
function CreateRuleForm({ onClose, editRule, onSave }: {
  onClose: () => void;
  editRule?: AutomationRule | null;
  onSave: (data: any) => void;
}) {
  const [form, setForm] = useState({
    name: editRule?.name ?? "",
    triggerType: editRule?.triggerType ?? "comment_keyword",
    keywords: editRule?.keywords.join(", ") ?? "",
    dmMessage: editRule?.dmMessage ?? "",
  });
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!form.name) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "instagram-dm-reply",
          input: form.name,
        }),
      });
      const data = await res.json();
      if (data.text) setForm((f) => ({ ...f, dmMessage: data.text }));
    } catch {}
    setGenerating(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            {editRule ? "Edit Automation Rule" : "Create New Rule"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Rule Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Product Inquiry Auto-Reply"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Trigger Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "comment_keyword", label: "💬 Comment", desc: "When someone comments" },
                { value: "dm_keyword", label: "📩 DM", desc: "When someone DMs you" },
                { value: "story_reply", label: "📖 Story", desc: "When someone replies to story" },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, triggerType: type.value as typeof form.triggerType })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.triggerType === type.value
                      ? "border-orange-400 bg-orange-50 ring-2 ring-orange-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900">{type.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Keywords <span className="text-slate-400 font-normal">(comma separated)</span>
            </label>
            <input
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="price, buy, discount, order, shipping"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Auto-Reply DM Message</label>
            <textarea
              value={form.dmMessage}
              onChange={(e) => setForm({ ...form, dmMessage: e.target.value })}
              placeholder="Hi! Thanks for reaching out. Here's our catalog link..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              required
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !form.name}
              className="mt-2 flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {generating ? "Generating..." : "✨ Generate with AI"}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              {editRule ? "Save Changes" : "Create Rule"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AutomationDashboard() {
  const [page, setPage] = useState<"overview" | "rules" | "leads" | "analytics" | "settings">("overview");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editRule, setEditRule] = useState<AutomationRule | null>(null);
  const [manualComment, setManualComment] = useState("");

  const {
    connected, activeAccount, accounts, rules, analytics,
    triggerResults, isCheckingComments, error, setError,
    refreshConnection, loadRules, checkComments,
    createRule, updateRule, deleteRule,
  } = useInstagramStore();

  useEffect(() => {
    refreshConnection();
    loadRules();
  }, []);

  const activeRules = rules.filter((r) => r.enabled);
  const totalTriggers = rules.reduce((sum, r) => sum + (r.triggeredCount ?? 0), 0);

  // Mock leads data for demo
  const mockLeads: typeof triggerResults extends Array<infer T> ? Array<{ username: string; comment: string; keyword: string; time: string; sent: boolean }> : never = [
    { username: "rahul_designs", comment: "What is the price of your coaching?", keyword: "price", time: "2 min ago", sent: true },
    { username: "priya.creates", comment: "Can I get a discount?", keyword: "discount", time: "8 min ago", sent: true },
    { username: "tech_with_ankit", comment: "Where to buy this course?", keyword: "buy", time: "15 min ago", sent: true },
    { username: "fashionista_v", comment: "Is this available in blue?", keyword: "available", time: "23 min ago", sent: false },
    { username: "digital_sarita", comment: "Do you ship internationally?", keyword: "shipping", time: "1 hour ago", sent: true },
    { username: "gym_motivation99", comment: "Is this authentic product?", keyword: "authentic", time: "2 hours ago", sent: true },
  ];

  async function handleSaveRule(data: any) {
    if (editRule) {
      await updateRule(editRule.id, data);
    } else {
      await createRule(data);
    }
    setEditRule(null);
  }

  function handleEditRule(rule: AutomationRule) {
    setEditRule(rule);
    setShowCreateForm(true);
  }

  function handleToggle(id: string, enabled: boolean) {
    updateRule(id, { enabled });
  }

  function handleDelete(id: string) {
    if (confirm("Delete this rule?")) {
      deleteRule(id);
    }
  }

  async function handleCheckComments() {
    setManualComment("");
    await checkComments();
  }

  // ── Not Connected View ───────────────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
        <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center mb-8 shadow-xl shadow-orange-500/20">
            <Camera className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Go Viral with <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">DM Automation</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-xl">
            Automatically reply to comments and DMs with personalized messages. Turn every follower into a customer.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10 w-full max-w-lg">
            {[
              { icon: MessageCircle, label: "30M+ DMs Sent" },
              { icon: Users, label: "10k+ Creators" },
              { icon: TrendingUp, label: "5M+ Followers" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <Icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900">{label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={async () => {
              const res = await fetch("/api/auth/instagram/connect");
              const data = await res.json();
              if (data.authUrl) window.location.href = data.authUrl;
            }}
            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all flex items-center gap-3"
          >
            <Camera className="w-5 h-5" />
            Connect Instagram Free
          </button>

          <div className="flex items-center gap-4 mt-6 text-sm text-slate-400">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> No Credit Card</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Instant Setup</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Meta Verified</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Connected Dashboard ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full overflow-y-auto">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-md">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">ToolHive</p>
              <p className="text-[10px] text-slate-400">Instagram Automation</p>
            </div>
          </div>
        </div>

        {/* Account */}
        {activeAccount && (
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
              <img
                src={activeAccount.profile_picture_url || `https://ui-avatars.com/api/?name=${activeAccount.username}&background=ff6b35&color=fff`}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{activeAccount.username}</p>
                <p className="text-[10px] text-slate-400">{activeAccount.followers_count?.toLocaleString()} followers</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <NavItem icon={BarChart3} label="Overview" active={page === "overview"} onClick={() => setPage("overview")} />
          <NavItem icon={Zap} label="Automation Rules" active={page === "rules"} onClick={() => setPage("rules")} badge={rules.length} />
          <NavItem icon={Users} label="Leads" active={page === "leads"} onClick={() => setPage("leads")} badge={mockLeads.length} />
          <NavItem icon={TrendingUp} label="Analytics" active={page === "analytics"} onClick={() => setPage("analytics")} />
          <NavItem icon={Settings} label="Settings" active={page === "settings"} onClick={() => setPage("settings")} />
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={async () => {
              await fetch("/api/auth/instagram/connect?action=disconnect");
              refreshConnection();
            }}
            className="w-full flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition"
          >
            <AlertCircle className="w-4 h-4" />
            Disconnect Account
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 ml-64">
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ── Overview Page ── */}
          {page === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Welcome back! Here's your automation overview.</p>
                </div>
                <button
                  onClick={() => { setEditRule(null); setShowCreateForm(true); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Rule
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <StatCard label="Active Rules" value={activeRules.length} icon={Zap} trend="+2 this week" />
                <StatCard label="DMs Sent" value={analytics.dmsSent} icon={Send} trend="+12 today" />
                <StatCard label="Replies Sent" value={analytics.repliesSent} icon={MessageCircle} trend="+8 today" />
                <StatCard label="Leads Collected" value={mockLeads.length} icon={Users} trend="+6 this week" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                      <RefreshCw className={`w-6 h-6 text-orange-500 ${isCheckingComments ? "animate-spin" : ""}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Check Comments</h3>
                      <p className="text-sm text-slate-400">Scan recent comments for triggers</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckComments}
                    disabled={isCheckingComments}
                    className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isCheckingComments ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {isCheckingComments ? "Checking..." : "Run Check Now"}
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Create Rule with AI</h3>
                      <p className="text-sm text-slate-400">Let AI build your automation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditRule(null); setShowCreateForm(true); }}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Create with AI
                  </button>
                </div>
              </div>

              {/* Recent Triggers */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Recent Activity</h3>
                  <button onClick={() => setPage("leads")} className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {mockLeads.slice(0, 4).map((lead, i) => (
                    <LeadCard key={i} lead={lead} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Rules Page ── */}
          {page === "rules" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Automation Rules</h1>
                  <p className="text-slate-500 text-sm mt-0.5">{rules.length} rules configured</p>
                </div>
                <button
                  onClick={() => { setEditRule(null); setShowCreateForm(true); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Rule
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {["All", "Active", "Paused"].map((filter) => (
                  <button
                    key={filter}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500 transition"
                  >
                    {filter}
                  </button>
                ))}
                <div className="flex-1" />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    placeholder="Search rules..."
                    className="pl-9 pr-4 py-2 rounded-xl text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {rules.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-orange-300" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">No automation rules yet</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                    Create your first rule to start automatically replying to comments and DMs.
                  </p>
                  <button
                    onClick={() => { setEditRule(null); setShowCreateForm(true); }}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all"
                  >
                    Create your first rule
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {rules.map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={handleToggle}
                      onEdit={handleEditRule}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Leads Page ── */}
          {page === "leads" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
                  <p className="text-slate-500 text-sm mt-0.5">{mockLeads.length} potential customers collected</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 font-medium px-4 py-2 rounded-xl text-sm hover:border-orange-300 transition">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <button className="flex items-center gap-2 bg-green-600 text-white font-medium px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <StatCard label="Total Leads" value={mockLeads.length} icon={Users} />
                <StatCard label="DM Sent" value={mockLeads.filter((l) => l.sent).length} icon={Send} />
                <StatCard label="Awaiting Reply" value={mockLeads.filter((l) => !l.sent).length} icon={Clock} />
                <StatCard label="Response Rate" value="94%" icon={TrendingUp} trend="+3%" />
              </div>

              <div className="space-y-3">
                {mockLeads.map((lead, i) => (
                  <LeadCard key={i} lead={lead} />
                ))}
              </div>
            </div>
          )}

          {/* ── Analytics Page ── */}
          {page === "analytics" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                <p className="text-slate-500 text-sm mt-0.5">Track your automation performance</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <StatCard label="DMs Sent" value={analytics.dmsSent} icon={Send} trend="+24 this week" />
                <StatCard label="Replies Sent" value={analytics.repliesSent} icon={MessageCircle} trend="+18 this week" />
                <StatCard label="Triggers" value={totalTriggers} icon={Zap} trend="+31 this week" />
                <StatCard label="Avg Response" value="2.3s" icon={TrendingUp} />
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Weekly Performance</h3>
                <div className="flex items-end gap-3 h-40">
                  {[65, 80, 45, 90, 75, 95, 60].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-orange-500 to-rose-400 rounded-t-lg" style={{ height: `${h}%` }}></div>
                      <span className="text-[10px] text-slate-400">{
                        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]
                      }</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Top Keywords", items: ["price", "discount", "buy", "shipping", "order"] },
                  { label: "Top Rules", items: rules.slice(0, 5).map((r) => r.name) },
                ].map(({ label, items }) => (
                  <div key={label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-3">{label}</h3>
                    <div className="space-y-2">
                      {items.length > 0 ? items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <span className="text-orange-500 font-bold text-xs">#{i + 1}</span>
                          <span className="text-slate-700">{item}</span>
                          <span className="ml-auto text-slate-400 text-xs">{Math.floor(Math.random() * 50) + 5} triggers</span>
                        </div>
                      )) : (
                        <p className="text-slate-400 text-sm">No data yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Settings Page ── */}
          {page === "settings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 text-sm mt-0.5">Configure your automation preferences</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Connected Account</h3>
                </div>
                {activeAccount && (
                  <div className="p-5 flex items-center gap-4">
                    <img
                      src={activeAccount.profile_picture_url || `https://ui-avatars.com/api/?name=${activeAccount.username}&background=ff6b35&color=fff`}
                      className="w-16 h-16 rounded-2xl object-cover"
                      alt=""
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{activeAccount.name}</p>
                      <p className="text-slate-500 text-sm">@{activeAccount.username}</p>
                      <p className="text-slate-400 text-xs mt-1">{activeAccount.followers_count?.toLocaleString()} followers</p>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch("/api/auth/instagram/connect?action=disconnect");
                        refreshConnection();
                      }}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Automation Preferences</h3>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: "Auto-check comments every hour", enabled: true },
                    { label: "Send DM immediately after match", enabled: true },
                    { label: "Collect leads to database", enabled: false },
                    { label: "Send email notification on trigger", enabled: false },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{pref.label}</span>
                      <button>
                        {pref.enabled ? (
                          <ToggleRight className="w-10 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-10 h-6 text-slate-300" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">API Configuration</h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: "INSTAGRAM_APP_ID", value: "••••••••829" },
                    { label: "INSTAGRAM_APP_SECRET", value: "••••••••••••" },
                    { label: "INSTAGRAM_REDIRECT_URI", value: "https://toolhive-red.vercel.app" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-xs text-slate-400 font-mono">{label}</span>
                      <span className="text-xs text-slate-600 font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Rule Modal */}
      {showCreateForm && (
        <CreateRuleForm
          onClose={() => { setShowCreateForm(false); setEditRule(null); }}
          editRule={editRule}
          onSave={handleSaveRule}
        />
      )}

      {/* Error Banner */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm max-w-sm z-50">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-white/70 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
}