"use client";

import { useState, useEffect, useCallback } from "react";
import { EmailLog } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import { Mail, RefreshCw, Inbox, ChevronRight, Search } from "lucide-react";
import { EmailDrawer } from "./EmailDrawer";
import { cn } from "@/lib/utils";

export function EmailTable() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [search, setSearch] = useState("");

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
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => fetchLogs(), 15000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filtered = logs.filter(
    (l) =>
      l.to.toLowerCase().includes(search.toLowerCase()) ||
      l.subject.toLowerCase().includes(search.toLowerCase()) ||
      l.from.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: logs.length,
    delivered: logs.filter((l) => l.status === "delivered").length,
    opened: logs.filter((l) => l.status === "opened").length,
    bounced: logs.filter((l) => l.status === "bounced").length,
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Sent", value: stats.total, color: "text-slate-300" },
          { label: "Delivered", value: stats.delivered, color: "text-emerald-400" },
          { label: "Opened", value: stats.opened, color: "text-purple-400" },
          { label: "Bounced", value: stats.bounced, color: "text-red-400" },
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

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search by recipient, subject, or sender..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <button
          onClick={() => fetchLogs(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Inbox className="w-12 h-12 text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium">
            {search ? "No emails match your search" : "No emails yet"}
          </p>
          <p className="text-slate-600 text-sm mt-1">
            {search
              ? "Try a different search term"
              : "Send your first email from the Compose tab"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 bg-white/[0.03] border-b border-white/[0.06]">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Recipient
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
            {filtered.map((log) => (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="w-full grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm text-slate-300 font-medium truncate group-hover:text-white transition-colors">
                    {log.to}
                  </p>
                  <p className="text-xs text-slate-600 truncate">{log.from}</p>
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-slate-400 truncate">{log.subject}</p>
                </div>

                <div className="flex items-center">
                  <StatusBadge status={log.status} />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span title={formatDate(log.createdAt)}>
                    {formatRelativeTime(log.createdAt)}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                </div>
              </button>
            ))}
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
