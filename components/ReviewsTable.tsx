"use client";

import { formatDate } from "@/lib/formatDate";
import type { AdminReviewWithAuthor } from "@/hooks/useAdminReviews";

export function ReviewsTable({ reviews }: { reviews: AdminReviewWithAuthor[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] border-collapse text-left">
          <thead className="bg-surface-variant/60">
            <tr className="text-xs font-semibold text-muted">
              <th scope="col" className="px-4 py-3 first:pl-5">Author</th>
              <th scope="col" className="px-4 py-3">Subject</th>
              <th scope="col" className="px-4 py-3">Description</th>
              <th scope="col" className="px-4 py-3">Votes</th>
              <th scope="col" className="px-4 py-3 last:pr-5">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {reviews.map((review) => (
              <tr key={review.id} className="transition hover:bg-surface-variant/40">
                <td className="px-4 py-3.5 first:pl-5">
                  <span className="block max-w-[10rem] truncate text-sm font-bold text-ink">
                    {review.authorName}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="block max-w-[12rem] truncate text-sm text-ink">{review.subject}</span>
                </td>
                <td className="px-4 py-3.5">
                  <p className="max-w-[18rem] truncate text-sm text-muted">{review.description || "—"}</p>
                </td>
                <td className="px-4 py-3.5">
                  <VoteCountBadge count={review.voteCount} />
                </td>
                <td className="px-4 py-3.5 last:pr-5">
                  <span className="text-sm text-muted">{formatDate(review.created_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VoteCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface-variant px-2 py-0.5 text-xs font-semibold text-muted">
      {count}
    </span>
  );
}

export function ReviewsTableSkeleton() {
  return (
    <div className="card overflow-hidden" aria-busy="true" aria-label="Loading reviews">
      <div className="divide-y divide-line">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="h-3.5 w-24 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-32 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-variant" />
            </div>
            <div className="h-5 w-10 shrink-0 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-16 shrink-0 animate-pulse rounded-full bg-surface-variant" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewsEmptyState() {
  return (
    <div className="card px-6 py-16 text-center">
      <p className="text-sm font-semibold text-ink">No reviews yet.</p>
    </div>
  );
}

export function ReviewsErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card px-6 py-16 text-center">
      <p role="alert" className="text-sm font-semibold text-ink">{message}</p>
      <button type="button" onClick={onRetry} className="dash-btn-secondary mt-4 min-h-9">
        Try again
      </button>
    </div>
  );
}
