import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
  Preview,
  Button,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  subject?: string;
  body?: string;
  senderName?: string;
  recipientName?: string;
}

export function WelcomeEmail({
  subject = "Welcome aboard! 🎉",
  body = "We're thrilled to have you with us. Your journey starts here.",
  senderName = "Email Dashboard",
  recipientName = "there",
}: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{subject}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Hero */}
          <Section style={heroStyle}>
            <Text style={emojiStyle}>🚀</Text>
            <Heading style={headingStyle}>Welcome, {recipientName}!</Heading>
            <Text style={heroSubtextStyle}>{subject}</Text>
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            <Text style={bodyTextStyle}>{body}</Text>

            <Section style={featureGridStyle}>
              {[
                { icon: "✉️", title: "Send Emails", desc: "Compose beautiful emails with live preview" },
                { icon: "📊", title: "Track Status", desc: "Monitor delivery, opens, and bounces" },
                { icon: "🔗", title: "Webhooks", desc: "Real-time event tracking via Resend" },
              ].map((f) => (
                <Section key={f.title} style={featureItemStyle}>
                  <Text style={featureIconStyle}>{f.icon}</Text>
                  <Text style={featureTitleStyle}>{f.title}</Text>
                  <Text style={featureDescStyle}>{f.desc}</Text>
                </Section>
              ))}
            </Section>

            <Section style={{ textAlign: "center", marginTop: "32px" }}>
              <Button style={buttonStyle} href="#">
                Get Started →
              </Button>
            </Section>
          </Section>

          <Hr style={hrStyle} />

          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Sent with ❤️ from{" "}
              <Link href="#" style={{ color: "#818cf8" }}>
                {senderName}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#0f0f1a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: "40px 20px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.1)",
};

const heroStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
  padding: "48px 32px",
  textAlign: "center",
};

const emojiStyle: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 0 16px 0",
  display: "block",
};

const headingStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "800",
  margin: "0 0 8px 0",
  letterSpacing: "-1px",
};

const heroSubtextStyle: React.CSSProperties = {
  color: "#a5b4fc",
  fontSize: "16px",
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  backgroundColor: "#13131f",
  padding: "36px 32px",
};

const bodyTextStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: "16px",
  lineHeight: "1.75",
  marginBottom: "28px",
};

const featureGridStyle: React.CSSProperties = {
  display: "block",
};

const featureItemStyle: React.CSSProperties = {
  backgroundColor: "#1e1e2e",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "12px",
};

const featureIconStyle: React.CSSProperties = {
  fontSize: "24px",
  margin: "0 0 6px 0",
};

const featureTitleStyle: React.CSSProperties = {
  color: "#e2e8f0",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 4px 0",
};

const featureDescStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "13px",
  margin: 0,
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "13px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const hrStyle: React.CSSProperties = {
  borderColor: "rgba(255,255,255,0.08)",
  margin: 0,
};

const footerStyle: React.CSSProperties = {
  backgroundColor: "#0d0d18",
  padding: "20px 32px",
  textAlign: "center",
};

const footerTextStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "12px",
  margin: 0,
};

export default WelcomeEmail;
