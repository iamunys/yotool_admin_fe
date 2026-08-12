"use client";

import { Pagination } from "@/components/Pagination";
import { formatActivityDetail, formatEventType } from "@/lib/formatActivity";
import { getRelativeTimeLabel } from "@/lib/relativeTime";
import type { AdminActivityListItem, PaginatedList } from "@/types/admin";

export function ActivityCard({
  list,
  onPageChange,
}: {
  list: PaginatedList<AdminActivityListItem>;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-5 py-3">
        <h2 className="text-sm font-bold text-ink">Activity</h2>
      </div>

      {list.data.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm font-medium text-muted">No activity yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left">
            <thead className="bg-surface-variant/60">
              <tr className="text-xs font-semibold text-muted">
                <th scope="col" className="px-4 py-2.5 first:pl-5">Event</th>
                <th scope="col" className="px-4 py-2.5 last:pr-5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.data.map((activity, index) => {
                const detail = formatActivityDetail(activity.metadata);
                return (
                  <tr key={`${activity.createdAt ?? "unknown"}-${index}`}>
                    <td className="px-4 py-3 first:pl-5">
                      <p className="text-sm font-semibold text-ink">
                        {formatEventType(activity.eventType)}
                        {detail && <span className="ml-1.5 font-normal text-muted">{detail}</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3 last:pr-5">
                      <span className="text-sm text-muted">{getRelativeTimeLabel(activity.createdAt)}</span>
                    </td>
                  </tr>
                );
              })}
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
          itemLabel="event"
        />
      </div>
    </div>
  );
}

export function ActivityCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-busy="true" aria-label="Loading activity">
      <div className="border-b border-line px-5 py-3">
        <h2 className="text-sm font-bold text-ink">Activity</h2>
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-3.5">
            <div className="h-3.5 w-48 flex-1 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-20 animate-pulse rounded-full bg-surface-variant" />
          </div>
        ))}
      </div>
    </div>
  );
}
