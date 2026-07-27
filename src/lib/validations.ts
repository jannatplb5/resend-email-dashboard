import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z
    .string()
    .min(1, "Recipient email is required")
    .email("Please enter a valid email address"),
  from: z
    .string()
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  body: z
    .string()
    .min(1, "Email body is required")
    .max(50000, "Email body is too long"),
  template: z.enum(["generic", "welcome", "notification"]),
});

export type SendEmailFormValues = z.infer<typeof sendEmailSchema>;
