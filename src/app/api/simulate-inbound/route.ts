import { NextRequest, NextResponse } from "next/server";
import { emailStore } from "@/lib/email-store";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, subject, message } = body;

    const fromAddress = from || "customer@example.com";
    const toAddress = to || "support@yourdomain.com";
    const subjectText = subject || "Inquiry about your service";
    const messageText = message || "Hello! I saw your website and wanted to get in touch. Please let me know your pricing.";

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f0f1a; color: #f1f5f9; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 16px; margin-bottom: 20px;">
          <span style="background-color: rgba(34, 211, 238, 0.15); color: #22d3ee; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">Inbound Received</span>
          <h2 style="color: #ffffff; margin: 12px 0 4px 0; font-size: 20px;">${subjectText}</h2>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">From: ${fromAddress} &bull; To: ${toAddress}</p>
        </div>
        <div style="line-height: 1.7; color: #cbd5e1; font-size: 15px; white-space: pre-wrap;">
          ${messageText}
        </div>
        <div style="margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; text-align: center; color: #475569; font-size: 12px;">
          Received via Resend Inbound Route
        </div>
      </div>
    `;

    const logId = generateId();
    emailStore.add({
      id: logId,
      resendId: `inbound_${logId}`,
      direction: "inbound",
      to: toAddress,
      from: fromAddress,
      subject: subjectText,
      body: messageText,
      htmlContent: htmlContent,
      status: "received",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, id: logId });
  } catch (err) {
    return NextResponse.json({ error: "Failed to simulate inbound email" }, { status: 500 });
  }
}
