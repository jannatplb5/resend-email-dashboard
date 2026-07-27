"use client";

import { useState } from "react";
import { ComposerForm } from "@/components/email-composer/ComposerForm";
import { LivePreview } from "@/components/email-composer/LivePreview";
import { SendEmailFormValues } from "@/lib/validations";
import { Sparkles, Eye } from "lucide-react";

export default function ComposePage() {
  const [formValues, setFormValues] = useState<Partial<SendEmailFormValues>>({
    template: "generic",
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Page header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-[#0d0d18]/80 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Compose Email
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Write and send beautiful emails with live preview
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
          <Eye className="w-3.5 h-3.5" />
          Live preview enabled
        </div>
      </div>

      {/* Split-screen composer */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Form */}
        <div className="w-1/2 flex flex-col border-r border-white/[0.06] bg-[#0d0d18]">
          <div className="flex-1 overflow-y-auto p-6">
            <ComposerForm onFormChange={setFormValues} />
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="w-1/2 flex flex-col bg-[#0a0a14]">
          <LivePreview formValues={formValues} />
        </div>
      </div>
    </div>
  );
}
