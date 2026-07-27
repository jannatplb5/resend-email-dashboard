"use client";

import { useEffect, useRef } from "react";
import { EmailLog } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { X, Mail, User, Clock, Hash, Eye, ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface EmailDrawerProps {
  log: EmailLog;
  onClose: () => void;
}

export function EmailDrawer({ log, onClose }: EmailDrawerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isInbound = log.direction === "inbound";

  // Inject HTML into iframe
  useEffect(() => {
    if (log.htmlContent && iframeRef.current) {
      const doc =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(log.htmlContent);
        doc.close();
      }
    }
  }, [log.htmlContent]);

  // Close on backdrop click / Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const meta = [
    { icon: User, label: "To", value: log.to },
    { icon: Mail, label: "From", value: log.from },
    { icon: Hash, label: "ID", value: log.resendId ?? log.id },
    { icon: Clock, label: isInbound ? "Received" : "Sent", value: formatDate(log.createdAt) },
    ...(log.deliveredAt
      ? [{ icon: Clock, label: "Delivered", value: formatDate(log.deliveredAt) }]
      : []),
    ...(log.openedAt
      ? [{ icon: Eye, label: "Opened", value: formatDate(log.openedAt) }]
      : []),
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-[700px] max-w-[95vw] bg-[#0f0f1a] border-l border-white/[0.08] z-50 flex flex-col shadow-2xl"
        style={{ animation: "slideInRight 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-2">
              {isInbound ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Inbound Email
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Outbound Email
                </span>
              )}
              <StatusBadge status={log.status} />
            </div>
            <h2 className="text-lg font-semibold text-white truncate">
              {log.subject}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isInbound ? `From: ${log.from}` : `To: ${log.to}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-slate-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata grid */}
        <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="grid grid-cols-2 gap-3">
            {meta.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1.5 rounded-md bg-white/[0.05]">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                    {label}
                  </p>
                  <p className="text-sm text-slate-300 truncate" title={value}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email HTML preview */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400/60" />
            <span className="text-xs font-medium text-slate-500">
              Email Body Content
            </span>
          </div>

          {log.htmlContent ? (
            <iframe
              ref={iframeRef}
              className="flex-1 w-full border-0 bg-white"
              title="Email content preview"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-slate-500 text-sm">No HTML preview available</p>
                <p className="text-slate-700 text-xs mt-1">
                  {log.body}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
