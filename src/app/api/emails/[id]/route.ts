import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { emailStore } from "@/lib/email-store";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check local store first (which might have full HTML from composer or webhook)
    const local = emailStore.getById(id) || emailStore.getByResendId(id);
    if (local && local.htmlContent) {
      return NextResponse.json({ email: local });
    }

    // Fetch full email details from Resend API if API key is set
    if (process.env.RESEND_API_KEY) {
      const { data, error } = await resend.emails.get(id);
      if (!error && data) {
        const toAddress = Array.isArray(data.to) ? data.to.join(", ") : data.to;
        const html = data.html || (data.text ? `<div style="font-family:sans-serif;padding:24px;color:#e2e8f0;background:#0f0f1a;white-space:pre-wrap;">${data.text}</div>` : "");

        const fullLog = {
          id: data.id,
          resendId: data.id,
          direction: "outbound" as const,
          to: toAddress,
          from: data.from,
          subject: data.subject,
          body: data.text || "No text content",
          htmlContent: html,
          status: (data.last_event as any) || "sent",
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.created_at),
        };

        // Cache in local store
        emailStore.add(fullLog);
        return NextResponse.json({ email: fullLog });
      }
    }

    if (local) {
      return NextResponse.json({ email: local });
    }

    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  } catch (err) {
    console.error("[emails/id] Error fetching detail:", err);
    return NextResponse.json({ error: "Failed to fetch email detail" }, { status: 500 });
  }
}
