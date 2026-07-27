"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendEmailSchema, SendEmailFormValues } from "@/lib/validations";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  { value: "generic", label: "Generic Email", emoji: "✉️" },
  { value: "welcome", label: "Welcome Email", emoji: "🎉" },
  { value: "notification", label: "Notification", emoji: "🔔" },
] as const;

interface ComposerFormProps {
  onFormChange: (values: Partial<SendEmailFormValues>) => void;
}

export function ComposerForm({ onFormChange }: ComposerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SendEmailFormValues>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      template: "generic" as const,
      from: "",
      to: "",
      subject: "",
      body: "",
    },
  });

  // Propagate form changes to parent for live preview
  const formValues = watch();
  const handleChange = () => {
    onFormChange(watch());
  };

  const onSubmit = async (data: SendEmailFormValues) => {
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to send email");
      }

      toast.success("Email sent successfully! 🚀", {
        description: `Delivered to ${data.to}`,
      });
      reset({ template: "generic" as const, from: "", to: "", subject: "", body: "" });
      onFormChange({ template: "generic" });
    } catch (err) {
      toast.error("Failed to send email", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={handleChange}
      className="flex flex-col gap-5 h-full"
    >
      {/* Template Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Template
        </label>
        <div className="flex gap-2">
          {TEMPLATES.map((t) => {
            const isSelected = watch("template") === t.value;
            return (
              <label
                key={t.value}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all",
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                    : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-slate-300"
                )}
              >
                <input
                  type="radio"
                  value={t.value}
                  {...register("template")}
                  className="sr-only"
                />
                <span>{t.emoji}</span>
                <span className="hidden sm:inline text-xs">{t.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* To */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          To <span className="text-red-400">*</span>
        </label>
        <input
          {...register("to")}
          type="email"
          placeholder="recipient@example.com"
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all",
            "focus:border-indigo-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20",
            errors.to
              ? "border-red-500/50 bg-red-500/5"
              : "border-white/[0.08]"
          )}
        />
        {errors.to && (
          <p className="text-xs text-red-400">{errors.to.message}</p>
        )}
      </div>

      {/* From */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          From{" "}
          <span className="normal-case font-normal text-slate-600">
            (optional — defaults to onboarding@resend.dev)
          </span>
        </label>
        <input
          {...register("from")}
          type="email"
          placeholder="you@yourdomain.com"
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all",
            "focus:border-indigo-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20",
            errors.from
              ? "border-red-500/50 bg-red-500/5"
              : "border-white/[0.08]"
          )}
        />
        {errors.from && (
          <p className="text-xs text-red-400">{errors.from.message}</p>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Subject <span className="text-red-400">*</span>
        </label>
        <input
          {...register("subject")}
          type="text"
          placeholder="Enter email subject..."
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all",
            "focus:border-indigo-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20",
            errors.subject
              ? "border-red-500/50 bg-red-500/5"
              : "border-white/[0.08]"
          )}
        />
        {errors.subject && (
          <p className="text-xs text-red-400">{errors.subject.message}</p>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col space-y-1.5 min-h-0">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Message Body <span className="text-red-400">*</span>
        </label>
        <textarea
          {...register("body")}
          placeholder="Write your email message here..."
          className={cn(
            "flex-1 min-h-[180px] w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all resize-none font-mono leading-relaxed",
            "focus:border-indigo-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20",
            errors.body
              ? "border-red-500/50 bg-red-500/5"
              : "border-white/[0.08]"
          )}
        />
        {errors.body && (
          <p className="text-xs text-red-400">{errors.body.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200",
          "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25",
          "hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/35",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-violet-600"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Email
          </>
        )}
      </button>
    </form>
  );
}
