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

interface GenericEmailProps {
  subject?: string;
  body?: string;
  senderName?: string;
  recipientName?: string;
}

export function GenericEmail({
  subject = "Hello from the Dashboard",
  body = "This is a message sent from your email dashboard.",
  senderName = "Email Dashboard",
  recipientName,
}: GenericEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{subject}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={headingStyle}>{senderName}</Heading>
            <Text style={subjectStyle}>{subject}</Text>
          </Section>

          {/* Body */}
          <Section style={contentStyle}>
            {recipientName && (
              <Text style={greetingStyle}>Hi {recipientName},</Text>
            )}
            <Text style={bodyTextStyle}>{body}</Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Sent via{" "}
              <Link href="#" style={{ color: "#818cf8" }}>
                Email Dashboard
              </Link>{" "}
              · Powered by Resend
            </Text>
            <Text style={copyrightStyle}>
              © {new Date().getFullYear()} Email Dashboard. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Inline styles for email compatibility
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

const headerStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  padding: "32px",
};

const headingStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 6px 0",
  letterSpacing: "-0.5px",
};

const subjectStyle: React.CSSProperties = {
  color: "#c4b5fd",
  fontSize: "14px",
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  backgroundColor: "#13131f",
  padding: "32px",
};

const greetingStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "14px",
  marginBottom: "16px",
};

const bodyTextStyle: React.CSSProperties = {
  color: "#e2e8f0",
  fontSize: "16px",
  lineHeight: "1.75",
  whiteSpace: "pre-wrap",
};

const hrStyle: React.CSSProperties = {
  borderColor: "rgba(255,255,255,0.08)",
  margin: 0,
};

const footerStyle: React.CSSProperties = {
  backgroundColor: "#0d0d18",
  padding: "24px 32px",
};

const footerTextStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "12px",
  textAlign: "center",
  margin: "0 0 6px 0",
};

const copyrightStyle: React.CSSProperties = {
  color: "#334155",
  fontSize: "11px",
  textAlign: "center",
  margin: 0,
};

export default GenericEmail;
