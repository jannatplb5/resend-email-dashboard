import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { z } from "zod";
import { GenericEmail } from "@/emails/GenericEmail";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { NotificationEmail } from "@/emails/NotificationEmail";

const previewSchema = z.object({
  subject: z.string().default("Preview"),
  body: z.string().default(""),
  template: z.enum(["generic", "welcome", "notification"]).default("generic"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = previewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { subject, body: emailBody, template } = parsed.data;
    const props = { subject, body: emailBody };

    let component;
    switch (template) {
      case "welcome":
        component = WelcomeEmail(props);
        break;
      case "notification":
        component = NotificationEmail(props);
        break;
      default:
        component = GenericEmail(props);
    }

    const html = await render(component);
    return NextResponse.json({ html });
  } catch (err) {
    console.error("[preview-email] Error:", err);
    return NextResponse.json({ error: "Render failed" }, { status: 500 });
  }
}
