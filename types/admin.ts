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
