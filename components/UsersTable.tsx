"use client";

import { UserAvatar } from "@/components/UserAvatar";
import { getRelativeTimeLabel, isInactiveOverDays } from "@/lib/relativeTime";
import {
  type AdminUser,
  type FollowupsView,
  type ProspectsView,
  getFollowupsCount,
  getProspectsCount,
} from "@/types/admin";

const prospectsOptions: { value: ProspectsView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "product", label: "Product" },
  { value: "recruitment", label: "Recruitment" },
];

const followupsOptions: { value: FollowupsView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "missed", label: "Missed" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
];

export function UsersTable({
  users,
  prospectsView,
  onProspectsViewChange,
  followupsView,
  onFollowupsViewChange,
  onRowClick,
}: {
  users: AdminUser[];
  prospectsView: ProspectsView;
  onProspectsViewChange: (view: ProspectsView) => void;
  followupsView: FollowupsView;
  onFollowupsViewChange: (view: FollowupsView) => void;
  onRowClick: (user: AdminUser) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left">
          <thead className="bg-surface-variant/60">
            <tr className="text-xs font-semibold text-muted">
              <th scope="col" className="px-4 py-3 first:pl-5">User</th>
              <th scope="col" className="px-4 py-3">
                <ViewSelect label="Prospects" value={prospectsView} options={prospectsOptions} onChange={onProspectsViewChange} />
              </th>
              <th scope="col" className="px-4 py-3">
                <ViewSelect label="Follow-ups" value={followupsView} options={followupsOptions} onChange={onFollowupsViewChange} />
              </th>
              <th scope="col" className="px-4 py-3 last:pr-5">Last active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr
                key={user.id}
                tabIndex={0}
                role="link"
                aria-label={`View ${user.name ?? user.email} details`}
                onClick={() => onRowClick(user)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(user);
                  }
                }}
                className="cursor-pointer transition hover:bg-surface-variant/55 focus-visible:bg-surface-variant/55 focus-visible:outline-none"
              >
                <td className="px-4 py-3.5 first:pl-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{user.name ?? "Unnamed"}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-semibold text-ink">{getProspectsCount(user, prospectsView)}</span>
                </td>
                <td className="px-4 py-3.5">
                  <FollowupsCell user={user} view={followupsView} />
                </td>
                <td className="px-4 py-3.5 last:pr-5">
                  <LastActiveCell lastActiveAt={user.lastActiveAt} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FollowupsCell({ user, view }: { user: AdminUser; view: FollowupsView }) {
  const count = getFollowupsCount(user, view);
  const isMissed = view === "missed" && count > 0;
  return <span className={`text-sm font-semibold ${isMissed ? "text-red-600" : "text-ink"}`}>{count}</span>;
}

function LastActiveCell({ lastActiveAt }: { lastActiveAt: string | null }) {
  const inactive = isInactiveOverDays(lastActiveAt, 7);
  return (
    <span className={`text-sm ${inactive ? "font-medium text-muted/70" : "font-semibold text-ink"}`}>
      {getRelativeTimeLabel(lastActiveAt)}
    </span>
  );
}

function ViewSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-xs font-semibold text-ink outline-none focus:border-brand"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export function UsersTableSkeleton() {
  return (
    <div className="card overflow-hidden" aria-busy="true" aria-label="Loading users">
      <div className="divide-y divide-line">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded-full bg-surface-variant" />
              <div className="h-3 w-44 animate-pulse rounded-full bg-surface-variant" />
            </div>
            <div className="h-3.5 w-8 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-8 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-20 shrink-0 animate-pulse rounded-full bg-surface-variant" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UsersEmptyState({ hasSearch, onClearSearch }: { hasSearch: boolean; onClearSearch: () => void }) {
  return (
    <div className="card px-6 py-16 text-center">
      <p className="text-sm font-semibold text-ink">{hasSearch ? "No users match your search." : "No users yet."}</p>
      {hasSearch && (
        <button type="button" onClick={onClearSearch} className="mt-4 text-sm font-bold text-brand hover:underline">
          Clear search
        </button>
      )}
    </div>
  );
}

export function UsersErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card px-6 py-16 text-center">
      <p role="alert" className="text-sm font-semibold text-ink">{message}</p>
      <button type="button" onClick={onRetry} className="dash-btn-secondary mt-4 min-h-9">
        Try again
      </button>
    </div>
  );
}
