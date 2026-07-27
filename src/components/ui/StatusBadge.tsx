import { cn, statusConfig } from "@/lib/utils";
import { EmailStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: EmailStatus;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.bg,
        config.color,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            config.dot,
            status === "sent" || status === "pending" ? "pulse-dot" : ""
          )}
        />
      )}
      {config.label}
    </span>
  );
}
