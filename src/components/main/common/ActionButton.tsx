import React from "react";

export type ActionTone = "brand" | "success" | "warning" | "error" | "info" | "neutral";

const tones: Record<ActionTone, string> = {
  brand: "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25",
  success: "border-success-200 bg-success-50 text-success-700 hover:bg-success-100 dark:border-success-500/30 dark:bg-success-500/15 dark:text-success-300 dark:hover:bg-success-500/25",
  warning: "border-warning-200 bg-warning-50 text-warning-700 hover:bg-warning-100 dark:border-warning-500/30 dark:bg-warning-500/15 dark:text-warning-300 dark:hover:bg-warning-500/25",
  error: "border-error-200 bg-error-50 text-error-700 hover:bg-error-100 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-300 dark:hover:bg-error-500/25",
  info: "border-blue-light-200 bg-blue-light-50 text-blue-light-700 hover:bg-blue-light-100 dark:border-blue-light-500/30 dark:bg-blue-light-500/15 dark:text-blue-light-300 dark:hover:bg-blue-light-500/25",
  neutral: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
};

export const actionButtonClass = (tone: ActionTone = "brand") =>
  `table-action-button inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-xs font-medium transition-colors focus:outline-hidden focus:ring-3 focus:ring-brand-500/15 ${tones[tone]}`;

export default function ActionButton({ children, icon, tone = "brand", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ReactNode;
  tone?: ActionTone;
}) {
  return <button type="button" className={actionButtonClass(tone)} {...props}>
    <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">{icon}</span>
    {children}
  </button>;
}
