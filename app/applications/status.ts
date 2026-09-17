import { RoleType, Status } from "@/app/generated/prisma/enums";

export const STATUS_ORDER: Status[] = [
  Status.WISHLIST,
  Status.APPLIED,
  Status.PHONE_SCREEN,
  Status.INTERVIEW,
  Status.TECHNICAL_TEST,
  Status.OFFER,
  Status.REJECTED,
  Status.WITHDRAWN,
];

export const STATUS_LABELS: Record<Status, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  PHONE_SCREEN: "Phone screen",
  INTERVIEW: "Interview",
  TECHNICAL_TEST: "Technical test",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const ROLE_TYPE_LABELS: Record<RoleType, string> = {
  PM: "PM",
  DEV: "Dev",
};

const STATUS_BADGE_STYLES: Record<Status, string> = {
  WISHLIST: "bg-black/[.05] text-foreground/70 dark:bg-white/[.08]",
  APPLIED: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  PHONE_SCREEN:
    "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
  INTERVIEW:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  TECHNICAL_TEST:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  OFFER: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  WITHDRAWN: "bg-black/[.05] text-foreground/50 dark:bg-white/[.08]",
};

export function statusBadgeClassName(status: Status) {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[status]}`;
}
