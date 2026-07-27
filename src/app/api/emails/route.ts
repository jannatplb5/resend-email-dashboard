import { NextResponse } from "next/server";
import { Resend } from "resend";
import { emailStore } from "@/lib/email-store";
import { EmailLog, EmailStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const localLogs = await emailStore.getAll();
    const remoteLogs: EmailLog[] = [];

    // Fetch sent emails directly from Resend Cloud API
    if (process.env.RESEND_API_KEY) {
      try {
        const { data, error } = await resend.emails.list();
        if (!error && data?.data) {
          for (const item of data.data) {
            const statusMap: Record<string, EmailStatus> = {
              sent: "sent",
              delivered: "delivered",
              opened: "opened",
              clicked: "opened",
              bounced: "bounced",
              complained: "complained",
              failed: "failed",
            };

            const toAddress = Array.isArray(item.to) ? item.to.join(", ") : item.to;
            const currentStatus = statusMap[item.last_event] || "sent";

            remoteLogs.push({
              id: item.id,
              resendId: item.id,
              direction: "outbound", // All emails from Resend API list are sent emails
              to: toAddress || "recipient@example.com",
              from: item.from || "unknown",
              subject: item.subject || "(No Subject)",
              body: "Click to load body content from Resend",
              status: currentStatus,
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.created_at),
            });
          }
        }
      } catch (apiErr) {
        console.warn("[emails] Could not fetch remote emails from Resend API:", apiErr);
      }
    }

    // Merge remote sent logs with local store (local store retains inbound emails & cached HTML)
    const logMap = new Map<string, EmailLog>();

    // 1. Add remote outbound logs
    for (const log of remoteLogs) {
      logMap.set(log.resendId || log.id, log);
    }

    // 2. Add local logs (inbound received emails + local outbound entries with full HTML)
    for (const log of localLogs) {
      const key = log.resendId || log.id;
      const existing = logMap.get(key);

      if (existing) {
        logMap.set(key, {
          ...existing,
          ...log,
          direction: log.direction || existing.direction,
          status: log.status || existing.status,
          htmlContent: log.htmlContent || existing.htmlContent,
          body: log.body && log.body !== "Click to load body content from Resend" ? log.body : existing.body,
        });
      } else {
        logMap.set(key, log);
      }
    }

    const mergedLogs = Array.from(logMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ logs: mergedLogs, total: mergedLogs.length });
  } catch (err) {
    console.error("[emails] Error fetching logs:", err);
    return NextResponse.json({ error: "Failed to fetch email logs" }, { status: 500 });
  }
}
