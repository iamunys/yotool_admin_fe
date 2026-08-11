export type ProspectStatusCounts = {
  new_lead: number;
  invited: number;
  plan_presented: number;
  follow_up: number;
  interested: number;
  closed: number;
  not_interested: number;
  not_now: number;
  total: number;
};

export type AdminUserFollowupCounts = {
  missed: number;
  today: number;
  upcoming: number;
  all: number;
};

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  prospectCounts: {
    product: ProspectStatusCounts;
    recruitment: ProspectStatusCounts;
  };
  followupCounts: AdminUserFollowupCounts;
  lastActiveAt: string | null;
};

export type PaginatedAdminUsers = {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProspectsView = "all" | "product" | "recruitment";
export type FollowupsView = "all" | "missed" | "today" | "upcoming";

export function getProspectsCount(user: AdminUser, view: ProspectsView): number {
  if (view === "product") return user.prospectCounts.product.total;
  if (view === "recruitment") return user.prospectCounts.recruitment.total;
  return user.prospectCounts.product.total + user.prospectCounts.recruitment.total;
}

export function getFollowupsCount(user: AdminUser, view: FollowupsView): number {
  return user.followupCounts[view];
}

export type PaginatedList<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminProspectListItem = {
  id: string;
  name: string;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export const PROSPECT_STATUSES = [
  "new_lead",
  "invited",
  "plan_presented",
  "follow_up",
  "interested",
  "closed",
  "not_interested",
  "not_now",
] as const;

export type AdminProspectType = "product" | "recruitment";

export const PROSPECT_PRIORITIES = ["low", "high"] as const;

export type AdminProspectPriority = (typeof PROSPECT_PRIORITIES)[number];

export type AdminProspectAddedBy = {
  id: string;
  name: string | null;
  email: string | null;
};

// Distinct from AdminProspectListItem: that type models the prospects
// nested under a user in GET /admin/users/:id (no owner, no type field).
// This models the flat, cross-user GET /admin/prospects list, which has
// an owning user (addedBy) and an explicit prospectType per row.
export type AdminProspect = {
  id: string;
  name: string;
  status: string | null;
  prospectType: AdminProspectType | null;
  priority: AdminProspectPriority | null;
  lastContactedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  addedBy: AdminProspectAddedBy;
};

export type AdminFollowupListItem = {
  id: string;
  title: string;
  dueDate: string | null;
  createdAt: string | null;
};

export type AdminUserDetail = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  lastActiveAt: string | null;
};

export type ProspectTab = "product" | "recruitment";
