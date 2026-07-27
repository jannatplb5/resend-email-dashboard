import { NextResponse } from "next/server";
import { Resend } from "resend";
import { emailStore } from "@/lib/email-store";
import { EmailDirection, EmailLog, EmailStatus } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);

function determineDirectionAndStatus(
  fromAddress: string,
  lastEvent: string
): { direction: EmailDirection; status: EmailStatus } {
  const fromLower = (fromAddress || "").toLowerCase();
  const configuredFrom = (process.env.FROM_EMAIL || "onboarding@resend.dev").toLowerCase();

  // Explicit received events
  if (lastEvent === "received" || lastEvent === "inbound") {
    return { direction: "inbound", status: "received" };
  }

  // Extract domain from configured FROM_EMAIL (e.g. info@couvreurlefevre.fr -> couvreurlefevre.fr)
  const domainPart = configuredFrom.includes("@") ? configuredFrom.split("@")[1] : "";

  const isSentByUs =
    fromLower.includes("onboarding@resend.dev") ||
    fromLower.includes(configuredFrom) ||
    (domainPart && domainPart.length > 3 && fromLower.includes(domainPart));

  if (isSentByUs) {
    const statusMap: Record<string, EmailStatus> = {
      sent: "sent",
      delivered: "delivered",
      opened: "opened",
      clicked: "opened",
      bounced: "bounced",
      complained: "complained",
      failed: "failed",
    };
    return {
      direction: "outbound",
      status: statusMap[lastEvent] || "sent",
    };
  }

  // If sent from an external sender -> Inbound email
  return {
    direction: "inbound",
    status: "received",
  };
}

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
            const toAddress = Array.isArray(item.to) ? item.to.join(", ") : item.to;
            const fromAddress = item.from || process.env.FROM_EMAIL || "onboarding@resend.dev";
            const { direction, status } = determineDirectionAndStatus(fromAddress, item.last_event);

            remoteLogs.push({
              id: item.id,
              resendId: item.id,
              direction,
              to: toAddress || "recipient@example.com",
              from: fromAddress,
              subject: item.subject || "No Subject",
              body: direction === "inbound" 
                ? `Received email from ${fromAddress}` 
                : "Sent email via Resend API",
              status,
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.created_at),
            });
          }
        }
      } catch (apiErr) {
        console.warn("[emails] Could not fetch remote emails from Resend API:", apiErr);
      }
    }

    // Merge remote logs with local store (local store takes priority)
    const logMap = new Map<string, EmailLog>();

    // Add remote logs
    for (const log of remoteLogs) {
      logMap.set(log.resendId || log.id, log);
    }

    // Merge local logs (which carry full HTML preview & webhook payload data)
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
