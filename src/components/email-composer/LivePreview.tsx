"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SendEmailFormValues } from "@/lib/validations";

type ViewMode = "desktop" | "mobile";

interface LivePreviewProps {
  formValues: Partial<SendEmailFormValues>;
}

export function LivePreview({ formValues }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!formValues.body && !formValues.subject) return;
      setIsLoading(true);

      try {
        const res = await fetch("/api/preview-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: formValues.subject || "Preview",
            body: formValues.body || "",
            template: formValues.template || "generic",
          }),
        });

        if (res.ok) {
          const { html } = await res.json();
          const iframe = iframeRef.current;
          if (iframe) {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc) {
              doc.open();
              doc.write(html);
              doc.close();
            }
          }
          setLastUpdated(new Date());
        }
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formValues.subject, formValues.body, formValues.template]);

  const hasContent = formValues.body || formValues.subject;

  return (
    <div className="flex flex-col h-full">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
          <span className="text-xs font-medium text-slate-400">Live Preview</span>
          {isLoading && (
            <RefreshCw className="w-3 h-3 text-slate-500 animate-spin ml-1" />
          )}
        </div>

        {lastUpdated && (
          <span className="text-[10px] text-slate-600">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}

        {/* View mode toggles */}
        <div className="flex gap-1 bg-white/[0.05] rounded-lg p-1">
          <button
            onClick={() => setViewMode("desktop")}
            className={cn(
              "flex items-center justify-center w-7 h-6 rounded-md transition-all",
              viewMode === "desktop"
                ? "bg-white/10 text-slate-200"
                : "text-slate-500 hover:text-slate-300"
            )}
            title="Desktop view"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={cn(
              "flex items-center justify-center w-7 h-6 rounded-md transition-all",
              viewMode === "mobile"
                ? "bg-white/10 text-slate-200"
                : "text-slate-500 hover:text-slate-300"
            )}
            title="Mobile view"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-hidden bg-[#0a0a14] flex items-start justify-center p-6">
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-50">
            <div className="text-5xl">✉️</div>
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Start typing to preview
              </p>
              <p className="text-slate-600 text-xs mt-1">
                Your email will render here in real-time
              </p>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "transition-all duration-300 bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/50",
              viewMode === "desktop" ? "w-full max-w-[600px]" : "w-[375px]"
            )}
            style={{ height: "calc(100% - 0px)", minHeight: "400px" }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
