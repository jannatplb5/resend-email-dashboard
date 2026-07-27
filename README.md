# 📧 MailFlow — Email Sending & Tracking Dashboard

A modern, production-ready Email Sending and Receiving/Tracking Dashboard built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Resend**, and **React Email**.

---

## ✨ Features

- ✉️ **Visual Email Composer**: Form with support for dynamic React Email templates (`Generic`, `Welcome`, `Notification`).
- 👁️ **Real-Time Live Preview**: Split-screen editor with live rendering in a sandboxed `<iframe>` and device toggles (Desktop/Mobile).
- 🚀 **Server Actions & API Handler**: Validated payload parsing using Zod & Resend SDK integration.
- ⚡ **Webhook Tracking**: Webhook handler (`/api/webhooks/resend`) with Svix signature verification (`email.sent`, `email.delivered`, `email.opened`, `email.bounced`).
- 📊 **Activity Log Dashboard**: Metric cards, search filtering, status badges, auto-refresh polling, and full HTML preview drawer.

---

## 🛠️ Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd resend
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the root directory:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Email Engine**: Resend & React Email (`@react-email/components`, `@react-email/render`)
- **Webhook Verification**: Svix
- **Validation**: Zod & React Hook Form
- **Icons**: Lucide React
- **Notifications**: Sonner
