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
  WISHLIST: "bg-border/60 text-muted",
  APPLIED: "bg-indigo-100 text-indigo-800",
  PHONE_SCREEN:
    "bg-purple-100 text-purple-800",
  INTERVIEW:
    "bg-amber-100 text-amber-800",
  TECHNICAL_TEST:
    "bg-amber-100 text-amber-800",
  OFFER: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-border/60 text-muted",
};

export function statusBadgeClassName(status: Status) {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[status]}`;
}
