import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { emailStore } from "@/lib/email-store";
import { EmailStatus, WebhookEvent } from "@/lib/types";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("[webhook] RESEND_WEBHOOK_SECRET not set — skipping signature verification");
  }

  // Read raw body for signature verification
  const rawBody = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  // Verify webhook signature if secret is set
  if (webhookSecret) {
    try {
      const wh = new Webhook(webhookSecret);
      wh.verify(rawBody, headers);
    } catch (err) {
      console.error("[webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  console.log(`[webhook] Received event: ${event.type}`, event.data);

  // Handle Incoming (Inbound) Email Event
  if (event.type === "email.received" || event.type === "email.inbound") {
    const toAddress = Array.isArray(event.data.to)
      ? event.data.to.join(", ")
      : (event.data.to as string) || "me@yourdomain.com";

    const fromAddress = (event.data.from as string) || "unknown@sender.com";
    const subjectText = (event.data.subject as string) || "Incoming Message";
    
    // Sometimes Resend payload might have it in other fields, let's dump it if empty
    let bodyContent = (event.data.text as string) || (event.data.html as string);
    if (!bodyContent || bodyContent.trim() === "") {
      bodyContent = "No body content. Raw Payload: " + JSON.stringify(event.data);
    }
    
    const htmlContent = (event.data.html as string) || `<div style="font-family:sans-serif;padding:20px;">${bodyContent}</div>`;
    const resendId = (event.data.email_id || event.data.id) as string;

    await emailStore.add({
      id: generateId(),
      resendId,
      direction: "inbound",
      to: toAddress,
      from: fromAddress,
      subject: subjectText,
      body: bodyContent,
      htmlContent: htmlContent,
      status: "received",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ received: true, inbound: true });
  }

  // Handle Outbound Email Event Status Updates
  const emailId = event.data?.email_id;

  const eventStatusMap: Record<string, EmailStatus> = {
    "email.sent": "sent",
    "email.delivered": "delivered",
    "email.delivery_delayed": "pending",
    "email.complained": "complained",
    "email.bounced": "bounced",
    "email.opened": "opened",
    "email.clicked": "opened",
  };

  const newStatus = eventStatusMap[event.type];

  if (newStatus && emailId) {
    const extras: Record<string, unknown> = {};
    if (event.type === "email.delivered") extras.deliveredAt = new Date();
    if (event.type === "email.opened" || event.type === "email.clicked") {
      extras.openedAt = new Date();
    }

    const updated = await emailStore.updateStatus(emailId, newStatus, extras);
    if (!updated) {
      console.warn(`[webhook] Outbound email not found in store: ${emailId}`);
    }
  }

  return NextResponse.json({ received: true });
}
