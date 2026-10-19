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
  WISHLIST: "bg-neutral-soft text-neutral-soft-foreground",
  APPLIED: "bg-primary-soft text-primary-soft-foreground",
  PHONE_SCREEN: "bg-secondary-soft text-secondary-soft-foreground",
  INTERVIEW: "bg-warning-soft text-warning-soft-foreground",
  TECHNICAL_TEST: "bg-warning-soft text-warning-soft-foreground",
  OFFER: "bg-success-soft text-success-soft-foreground",
  REJECTED: "bg-danger-soft text-danger-soft-foreground",
  WITHDRAWN: "bg-neutral-soft text-neutral-soft-foreground",
};

export function statusBadgeClassName(status: Status) {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[status]}`;
}
