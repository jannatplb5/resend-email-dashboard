import { NextResponse } from "next/server";
import { emailStore } from "@/lib/email-store";

export async function GET() {
  try {
    const logs = emailStore.getAll();
    return NextResponse.json({ logs, total: logs.length });
  } catch (err) {
    console.error("[emails] Error fetching logs:", err);
    return NextResponse.json({ error: "Failed to fetch email logs" }, { status: 500 });
  }
}
