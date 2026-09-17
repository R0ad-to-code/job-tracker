import { Priority } from "@/app/generated/prisma/enums";

export const PRIORITY_ORDER: Priority[] = [Priority.LOW, Priority.MEDIUM, Priority.HIGH];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const PRIORITY_BADGE_STYLES: Record<Priority, string> = {
  LOW: "bg-black/[.05] text-foreground/70 dark:bg-white/[.08]",
  MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  HIGH: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

export function priorityBadgeClassName(priority: Priority) {
  return `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE_STYLES[priority]}`;
}
