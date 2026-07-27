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
} from "@react-email/components";
import * as React from "react";

interface NotificationEmailProps {
  subject?: string;
  body?: string;
  senderName?: string;
  recipientName?: string;
}

export function NotificationEmail({
  subject = "Important Notification",
  body = "You have a new notification that requires your attention.",
  senderName = "Email Dashboard",
  recipientName,
}: NotificationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>🔔 {subject}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Alert strip */}
          <Section style={alertStripStyle}>
            <Text style={alertTextStyle}>🔔 NOTIFICATION</Text>
          </Section>

          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={headingStyle}>{subject}</Heading>
            {recipientName && (
              <Text style={toStyle}>For: {recipientName}</Text>
            )}
          </Section>

          {/* Body */}
          <Section style={contentStyle}>
            <Text style={bodyTextStyle}>{body}</Text>

            <Section style={infoBoxStyle}>
              <Text style={infoIconStyle}>ℹ️</Text>
              <Text style={infoTextStyle}>
                This notification was sent from {senderName} via the Email Dashboard.
              </Text>
            </Section>
          </Section>

          <Hr style={hrStyle} />

          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Sent by{" "}
              <Link href="#" style={{ color: "#34d399" }}>
                {senderName}
              </Link>{" "}
              · Manage notifications
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

const alertStripStyle: React.CSSProperties = {
  backgroundColor: "#059669",
  padding: "8px 32px",
};

const alertTextStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "2px",
  margin: 0,
};

const headerStyle: React.CSSProperties = {
  backgroundColor: "#111827",
  padding: "28px 32px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const headingStyle: React.CSSProperties = {
  color: "#f1f5f9",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 6px 0",
};

const toStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "13px",
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  backgroundColor: "#13131f",
  padding: "32px",
};

const bodyTextStyle: React.CSSProperties = {
  color: "#e2e8f0",
  fontSize: "16px",
  lineHeight: "1.75",
  marginBottom: "24px",
  whiteSpace: "pre-wrap",
};

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: "#1e2d3d",
  border: "1px solid rgba(52,211,153,0.2)",
  borderRadius: "10px",
  padding: "16px 20px",
};

const infoIconStyle: React.CSSProperties = {
  fontSize: "18px",
  margin: "0 0 6px 0",
};

const infoTextStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
  margin: 0,
  lineHeight: "1.6",
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

export default NotificationEmail;
