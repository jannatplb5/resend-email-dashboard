import { EmailLog, EmailStatus } from "./types";

// In-memory store — swap this out for a real DB in production
class EmailStore {
  private logs: Map<string, EmailLog> = new Map();

  add(log: EmailLog): void {
    this.logs.set(log.id, log);
  }

  getAll(): EmailLog[] {
    return Array.from(this.logs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getById(id: string): EmailLog | undefined {
    return this.logs.get(id);
  }

  getByResendId(resendId: string): EmailLog | undefined {
    return Array.from(this.logs.values()).find(
      (log) => log.resendId === resendId
    );
  }

  updateStatus(
    resendId: string,
    status: EmailStatus,
    extras?: Partial<EmailLog>
  ): boolean {
    const log = this.getByResendId(resendId);
    if (!log) return false;

    const updated: EmailLog = {
      ...log,
      ...extras,
      status,
      updatedAt: new Date(),
    };
    this.logs.set(log.id, updated);
    return true;
  }

  updateById(id: string, updates: Partial<EmailLog>): boolean {
    const log = this.logs.get(id);
    if (!log) return false;
    this.logs.set(id, { ...log, ...updates, updatedAt: new Date() });
    return true;
  }

  count(): number {
    return this.logs.size;
  }
}

// Singleton — persists for the lifetime of the server process
const globalForStore = global as unknown as { emailStore?: EmailStore };
if (!globalForStore.emailStore) {
  globalForStore.emailStore = new EmailStore();
}
export const emailStore = globalForStore.emailStore;
