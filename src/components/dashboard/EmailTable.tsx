"use client";

import { useState, useEffect, useCallback } from "react";
import { EmailLog } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import { RefreshCw, Inbox, ChevronRight, Search, ArrowUpRight, ArrowDownLeft, PlusCircle } from "lucide-react";
import { EmailDrawer } from "./EmailDrawer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FilterTab = "all" | "outbound" | "inbound";

export function EmailTable() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [simulating, setSimulating] = useState(false);

  const fetchLogs = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch("/api/emails");
      const data = await res.json();
      setLogs(data.logs ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => fetchLogs(), 15000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const simulateInbound = async () => {
    setSimulating(true);
    try {
      const res = await fetch("/api/simulate-inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "client@example.com",
          to: "support@yourdomain.com",
          subject: "Test Inbound Message",
          message: "Hello! This is a simulated incoming email received via webhook.",
        }),
      });

      if (res.ok) {
        toast.success("Simulated incoming email received! 📥");
        fetchLogs(true);
      }
    } catch {
      toast.error("Failed to simulate inbound email");
    } finally {
      setSimulating(false);
    }
  };

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.to.toLowerCase().includes(search.toLowerCase()) ||
      l.subject.toLowerCase().includes(search.toLowerCase()) ||
      l.from.toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "outbound" && (l.direction === "outbound" || !l.direction)) ||
      (activeTab === "inbound" && l.direction === "inbound");

    return matchesSearch && matchesTab;
  });

  const stats = {
    total: logs.length,
    sent: logs.filter((l) => l.direction === "outbound" || !l.direction).length,
    received: logs.filter((l) => l.direction === "inbound").length,
    delivered: logs.filter((l) => l.status === "delivered").length,
    opened: logs.filter((l) => l.status === "opened").length,
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl shimmer"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Activity", value: stats.total, color: "text-slate-300" },
          { label: "Sent (Outbound)", value: stats.sent, color: "text-indigo-400" },
          { label: "Received (Inbound)", value: stats.received, color: "text-cyan-400" },
          { label: "Delivered", value: stats.delivered, color: "text-emerald-400" },
          { label: "Opened", value: stats.opened, color: "text-purple-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white/[0.03] rounded-xl border border-white/[0.06] px-5 py-4"
          >
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs & Simulation button */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
          {[
            { id: "all", label: "All Activity", count: stats.total },
            { id: "outbound", label: "Sent (Outbound)", count: stats.sent },
            { id: "inbound", label: "Inbox (Received)", count: stats.received },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              )}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-[10px] text-slate-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={simulateInbound}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
            title="Simulate receiving an email locally"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Simulate Inbound Email
          </button>
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-slate-400 hover:text-slate-200 transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        <input
          type="text"
          placeholder="Search by recipient, sender, or subject line..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-white/[0.06] bg-white/[0.01]">
          <Inbox className="w-12 h-12 text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium">
            {search ? "No emails match your search" : "No email logs found"}
          </p>
          <p className="text-slate-600 text-xs mt-1">
            {search
              ? "Try adjusting your filter or search query"
              : "Use Compose to send an email, or click 'Simulate Inbound Email' to test receiving."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[100px_1fr_1.5fr_120px_auto] gap-4 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06]">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Type
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              From / To
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Subject
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Status
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Time
            </span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((log) => {
              const isInbound = log.direction === "inbound";
              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="w-full grid grid-cols-[100px_1fr_1.5fr_120px_auto] gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors group items-center"
                >
                  {/* Type Badge */}
                  <div>
                    {isInbound ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-medium">
                        <ArrowDownLeft className="w-3 h-3" /> Inbox
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-medium">
                        <ArrowUpRight className="w-3 h-3" /> Sent
                      </span>
                    )}
                  </div>

                  {/* Addresses */}
                  <div className="min-w-0">
                    <p className="text-sm text-slate-300 font-medium truncate group-hover:text-white transition-colors">
                      {isInbound ? `From: ${log.from}` : `To: ${log.to}`}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {isInbound ? `To: ${log.to}` : `From: ${log.from}`}
                    </p>
                  </div>

                  {/* Subject */}
                  <div className="min-w-0">
                    <p className="text-sm text-slate-400 truncate">{log.subject}</p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <StatusBadge status={log.status} />
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span title={formatDate(log.createdAt)}>
                      {formatRelativeTime(log.createdAt)}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Email detail drawer */}
      {selectedLog && (
        <EmailDrawer
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  );
}
