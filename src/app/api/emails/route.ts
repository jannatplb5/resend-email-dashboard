import { NextResponse } from "next/server";
import { Resend } from "resend";
import { emailStore } from "@/lib/email-store";
import { EmailLog, EmailStatus } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const localLogs = emailStore.getAll();
    const remoteLogs: EmailLog[] = [];

    // Fetch live emails directly from Resend API
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

            remoteLogs.push({
              id: item.id,
              resendId: item.id,
              direction: "outbound",
              to: toAddress || "recipient@example.com",
              from: item.from || process.env.FROM_EMAIL || "onboarding@resend.dev",
              subject: item.subject || "No Subject",
              body: "Fetched directly from Resend Cloud API",
              status: statusMap[item.last_event] || "sent",
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.created_at),
            });
          }
        }
      } catch (apiErr) {
        console.warn("[emails] Could not fetch remote emails from Resend API:", apiErr);
      }
    }

    // Merge remote logs with local store (local store takes priority for HTML content)
    const logMap = new Map<string, EmailLog>();

    // First add remote logs
    for (const log of remoteLogs) {
      logMap.set(log.resendId || log.id, log);
    }

    // Then overwrite/merge with local logs (which have full HTML preview & inbound status)
    for (const log of localLogs) {
      const key = log.resendId || log.id;
      const existing = logMap.get(key);
      if (existing) {
        logMap.set(key, {
          ...existing,
          ...log,
          htmlContent: log.htmlContent || existing.htmlContent,
          body: log.body || existing.body,
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
