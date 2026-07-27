import { EmailLog, EmailStatus } from "./types";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.DB_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.DB_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL or Key is missing. EmailStore will fail.");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

function mapToDb(log: Partial<EmailLog>) {
  return {
    id: log.id,
    resend_id: log.resendId,
    direction: log.direction,
    to_address: log.to,
    from_address: log.from,
    subject: log.subject,
    body: log.body,
    html_content: log.htmlContent,
    status: log.status,
    created_at: log.createdAt ? log.createdAt.toISOString() : undefined,
    updated_at: log.updatedAt ? log.updatedAt.toISOString() : undefined,
    delivered_at: log.deliveredAt ? log.deliveredAt.toISOString() : undefined,
    opened_at: log.openedAt ? log.openedAt.toISOString() : undefined,
  };
}

function mapFromDb(row: any): EmailLog {
  return {
    id: row.id,
    resendId: row.resend_id,
    direction: (row.direction as "inbound" | "outbound") || "outbound",
    to: row.to_address,
    from: row.from_address,
    subject: row.subject,
    body: row.body,
    htmlContent: row.html_content,
    status: row.status as EmailStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deliveredAt: row.delivered_at ? new Date(row.delivered_at) : undefined,
    openedAt: row.opened_at ? new Date(row.opened_at) : undefined,
  };
}

class EmailStore {
  async add(log: EmailLog): Promise<void> {
    const { error } = await supabase
      .from("email_logs")
      .upsert(mapToDb(log));
      
    if (error) console.error("Error adding to Supabase:", error);
  }

  async getAll(): Promise<EmailLog[]> {
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching from Supabase:", error);
      return [];
    }

    return (data || []).map(mapFromDb);
  }

  async getById(id: string): Promise<EmailLog | undefined> {
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return mapFromDb(data);
  }

  async getByResendId(resendId: string): Promise<EmailLog | undefined> {
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .eq("resend_id", resendId)
      .single();

    if (error || !data) return undefined;
    return mapFromDb(data);
  }

  async updateStatus(
    resendId: string,
    status: EmailStatus,
    extras?: Partial<EmailLog>
  ): Promise<boolean> {
    const updates = mapToDb({
      ...extras,
      status,
      updatedAt: new Date(),
    });
    
    // Remove undefined values to not overwrite with null
    Object.keys(updates).forEach(key => {
      if ((updates as any)[key] === undefined) delete (updates as any)[key];
    });

    const { error } = await supabase
      .from("email_logs")
      .update(updates)
      .eq("resend_id", resendId);

    if (error) {
      console.error("Error updating status in Supabase:", error);
      return false;
    }
    return true;
  }

  async updateById(id: string, updates: Partial<EmailLog>): Promise<boolean> {
    const dbUpdates = mapToDb({
      ...updates,
      updatedAt: new Date(),
    });

    Object.keys(dbUpdates).forEach(key => {
      if ((dbUpdates as any)[key] === undefined) delete (dbUpdates as any)[key];
    });

    const { error } = await supabase
      .from("email_logs")
      .update(dbUpdates)
      .eq("id", id);

    if (error) {
      console.error("Error updating by id in Supabase:", error);
      return false;
    }
    return true;
  }

  async count(): Promise<number> {
    const { count, error } = await supabase
      .from("email_logs")
      .select("*", { count: "exact", head: true });
      
    if (error) return 0;
    return count || 0;
  }
}

export const emailStore = new EmailStore();
