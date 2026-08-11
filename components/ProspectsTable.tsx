"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate, formatStatusLabel } from "@/lib/formatDate";
import type { AdminProspect } from "@/types/admin";

export function ProspectsTable({ prospects }: { prospects: AdminProspect[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead className="bg-surface-variant/60">
            <tr className="text-xs font-semibold text-muted">
              <th scope="col" className="px-4 py-3 first:pl-5">Prospect</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Priority</th>
              <th scope="col" className="px-4 py-3">Added by</th>
              <th scope="col" className="px-4 py-3">Created</th>
              <th scope="col" className="px-4 py-3 last:pr-5">Last contacted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {prospects.map((prospect) => (
              <tr key={prospect.id} className="transition hover:bg-surface-variant/40">
                <td className="px-4 py-3.5 first:pl-5">
                  <p className="max-w-[16rem] truncate text-sm font-bold text-ink">{prospect.name}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-ink">{formatProspectType(prospect.prospectType)}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-ink">{formatStatusLabel(prospect.status)}</span>
                </td>
                <td className="px-4 py-3.5">
                  <PriorityBadge priority={prospect.priority} />
                </td>
                <td className="px-4 py-3.5">
                  <AddedByCell addedBy={prospect.addedBy} />
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-muted">{formatDate(prospect.createdAt)}</span>
                </td>
                <td className="px-4 py-3.5 last:pr-5">
                  <span className="text-sm text-muted">{formatDate(prospect.lastContactedAt)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatProspectType(type: AdminProspect["prospectType"]): string {
  if (type === "product") return "Product";
  if (type === "recruitment") return "Recruitment";
  return "—";
}

function PriorityBadge({ priority }: { priority: AdminProspect["priority"] }) {
  if (!priority) return <span className="text-sm text-muted">—</span>;
  const isHigh = priority === "high";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        isHigh ? "bg-accent/15 text-accent-dark" : "bg-surface-variant text-muted"
      }`}
    >
      {isHigh ? "High" : "Low"}
    </span>
  );
}

function AddedByCell({ addedBy }: { addedBy: AdminProspect["addedBy"] }) {
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

export function ProspectsTableSkeleton() {
  return (
    <div className="card overflow-hidden" aria-busy="true" aria-label="Loading prospects">
      <div className="divide-y divide-line">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-variant" />
            </div>
            <div className="h-3.5 w-16 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-20 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-5 w-12 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-7 w-32 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-16 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-16 shrink-0 animate-pulse rounded-full bg-surface-variant" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProspectsEmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <div className="card px-6 py-16 text-center">
      <p className="text-sm font-semibold text-ink">
        {hasFilters ? "No prospects match your filters." : "No prospects yet."}
      </p>
      {hasFilters && (
        <button type="button" onClick={onClearFilters} className="mt-4 text-sm font-bold text-brand hover:underline">
          Clear filters
        </button>
      )}
    </div>
  );
}

export function ProspectsErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card px-6 py-16 text-center">
      <p role="alert" className="text-sm font-semibold text-ink">{message}</p>
      <button type="button" onClick={onRetry} className="dash-btn-secondary mt-4 min-h-9">
        Try again
      </button>
    </div>
  );
}
