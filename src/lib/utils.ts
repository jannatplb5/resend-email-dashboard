import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { EmailStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export const statusConfig: Record<
  EmailStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border border-yellow-400/20",
    dot: "bg-yellow-400",
  },
  sent: {
    label: "Sent",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border border-blue-400/20",
    dot: "bg-blue-400",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border border-emerald-400/20",
    dot: "bg-emerald-400",
  },
  opened: {
    label: "Opened",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border border-purple-400/20",
    dot: "bg-purple-400",
  },
  bounced: {
    label: "Bounced",
    color: "text-red-400",
    bg: "bg-red-400/10 border border-red-400/20",
    dot: "bg-red-400",
  },
  complained: {
    label: "Complained",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border border-orange-400/20",
    dot: "bg-orange-400",
  },
  failed: {
    label: "Failed",
    color: "text-rose-400",
    bg: "bg-rose-400/10 border border-rose-400/20",
    dot: "bg-rose-400",
  },
};
