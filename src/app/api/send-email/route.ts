import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { z } from "zod";
import { emailStore } from "@/lib/email-store";
import { generateId } from "@/lib/utils";
import { GenericEmail } from "@/emails/GenericEmail";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { NotificationEmail } from "@/emails/NotificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailSchema = z.object({
  to: z.string().email("Invalid recipient email"),
  from: z.string().email("Invalid from email").optional().or(z.literal("")),
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().min(1, "Body is required"),
  template: z.enum(["generic", "welcome", "notification"]).default("generic"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { to, from, subject, body: emailBody, template } = parsed.data;
    const fromAddress = from || process.env.FROM_EMAIL || "onboarding@resend.dev";

    // Select email component by template
    const templateProps = { subject, body: emailBody, senderName: "Email Dashboard" };
    let emailComponent;
    switch (template) {
      case "welcome":
        emailComponent = WelcomeEmail(templateProps);
        break;
      case "notification":
        emailComponent = NotificationEmail(templateProps);
        break;
      default:
        emailComponent = GenericEmail(templateProps);
    }

    const html = await render(emailComponent);
    const logId = generateId();

    // Save to store as pending
    emailStore.add({
      id: logId,
      direction: "outbound",
      to,
      from: fromAddress,
      subject,
      body: emailBody,
      htmlContent: html,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
    });

    if (error) {
      emailStore.updateById(logId, { status: "failed", errorMessage: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update with Resend email ID
    emailStore.updateById(logId, {
      resendId: data?.id,
      status: "sent",
    });

    return NextResponse.json({ success: true, id: logId, resendId: data?.id });
  } catch (err) {
    console.error("[send-email] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
