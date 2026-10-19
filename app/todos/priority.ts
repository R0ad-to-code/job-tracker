import { Priority } from "@/app/generated/prisma/enums";

export const PRIORITY_ORDER: Priority[] = [Priority.LOW, Priority.MEDIUM, Priority.HIGH];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const PRIORITY_BADGE_STYLES: Record<Priority, string> = {
  LOW: "bg-neutral-soft text-neutral-soft-foreground",
  MEDIUM: "bg-primary-soft text-primary-soft-foreground",
  HIGH: "bg-danger-soft text-danger-soft-foreground",
};

export function priorityBadgeClassName(priority: Priority) {
  return `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE_STYLES[priority]}`;
}
