"use client";

import { Pagination } from "@/components/Pagination";
import { formatDate } from "@/lib/formatDate";
import type { AdminFollowupListItem, PaginatedList } from "@/types/admin";

export function FollowupsCard({
  list,
  onPageChange,
}: {
  list: PaginatedList<AdminFollowupListItem>;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-5 py-3">
        <h2 className="text-sm font-bold text-ink">Follow-ups</h2>
      </div>

      {list.data.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm font-medium text-muted">No follow-ups yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left">
            <thead className="bg-surface-variant/60">
              <tr className="text-xs font-semibold text-muted">
                <th scope="col" className="px-4 py-2.5 first:pl-5">Title</th>
                <th scope="col" className="px-4 py-2.5">Due date</th>
                <th scope="col" className="px-4 py-2.5 last:pr-5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.data.map((followup) => (
                <tr key={followup.id}>
                  <td className="px-4 py-3 first:pl-5">
                    <p className="truncate text-sm font-semibold text-ink">{followup.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-ink">{formatDate(followup.dueDate)}</span>
                  </td>
                  <td className="px-4 py-3 last:pr-5">
                    <span className="text-sm text-muted">{formatDate(followup.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-5 pb-4">
        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          onPageChange={onPageChange}
          itemLabel="follow-up"
        />
      </div>
    </div>
  );
}

export function FollowupsCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-busy="true" aria-label="Loading follow-ups">
      <div className="border-b border-line px-5 py-3">
        <h2 className="text-sm font-bold text-ink">Follow-ups</h2>
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-3.5">
            <div className="h-3.5 w-32 flex-1 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-20 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-20 animate-pulse rounded-full bg-surface-variant" />
          </div>
        ))}
      </div>
    </div>
  );
}
