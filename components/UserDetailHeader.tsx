"use client";

import { UserAvatar } from "@/components/UserAvatar";
import { getRelativeTimeLabel, isInactiveOverDays } from "@/lib/relativeTime";
import type { AdminUserDetail } from "@/types/admin";

export function UserDetailHeader({ user }: { user: AdminUserDetail }) {
  const inactive = isInactiveOverDays(user.lastActiveAt, 7);

  return (
    <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <UserAvatar name={user.name} email={user.email} avatarUrl={user.avatarUrl} size={56} />
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-ink">{user.name ?? "Unnamed"}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </div>
      <div className="shrink-0 sm:text-right">
        <p className="text-xs font-semibold text-muted">Last active</p>
        <p className={`text-sm ${inactive ? "font-medium text-muted/70" : "font-semibold text-ink"}`}>
          {getRelativeTimeLabel(user.lastActiveAt)}
        </p>
      </div>
    </div>
  );
}

export function UserDetailHeaderSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-5" aria-busy="true" aria-label="Loading user">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-surface-variant" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-40 animate-pulse rounded-full bg-surface-variant" />
        <div className="h-3 w-52 animate-pulse rounded-full bg-surface-variant" />
      </div>
    </div>
  );
}
