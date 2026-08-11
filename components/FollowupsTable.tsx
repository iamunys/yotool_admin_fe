"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/lib/formatDate";
import type { AdminFollowup } from "@/types/admin";

export function FollowupsTable({ followups }: { followups: AdminFollowup[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[64rem] border-collapse text-left">
          <thead className="bg-surface-variant/60">
            <tr className="text-xs font-semibold text-muted">
              <th scope="col" className="px-4 py-3 first:pl-5">Title</th>
              <th scope="col" className="px-4 py-3">Description</th>
              <th scope="col" className="px-4 py-3">Due date</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Prospect</th>
              <th scope="col" className="px-4 py-3">Added by</th>
              <th scope="col" className="px-4 py-3 last:pr-5">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {followups.map((followup) => (
              <tr key={followup.id} className="transition hover:bg-surface-variant/40">
                <td className="px-4 py-3.5 first:pl-5">
                  <p className="max-w-[14rem] truncate text-sm font-bold text-ink">{followup.title}</p>
                </td>
                <td className="px-4 py-3.5">
                  <p className="max-w-[16rem] truncate text-sm text-muted">{followup.description || "—"}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-ink">{formatDate(followup.dueDate)}</span>
                </td>
                <td className="px-4 py-3.5">
                  <FollowupStatusBadge completed={followup.completed} dueDate={followup.dueDate} />
                </td>
                <td className="px-4 py-3.5">
                  <ProspectCell prospect={followup.prospect} />
                </td>
                <td className="px-4 py-3.5">
                  <AddedByCell addedBy={followup.addedBy} />
                </td>
                <td className="px-4 py-3.5 last:pr-5">
                  <span className="text-sm text-muted">{formatDate(followup.createdAt)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function isPastDue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

function FollowupStatusBadge({ completed, dueDate }: { completed: boolean | null; dueDate: string | null }) {
  if (completed) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        Completed
      </span>
    );
  }

  if (isPastDue(dueDate)) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
        Missed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-surface-variant px-2 py-0.5 text-xs font-semibold text-muted">
      Upcoming
    </span>
  );
}

function ProspectCell({ prospect }: { prospect: AdminFollowup["prospect"] }) {
  if (!prospect) return <span className="text-sm text-muted">—</span>;

  return (
    <span className="block max-w-[12rem] truncate text-sm text-ink">
      {prospect.name}
      {prospect.prospectType && (
        <span className="ml-1.5 text-xs font-medium text-muted">
          ({formatProspectType(prospect.prospectType)})
        </span>
      )}
    </span>
  );
}

function formatProspectType(type: NonNullable<AdminFollowup["prospect"]>["prospectType"]): string {
  if (type === "product") return "Product";
  if (type === "recruitment") return "Recruitment";
  return "—";
}

function AddedByCell({ addedBy }: { addedBy: AdminFollowup["addedBy"] }) {
  return (
    <Link
      href={`/users/${addedBy.id}`}
      className="group flex min-w-0 items-center gap-2.5 text-sm"
    >
      <UserAvatar name={addedBy.name} email={addedBy.email ?? ""} size={28} />
      <span className="min-w-0">
        <span className="block max-w-[10rem] truncate font-semibold text-ink group-hover:text-brand group-hover:underline">
          {addedBy.name ?? addedBy.email ?? "Unknown"}
        </span>
        {addedBy.email && addedBy.name && (
          <span className="block max-w-[10rem] truncate text-xs text-muted">{addedBy.email}</span>
        )}
      </span>
    </Link>
  );
}

export function FollowupsTableSkeleton() {
  return (
    <div className="card overflow-hidden" aria-busy="true" aria-label="Loading follow-ups">
      <div className="divide-y divide-line">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-variant" />
            </div>
            <div className="h-3.5 w-24 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-16 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-5 w-20 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-20 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-7 w-32 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-16 shrink-0 animate-pulse rounded-full bg-surface-variant" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FollowupsEmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <div className="card px-6 py-16 text-center">
      <p className="text-sm font-semibold text-ink">
        {hasFilters ? "No follow-ups match your filters." : "No follow-ups yet."}
      </p>
      {hasFilters && (
        <button type="button" onClick={onClearFilters} className="mt-4 text-sm font-bold text-brand hover:underline">
          Clear filters
        </button>
      )}
    </div>
  );
}

export function FollowupsErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card px-6 py-16 text-center">
      <p role="alert" className="text-sm font-semibold text-ink">{message}</p>
      <button type="button" onClick={onRetry} className="dash-btn-secondary mt-4 min-h-9">
        Try again
      </button>
    </div>
  );
}
