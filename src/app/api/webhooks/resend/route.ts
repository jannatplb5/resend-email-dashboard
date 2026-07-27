import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { emailStore } from "@/lib/email-store";
import { EmailStatus, WebhookEvent } from "@/lib/types";

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

  const emailId = event.data?.email_id;

  // Map Resend event types to our EmailStatus
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

    const updated = emailStore.updateStatus(emailId, newStatus, extras);
    if (!updated) {
      // Email might not be in store (e.g., sent outside this session)
      console.warn(`[webhook] Email not found in store: ${emailId}`);
    }
  }

  return NextResponse.json({ received: true });
}


