export type EmailStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "opened"
  | "bounced"
  | "complained"
  | "failed";

export interface EmailLog {
  id: string;
  resendId?: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  htmlContent?: string;
  status: EmailStatus;
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
  openedAt?: Date;
  deliveredAt?: Date;
}

export interface SendEmailPayload {
  to: string;
  from?: string;
  subject: string;
  body: string;
  template?: "generic" | "welcome" | "notification";
}

export interface WebhookEvent {
  type: string;
  data: {
    email_id: string;
    from?: string;
    to?: string[];
    subject?: string;
    created_at?: string;
    [key: string]: unknown;
  };
}
