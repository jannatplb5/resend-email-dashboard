import type { Metadata } from "next";
import { EmailTable } from "@/components/dashboard/EmailTable";
import { LayoutDashboard, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-[#0d0d18]/80 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            Email Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Monitor sent emails, delivery status, and activity logs
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          Auto-refreshes every 15s
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        <EmailTable />
      </div>
    </div>
  );
}
